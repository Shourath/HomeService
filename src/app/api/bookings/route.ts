import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, signToken, COOKIE_NAME } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { rankWorkersForService } from '@/lib/matching';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isEmergency = searchParams.get('isEmergency');

    let whereClause: Record<string, unknown> = {};

    if (session) {
      if (session.role === 'CUSTOMER' && session.customerId) {
        whereClause.customerId = session.customerId;
      } else if (session.role === 'WORKER' && session.workerId) {
        whereClause.workerId = session.workerId;
      }
      // COOPERATIVE_ADMIN and FEDERATION_ADMIN can view all bookings
    } else {
      // In demo environment, guest fallback to primary customer
      const defaultCust = await prisma.customer.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (defaultCust) {
        whereClause.customerId = defaultCust.id;
      }
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (isEmergency === 'true') {
      whereClause.isEmergency = true;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          include: { category: true },
        },
        worker: true,
        customer: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        offers: true,
        payments: true,
        invoices: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    let customerId = session?.customerId;
    let userId = session?.userId;

    if (!customerId && userId) {
      const cust = await prisma.customer.findUnique({ where: { userId } });
      if (cust) {
        customerId = cust.id;
      }
    }

    // In demo / prototype mode, fallback to default customer if no customer session is attached
    if (!customerId) {
      const defaultCust = await prisma.customer.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (defaultCust) {
        customerId = defaultCust.id;
        if (!userId) {
          userId = defaultCust.userId;
        }
      }
    }

    if (!customerId || !userId) {
      return NextResponse.json({ error: 'Customer session required to book' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      workerId,
      scheduledDate,
      scheduledTime,
      customerAddress,
      customerLat,
      customerLng,
      approximateArea,
      issueDescription,
      notes,
      isEmergency = false,
    } = body;

    if (!serviceId || !issueDescription) {
      return NextResponse.json({ error: 'Service and issue description are required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check pricing config and customer subscription
    const pricingConfig = await prisma.pricingConfig.findFirst() || {
      platformFeePct: 5.0,
      cooperativeSharePct: 5.0,
      emergencySurchargePct: 20.0,
    };

    // Check if customer has active family membership (zero emergency surcharge)
    const activeSub = await prisma.subscription.findFirst({
      where: {
        customerId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    });

    const isMember = Boolean(activeSub);
    const emergencySurchargePct = (isEmergency && !isMember) ? pricingConfig.emergencySurchargePct : 0;

    const baseAmount = service.basePrice;
    const emergencyAmount = (baseAmount * emergencySurchargePct) / 100;
    const totalAmount = Math.round(baseAmount + emergencyAmount);

    const platformFee = Math.round((totalAmount * pricingConfig.platformFeePct) / 100);
    const cooperativeShare = Math.round((totalAmount * pricingConfig.cooperativeSharePct) / 100);
    const workerEarnings = totalAmount - platformFee - cooperativeShare;

    // Determine target worker (either chosen worker or top recommended)
    let assignedWorkerId = workerId;
    if (!assignedWorkerId) {
      const ranked = await rankWorkersForService({
        serviceId,
        customerLat: customerLat || 12.9249,
        customerLng: customerLng || 80.1472,
        isEmergency,
      });
      if (ranked.length > 0) {
        assignedWorkerId = ranked[0].workerId;
      }
    }

    const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        workerId: assignedWorkerId,
        serviceId,
        status: 'REQUESTED',
        isEmergency,
        scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
        scheduledTime: scheduledTime || (isEmergency ? 'Immediate SOS' : '10:00 AM'),
        customerAddress: customerAddress || 'Address on file',
        customerLat: customerLat || 12.9249,
        customerLng: customerLng || 80.1472,
        approximateArea: approximateArea || 'Tambaram Zone',
        issueDescription,
        notes,
        totalAmount,
        platformFee,
        cooperativeShare,
        workerEarnings,
        paymentStatus: 'PENDING',
        statusHistory: {
          create: {
            status: 'REQUESTED',
            note: isEmergency ? 'Emergency SOS service requested' : 'Standard service requested',
            triggeredByUserId: userId,
          },
        },
      },
      include: {
        service: true,
        worker: true,
      },
    });

    // Create offer for worker with expiry countdown (2 min for emergency, 10 min for normal)
    if (assignedWorkerId) {
      const expiryMinutes = isEmergency ? 2 : 10;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      await prisma.bookingOffer.create({
        data: {
          bookingId: booking.id,
          workerId: assignedWorkerId,
          status: 'OFFERED',
          expiresAt,
        },
      });

      const worker = await prisma.worker.findUnique({
        where: { id: assignedWorkerId },
      });

      if (worker) {
        await createNotification({
          userId: worker.userId,
          title: isEmergency ? '🚨 URGENT EMERGENCY REQUEST' : 'New Service Request',
          message: `${service.name} requested in ${approximateArea || 'your area'}. Estimated earnings: ₹${workerEarnings}.`,
          type: isEmergency ? 'EMERGENCY' : 'BOOKING',
          linkUrl: `/provider/requests/${booking.id}`,
        });
      }
    }

    await createNotification({
      userId,
      title: 'Booking Requested Successfully',
      message: `Your booking #${bookingNumber} for ${service.name} has been dispatched to cooperative workers.`,
      type: 'BOOKING',
      linkUrl: `/customer/bookings/${booking.id}`,
    });

    const response = NextResponse.json({
      success: true,
      booking,
    });

    // If guest booking, establish demo customer session so user can view booking directly
    if (!session && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { customer: true },
      });
      if (user) {
        const token = await signToken({
          userId: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          customerId: user.customer?.id,
          name: user.customer?.fullName || 'Demo Customer',
          status: user.status,
        });

        response.cookies.set(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
