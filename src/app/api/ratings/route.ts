import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Customer session required' }, { status: 401 });
    }

    const {
      bookingId,
      qualityScore = 5,
      professionalismScore = 5,
      timelinessScore = 5,
      comment,
    } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { worker: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.workerId) {
      return NextResponse.json({ error: 'No worker assigned to this booking' }, { status: 400 });
    }

    const averageScore = Math.round(((qualityScore + professionalismScore + timelinessScore) / 3) * 10) / 10;

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        bookingId: booking.id,
        customerId: session.customerId,
        workerId: booking.workerId,
        qualityScore,
        professionalismScore,
        timelinessScore,
        averageScore,
        comment,
      },
    });

    // Recompute worker average rating
    const allRatings = await prisma.rating.findMany({
      where: { workerId: booking.workerId },
      select: { averageScore: true },
    });

    const newCount = allRatings.length;
    const sum = allRatings.reduce((acc, r) => acc + r.averageScore, 0);
    const newAverage = Math.round((sum / newCount) * 10) / 10;

    await prisma.worker.update({
      where: { id: booking.workerId },
      data: {
        ratingAvg: newAverage,
        ratingCount: newCount,
      },
    });

    // Update booking status to RATED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'RATED',
        statusHistory: {
          create: {
            status: 'RATED',
            note: `Customer rated ${averageScore}★: "${comment || 'No comment'}"`,
            triggeredByUserId: session.userId,
          },
        },
      },
    });

    await logAudit({
      userId: session.userId,
      role: 'CUSTOMER',
      action: 'BOOKING_RATED',
      targetEntity: 'Rating',
      targetId: rating.id,
      details: { averageScore, workerId: booking.workerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for supporting cooperative workers with your feedback!',
      rating,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
