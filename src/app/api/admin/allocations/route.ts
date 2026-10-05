import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const allocations = await prisma.workerAllocation.findMany({
      include: {
        service: true,
        fromZone: true,
        toZone: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, allocations });
  } catch (error) {
    console.error('Fetch allocations error:', error);
    return NextResponse.json({ error: 'Failed to fetch workforce allocations' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { allocationId, action } = await request.json(); // 'APPROVE' | 'REJECT'

    const allocation = await prisma.workerAllocation.findUnique({
      where: { id: allocationId },
      include: { service: true, fromZone: true, toZone: true },
    });

    if (!allocation) {
      return NextResponse.json({ error: 'Allocation recommendation not found' }, { status: 404 });
    }

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.workerAllocation.update({
      where: { id: allocationId },
      data: {
        status,
        reviewedByAdminId: session.userId,
        reviewedAt: new Date(),
      },
    });

    await logAudit({
      userId: session.userId,
      role: session.role,
      action: `ALLOCATION_${status}`,
      targetEntity: 'WorkerAllocation',
      targetId: allocationId,
      details: {
        service: allocation.service.name,
        from: allocation.fromZone.name,
        to: allocation.toZone.name,
        count: allocation.recommendedWorkersCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Workforce allocation ${status.toLowerCase()} successfully`,
      allocation: updated,
    });
  } catch (error) {
    console.error('Update allocation error:', error);
    return NextResponse.json({ error: 'Failed to update allocation' }, { status: 500 });
  }
}
