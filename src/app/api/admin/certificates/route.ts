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

    const certificates = await prisma.workerCertification.findMany({
      include: {
        worker: {
          select: {
            id: true,
            fullName: true,
            mobile: true,
            primaryCategory: true,
            currentLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, certificates });
  } catch (error) {
    console.error('Fetch certificates error:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { certificateId, action, rejectionReason } = await request.json(); // action: 'APPROVE' | 'REJECT'

    const cert = await prisma.workerCertification.findUnique({
      where: { id: certificateId },
      include: { worker: true },
    });

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const updatedCert = await prisma.workerCertification.update({
        where: { id: certificateId },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
      });

      // Upgrade worker level to at least Level 3 (Certified) and increase completion %
      const worker = cert.worker;
      const newLevel = Math.max(worker.currentLevel, 3);
      await prisma.worker.update({
        where: { id: worker.id },
        data: {
          currentLevel: newLevel,
          profileCompletionPct: Math.min(100, worker.profileCompletionPct + 15),
        },
      });

      // Also ensure any unverified skills matching this certificate's field are verified
      await prisma.workerSkill.updateMany({
        where: { workerId: worker.id, isVerified: false },
        data: {
          isVerified: true,
          verifiedByAdminId: session.userId,
          verifiedAt: new Date(),
        },
      });

      await createNotification({
        userId: worker.userId,
        title: 'Certificate Approved! 📜',
        message: `Your certificate "${cert.certificateTitle}" has been verified. Your rank has upgraded to Level ${newLevel}!`,
        type: 'ADMIN',
        linkUrl: '/provider/skills',
      });

      await logAudit({
        userId: session.userId,
        role: session.role,
        action: 'CERTIFICATE_APPROVED',
        targetEntity: 'WorkerCertification',
        targetId: cert.id,
      });

      return NextResponse.json({
        success: true,
        message: 'Certificate approved and worker level upgraded',
        certificate: updatedCert,
        workerLevel: newLevel,
      });
    } else if (action === 'REJECT') {
      const updatedCert = await prisma.workerCertification.update({
        where: { id: certificateId },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason || 'Certificate invalid or unreadable',
        },
      });

      await createNotification({
        userId: cert.worker.userId,
        title: 'Certificate Verification Notice',
        message: `Certificate "${cert.certificateTitle}" was not approved: ${rejectionReason || 'Please resubmit legible copy'}.`,
        type: 'ADMIN',
        linkUrl: '/provider/skills',
      });

      await logAudit({
        userId: session.userId,
        role: session.role,
        action: 'CERTIFICATE_REJECTED',
        targetEntity: 'WorkerCertification',
        targetId: cert.id,
        details: { reason: rejectionReason },
      });

      return NextResponse.json({
        success: true,
        message: 'Certificate rejected',
        certificate: updatedCert,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update certificate error:', error);
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
}
