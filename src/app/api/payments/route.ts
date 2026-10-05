import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { bookingId, paymentMethod = 'UPI', upiId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        customer: true,
        worker: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const effectiveUserId = session?.userId || booking.customer?.userId;
    const effectiveRole = session?.role || 'CUSTOMER';

    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;
    const transactionRef = `${paymentMethod}-SANDBOX-TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        bookingId: booking.id,
        customerId: booking.customerId,
        workerId: booking.workerId,
        amount: booking.totalAmount,
        paymentMethod,
        transactionRef,
        status: 'SUCCESS',
        isDemo: true,
        breakdownJson: JSON.stringify({
          serviceName: booking.service.name,
          baseRate: booking.totalAmount - booking.platformFee - booking.cooperativeShare,
          platformFee: booking.platformFee,
          cooperativeShare: booking.cooperativeShare,
          workerNetPay: booking.workerEarnings,
          payerUpi: upiId || 'customer@okaxis (Demo)',
          gateway: 'SANDBOX_UPI_GATEWAY',
        }),
      },
    });

    // Create Invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId: booking.id,
        customerId: booking.customerId,
        workerId: booking.workerId,
        serviceName: booking.service.name,
        baseAmount: booking.workerEarnings,
        platformFee: booking.platformFee,
        taxAmount: booking.cooperativeShare,
        totalAmount: booking.totalAmount,
        status: 'PAID',
      },
    });

    // Update booking status to PAYMENT_COMPLETED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'PAYMENT_COMPLETED',
        paymentStatus: 'COMPLETED',
        statusHistory: {
          create: {
            status: 'PAYMENT_COMPLETED',
            note: `Payment of ₹${booking.totalAmount} completed via ${paymentMethod} (Sandbox)`,
            triggeredByUserId: effectiveUserId,
          },
        },
      },
    });

    // Update worker stats
    if (booking.workerId) {
      await prisma.worker.update({
        where: { id: booking.workerId },
        data: {
          totalJobsCompleted: { increment: 1 },
          isBusy: false,
        },
      });
    }

    // Notifications
    if (booking.worker) {
      await createNotification({
        userId: booking.worker.userId,
        title: 'Payment Received! 💰',
        message: `₹${booking.workerEarnings} has been credited to your cooperative account for #${booking.bookingNumber}.`,
        type: 'PAYMENT',
        linkUrl: `/provider/earnings`,
      });
    }

    if (booking.customer) {
      await createNotification({
        userId: booking.customer.userId,
        title: 'Payment Successful',
        message: `Invoice #${invoiceNumber} generated for ${booking.service.name}. Total: ₹${booking.totalAmount}.`,
        type: 'PAYMENT',
        linkUrl: `/customer/bookings/${booking.id}`,
      });
    }

    await logAudit({
      userId: effectiveUserId,
      role: effectiveRole,
      action: 'PAYMENT_PROCESSED',
      targetEntity: 'Payment',
      targetId: payment.id,
      details: { amount: booking.totalAmount, bookingId: booking.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      payment,
      invoice,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
