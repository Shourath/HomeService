import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [
      totalWorkers,
      verifiedWorkers,
      pendingWorkers,
      totalCustomers,
      activeSubscriptions,
      totalBookings,
      completedBookings,
      pendingCerts,
      payments,
    ] = await Promise.all([
      prisma.worker.count(),
      prisma.worker.count({ where: { kycStatus: 'VERIFIED' } }),
      prisma.worker.count({ where: { kycStatus: 'PENDING' } }),
      prisma.customer.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED'] } } }),
      prisma.workerCertification.count({ where: { status: 'PENDING' } }),
      prisma.payment.findMany({ select: { amount: true } }),
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
    const cooperativeFund = Math.round(totalRevenue * 0.05);

    return NextResponse.json({
      success: true,
      stats: {
        totalWorkers,
        verifiedWorkers,
        pendingWorkers,
        totalCustomers,
        activeSubscriptions,
        totalBookings,
        completedBookings,
        pendingCertificates: pendingCerts,
        totalVolume: totalRevenue,
        cooperativeWelfareFund: cooperativeFund,
      },
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
