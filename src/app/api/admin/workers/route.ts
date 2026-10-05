import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const workers = await prisma.worker.findMany({
      include: {
        user: { select: { email: true, status: true, createdAt: true } },
        skills: { include: { service: true } },
        certifications: true,
        subscriptions: true,
        cooperative: true,
        society: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, workers });
  } catch (error) {
    console.error('Admin fetch workers error:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { workerId, action, rejectionReason } = await request.json(); // action: 'VERIFY' | 'REJECT'

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { user: true, skills: true },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    if (action === 'VERIFY') {
      // Set KYC to VERIFIED, activate user, upgrade level to Level 2 (Verified)
      const updated = await prisma.worker.update({
        where: { id: workerId },
        data: {
          kycStatus: 'VERIFIED',
          currentLevel: Math.max(worker.currentLevel, 2),
          profileCompletionPct: Math.min(100, worker.profileCompletionPct + 25),
          isAvailable: true,
          isEmergencyAvailable: true,
          user: {
            update: {
              status: 'ACTIVE',
            },
          },
        },
      });

      // Also verify their initial primary skills
      await prisma.workerSkill.updateMany({
        where: { workerId },
        data: {
          isVerified: true,
          verifiedByAdminId: session.userId,
          verifiedAt: new Date(),
        },
      });

      await createNotification({
        userId: worker.userId,
        title: 'KYC Verified by Cooperative! 🎖️',
        message: 'Your documents and background have been verified. You are now a Level 2 Verified Cooperative Worker.',
        type: 'ADMIN',
        linkUrl: '/provider',
      });

      await logAudit({
        userId: session.userId,
        role: session.role,
        action: 'WORKER_KYC_VERIFIED',
        targetEntity: 'Worker',
        targetId: workerId,
      });

      return NextResponse.json({ success: true, message: 'Worker verified successfully', worker: updated });
    } else if (action === 'REJECT') {
      const updated = await prisma.worker.update({
        where: { id: workerId },
        data: {
          kycStatus: 'REJECTED',
          user: {
            update: {
              status: 'SUSPENDED',
            },
          },
        },
      });

      await createNotification({
        userId: worker.userId,
        title: 'KYC Verification Update',
        message: `Your application could not be verified at this time: ${rejectionReason || 'Document clarity issue'}. Please contact your society desk.`,
        type: 'ADMIN',
        linkUrl: '/provider/pending',
      });

      await logAudit({
        userId: session.userId,
        role: session.role,
        action: 'WORKER_KYC_REJECTED',
        targetEntity: 'Worker',
        targetId: workerId,
        details: { reason: rejectionReason },
      });

      return NextResponse.json({ success: true, message: 'Worker rejected', worker: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin update worker error:', error);
    return NextResponse.json({ error: 'Failed to update worker status' }, { status: 500 });
  }
}
