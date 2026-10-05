import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.pricingConfig.findFirst({
      where: { key: 'DEFAULT' },
    });

    return NextResponse.json({
      success: true,
      config: config || {
        customerAnnualFamilyPrice: 1499,
        workerAnnualMembershipPrice: 499,
        platformFeePct: 5.0,
        cooperativeSharePct: 5.0,
        emergencySurchargePct: 20.0,
      },
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const {
      customerAnnualFamilyPrice,
      workerAnnualMembershipPrice,
      platformFeePct,
      cooperativeSharePct,
      emergencySurchargePct,
    } = await request.json();

    const updated = await prisma.pricingConfig.upsert({
      where: { key: 'DEFAULT' },
      update: {
        customerAnnualFamilyPrice: Number(customerAnnualFamilyPrice),
        workerAnnualMembershipPrice: Number(workerAnnualMembershipPrice),
        platformFeePct: Number(platformFeePct),
        cooperativeSharePct: Number(cooperativeSharePct),
        emergencySurchargePct: Number(emergencySurchargePct),
      },
      create: {
        key: 'DEFAULT',
        customerAnnualFamilyPrice: Number(customerAnnualFamilyPrice) || 1499,
        workerAnnualMembershipPrice: Number(workerAnnualMembershipPrice) || 499,
        platformFeePct: Number(platformFeePct) || 5.0,
        cooperativeSharePct: Number(cooperativeSharePct) || 5.0,
        emergencySurchargePct: Number(emergencySurchargePct) || 20.0,
      },
    });

    await logAudit({
      userId: session.userId,
      role: session.role,
      action: 'PRICING_CONFIG_UPDATED',
      targetEntity: 'PricingConfig',
      details: { ...updated },
    });

    return NextResponse.json({
      success: true,
      message: 'Platform pricing & fee settings updated',
      config: updated,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
