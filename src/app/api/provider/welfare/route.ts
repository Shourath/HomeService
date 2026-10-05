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

    const schemes = await prisma.welfareScheme.findMany();
    const enrolledWelfare = await prisma.workerWelfare.findMany({
      where: { workerId: session.workerId },
      include: { scheme: true },
    });

    const insuranceCoverages = await prisma.insuranceCoverage.findMany({
      where: { workerId: session.workerId },
      include: {
        claims: { orderBy: { filedAt: 'desc' } },
      },
    });

    return NextResponse.json({
      success: true,
      schemes,
      enrolledWelfare,
      insuranceCoverages,
    });
  } catch (error) {
    console.error('Fetch welfare error:', error);
    return NextResponse.json({ error: 'Failed to fetch welfare data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.workerId) {
      return NextResponse.json({ error: 'Worker session required' }, { status: 401 });
    }

    const { coverageId, claimAmount, reason, incidentDate, notes } = await request.json();

    if (!coverageId || !claimAmount || !reason) {
      return NextResponse.json({ error: 'Coverage ID, claim amount, and reason are required' }, { status: 400 });
    }

    const claim = await prisma.insuranceClaim.create({
      data: {
        coverageId,
        workerId: session.workerId,
        claimAmount: Number(claimAmount),
        reason,
        incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
        status: 'PENDING',
        notes,
      },
    });

    await logAudit({
      userId: session.userId,
      role: 'WORKER',
      action: 'INSURANCE_CLAIM_FILED',
      targetEntity: 'InsuranceClaim',
      targetId: claim.id,
      details: { claimAmount, reason },
    });

    return NextResponse.json({
      success: true,
      message: 'Mutual aid claim submitted to cooperative welfare desk for processing',
      claim,
    });
  } catch (error) {
    console.error('File claim error:', error);
    return NextResponse.json({ error: 'Failed to submit insurance claim' }, { status: 500 });
  }
}
