import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.workerId) {
      return NextResponse.json({ error: 'Worker session required' }, { status: 401 });
    }

    const subscription = await prisma.workerSubscription.findFirst({
      where: {
        workerId: session.workerId,
        status: 'ACTIVE',
      },
      orderBy: { endDate: 'desc' },
    });

    const pricing = await prisma.pricingConfig.findFirst() || { workerAnnualMembershipPrice: 499 };

    return NextResponse.json({
      success: true,
      hasActiveSubscription: Boolean(subscription && subscription.endDate >= new Date()),
      subscription,
      price: pricing.workerAnnualMembershipPrice,
    });
  } catch (error) {
    console.error('Fetch worker membership error:', error);
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session || !session.workerId) {
      return NextResponse.json({ error: 'Worker session required' }, { status: 401 });
    }

    const pricing = await prisma.pricingConfig.findFirst();
    const price = pricing?.workerAnnualMembershipPrice || 499;

    const existing = await prisma.workerSubscription.findFirst({
      where: {
        workerId: session.workerId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    });

    const startDate = existing ? existing.endDate : new Date();
    const endDate = new Date(startDate.getTime() + 365 * 24 * 3600 * 1000);

    let subscription;
    if (existing) {
      subscription = await prisma.workerSubscription.update({
        where: { id: existing.id },
        data: { endDate },
      });
    } else {
      subscription = await prisma.workerSubscription.create({
        data: {
          workerId: session.workerId,
          planType: 'ANNUAL_WORKER',
          price,
          startDate,
          endDate,
          status: 'ACTIVE',
          isDemo: true,
        },
      });
    }

    await logAudit({
      userId: session.userId,
      role: 'WORKER',
      action: 'WORKER_MEMBERSHIP_PURCHASED',
      targetEntity: 'WorkerSubscription',
      targetId: subscription.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Worker annual cooperative membership activated! You are now eligible to receive service orders.',
      subscription,
    });
  } catch (error) {
    console.error('Worker membership purchase error:', error);
    return NextResponse.json({ error: 'Failed to purchase worker membership' }, { status: 500 });
  }
}
