import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Customer session required' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        customerId: session.customerId,
        status: 'ACTIVE',
      },
      include: {
        members: {
          include: { familyMember: true },
        },
      },
      orderBy: { endDate: 'desc' },
    });

    const pricing = await prisma.pricingConfig.findFirst() || {
      customerAnnualFamilyPrice: 1499,
      workerAnnualMembershipPrice: 499,
    };

    return NextResponse.json({
      success: true,
      hasActiveSubscription: Boolean(subscription && subscription.endDate >= new Date()),
      subscription,
      pricing,
    });
  } catch (error) {
    console.error('Fetch subscription error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Customer session required' }, { status: 401 });
    }

    const { planType = 'ANNUAL_FAMILY', paymentMethod = 'UPI' } = await request.json();

    const pricing = await prisma.pricingConfig.findFirst();
    const price = pricing?.customerAnnualFamilyPrice || 1499;

    // Check if existing active subscription to extend or create new
    const existing = await prisma.subscription.findFirst({
      where: {
        customerId: session.customerId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    });

    const startDate = existing ? existing.endDate : new Date();
    const endDate = new Date(startDate.getTime() + 365 * 24 * 3600 * 1000);

    let subscription;
    if (existing) {
      subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          endDate,
          updatedAt: new Date(),
        },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          customerId: session.customerId,
          planType,
          price,
          startDate,
          endDate,
          status: 'ACTIVE',
          isDemo: true,
        },
      });
    }

    // Create demo payment record
    const paymentNumber = `PAY-SUB-${Date.now().toString().slice(-6)}`;
    await prisma.payment.create({
      data: {
        paymentNumber,
        subscriptionId: subscription.id,
        customerId: session.customerId,
        amount: price,
        paymentMethod,
        transactionRef: `UPI-DEMO-SUB-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'SUCCESS',
        isDemo: true,
        breakdownJson: JSON.stringify({
          plan: 'ANNUAL_FAMILY',
          durationDays: 365,
          totalPaid: price,
        }),
      },
    });

    // Create Invoice
    const invoiceNumber = `INV-SUB-${Date.now().toString().slice(-6)}`;
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        subscriptionId: subscription.id,
        customerId: session.customerId,
        serviceName: 'Annual Cooperative Family Membership (1+3 Plan)',
        baseAmount: price,
        platformFee: 0,
        taxAmount: 0,
        totalAmount: price,
        status: 'PAID',
      },
    });

    await logAudit({
      userId: session.userId,
      role: 'CUSTOMER',
      action: 'SUBSCRIPTION_PURCHASE',
      targetEntity: 'Subscription',
      targetId: subscription.id,
      details: { price, planType },
    });

    await createNotification({
      userId: session.userId,
      title: 'Family Membership Activated! 🎉',
      message: `Your Annual Family Membership is active until ${endDate.toLocaleDateString()}. Enjoy priority dispatch and emergency services.`,
      type: 'PAYMENT',
      linkUrl: '/membership',
    });

    return NextResponse.json({
      success: true,
      subscription,
      receiptNumber: paymentNumber,
      invoiceNumber,
    });
  } catch (error) {
    console.error('Subscription purchase error:', error);
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
  }
}
