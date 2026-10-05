import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { rankWorkersForService } from '@/lib/matching';
import { logAudit } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.workerId) {
      return NextResponse.json({ error: 'Worker session required' }, { status: 401 });
    }

    const { action, rejectionReason } = await request.json(); // action: 'ACCEPT' | 'REJECT'

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        customer: true,
        offers: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if job already accepted by another worker
    if (booking.status !== 'REQUESTED') {
      return NextResponse.json({
        error: 'Job already accepted or no longer available (Job taken)',
        jobTaken: true,
      }, { status: 409 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: session.workerId },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    if (action === 'ACCEPT') {
      // Check if worker is offline
      if (worker.isOffline) {
        return NextResponse.json({ error: 'You are currently offline. Please switch to Available to accept jobs.' }, { status: 400 });
      }

      // Update booking to ACCEPTED
      const updatedBooking = await prisma.booking.update({
        where: { id: params.id },
        data: {
          workerId: worker.id,
          status: 'ACCEPTED',
          statusHistory: {
            create: {
              status: 'ACCEPTED',
              note: `Accepted by ${worker.fullName}`,
              triggeredByUserId: session.userId,
            },
          },
        },
      });

      // Update current offer to ACCEPTED
      await prisma.bookingOffer.updateMany({
        where: {
          bookingId: booking.id,
          workerId: worker.id,
        },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      // Expire any other open offers for this booking
      await prisma.bookingOffer.updateMany({
        where: {
          bookingId: booking.id,
          workerId: { not: worker.id },
          status: 'OFFERED',
        },
        data: {
          status: 'EXPIRED',
        },
      });

      // Notify customer
      if (booking.customer) {
        await createNotification({
          userId: booking.customer.userId,
          title: 'Worker Confirmed!',
          message: `${worker.fullName} has accepted your ${booking.service.name} request. Contact details unlocked.`,
          type: 'STATUS_UPDATE',
          linkUrl: `/customer/bookings/${booking.id}`,
        });
      }

      await logAudit({
        userId: session.userId,
        role: 'WORKER',
        action: 'JOB_ACCEPTED',
        targetEntity: 'Booking',
        targetId: booking.id,
      });

      return NextResponse.json({
        success: true,
        message: 'Job accepted successfully',
        booking: updatedBooking,
      });
    } else if (action === 'REJECT') {
      // Worker rejects the offer
      await prisma.bookingOffer.updateMany({
        where: {
          bookingId: booking.id,
          workerId: worker.id,
        },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason || 'Not specified',
          respondedAt: new Date(),
        },
      });

      await logAudit({
        userId: session.userId,
        role: 'WORKER',
        action: 'JOB_REJECTED',
        targetEntity: 'Booking',
        targetId: booking.id,
        details: { reason: rejectionReason },
      });

      // Find all workers who have already received or rejected an offer for this booking
      const pastOffers = await prisma.bookingOffer.findMany({
        where: { bookingId: booking.id },
        select: { workerId: true },
      });
      const excludedWorkerIds = new Set(pastOffers.map(o => o.workerId));
      excludedWorkerIds.add(worker.id);

      // Re-run matching engine to find the next best worker
      const ranked = await rankWorkersForService({
        serviceId: booking.serviceId,
        customerLat: booking.customerLat,
        customerLng: booking.customerLng,
        isEmergency: booking.isEmergency,
      });

      const nextWorkerMatch = ranked.find(r => !excludedWorkerIds.has(r.workerId));

      if (nextWorkerMatch) {
        const expiryMinutes = booking.isEmergency ? 2 : 10;
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        await prisma.bookingOffer.create({
          data: {
            bookingId: booking.id,
            workerId: nextWorkerMatch.workerId,
            status: 'OFFERED',
            expiresAt,
          },
        });

        // Update assigned worker on booking
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            workerId: nextWorkerMatch.workerId,
          },
        });

        const nextWorker = await prisma.worker.findUnique({
          where: { id: nextWorkerMatch.workerId },
        });

        if (nextWorker) {
          await createNotification({
            userId: nextWorker.userId,
            title: booking.isEmergency ? '🚨 URGENT EMERGENCY REQUEST' : 'New Service Request',
            message: `${booking.service.name} requested in ${booking.approximateArea}. Estimated earnings: ₹${booking.workerEarnings}.`,
            type: booking.isEmergency ? 'EMERGENCY' : 'BOOKING',
            linkUrl: `/provider/requests/${booking.id}`,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Offer declined. Passed to next ranked worker.',
        nextWorkerOffered: Boolean(nextWorkerMatch),
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Job offer response error:', error);
    return NextResponse.json({ error: 'Failed to process job offer action' }, { status: 500 });
  }
}
