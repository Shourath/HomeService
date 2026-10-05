import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: {
          include: { category: true },
        },
        worker: {
          include: {
            certifications: true,
            skills: { include: { service: true } },
          },
        },
        customer: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        offers: {
          include: { worker: true },
        },
        payments: true,
        invoices: true,
        rating: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Fetch booking error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, note, cancellationReason } = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        customer: true,
        worker: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status,
        cancellationReason: cancellationReason || booking.cancellationReason,
        statusHistory: {
          create: {
            status,
            note: note || `Status updated to ${status}`,
            triggeredByUserId: session.userId,
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Notify customer on status update
    if (booking.customer) {
      const messages: Record<string, string> = {
        ACCEPTED: `${booking.worker?.fullName || 'Worker'} has accepted your request.`,
        ON_THE_WAY: `${booking.worker?.fullName || 'Worker'} is on the way to your address.`,
        ARRIVED: `${booking.worker?.fullName || 'Worker'} has arrived at your location.`,
        SERVICE_STARTED: `Service work has commenced for ${booking.service.name}.`,
        COMPLETED: `Work completed by ${booking.worker?.fullName}. Please confirm and process demo payment.`,
        CUSTOMER_CONFIRMED: `Customer confirmed job completion. Payment pending.`,
        CANCELLED: `Booking #${booking.bookingNumber} was cancelled.`,
      };

      if (messages[status]) {
        await createNotification({
          userId: booking.customer.userId,
          title: `Booking Update: ${status.replace(/_/g, ' ')}`,
          message: messages[status],
          type: 'STATUS_UPDATE',
          linkUrl: `/customer/bookings/${booking.id}`,
        });
      }
    }

    // If completed or confirmed, notify worker as well
    if (status === 'CUSTOMER_CONFIRMED' && booking.worker) {
      await createNotification({
        userId: booking.worker.userId,
        title: 'Customer Confirmed Job Completion',
        message: `Customer confirmed work for #${booking.bookingNumber}. Net earnings: ₹${booking.workerEarnings}.`,
        type: 'STATUS_UPDATE',
        linkUrl: `/provider/jobs/${booking.id}`,
      });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
