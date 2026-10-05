import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { computeWorkerLevel } from '@/lib/levels';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.workerId) {
      return NextResponse.json({ error: 'Worker session required' }, { status: 401 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: session.workerId },
      include: {
        skills: { include: { service: true } },
        certifications: true,
        trainings: true,
        subscriptions: { where: { status: 'ACTIVE' } },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const verifiedSkills = worker.skills.filter(s => s.isVerified);
    const verifiedCerts = worker.certifications.filter(c => c.status === 'VERIFIED');
    const completedTrainings = worker.trainings.filter(t => t.status === 'COMPLETED');

    const computed = computeWorkerLevel({
      hasVerifiedKyc: worker.kycStatus === 'VERIFIED',
      verifiedSkillsCount: verifiedSkills.length,
      verifiedCertificatesCount: verifiedCerts.length,
      completedTrainingsCount: completedTrainings.length,
      totalJobs: worker.totalJobsCompleted,
      ratingAvg: worker.ratingAvg,
      experienceYears: worker.experienceYears,
    });

    return NextResponse.json({
      success: true,
      worker,
      skills: worker.skills,
      certifications: worker.certifications,
      trainings: worker.trainings,
      levelInfo: computed,
    });
  } catch (error) {
    console.error('Fetch worker skills error:', error);
    return NextResponse.json({ error: 'Failed to fetch worker skills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.workerId) {
      return NextResponse.json({ error: 'Worker session required' }, { status: 401 });
    }

    const { serviceId, experienceYears = 1, certificateTitle, issuingAuthority } = await request.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'Service is required' }, { status: 400 });
    }

    // Check if skill already added
    const existingSkill = await prisma.workerSkill.findFirst({
      where: {
        workerId: session.workerId,
        serviceId,
      },
    });

    let skill = existingSkill;
    if (!existingSkill) {
      skill = await prisma.workerSkill.create({
        data: {
          workerId: session.workerId,
          serviceId,
          experienceYears: Number(experienceYears) || 1,
          isVerified: false, // NEVER auto-verified! Requires admin review
        },
      });
    }

    let cert = null;
    if (certificateTitle) {
      cert = await prisma.workerCertification.create({
        data: {
          workerId: session.workerId,
          certificateTitle,
          issuingAuthority: issuingAuthority || 'Government / Technical Guild',
          status: 'PENDING', // NEVER auto-verified! Requires admin review
        },
      });
    }

    await logAudit({
      userId: session.userId,
      role: 'WORKER',
      action: 'SKILL_UPGRADE_SUBMITTED',
      targetEntity: 'WorkerSkill',
      targetId: skill?.id,
      details: { serviceId, certificateTitle },
    });

    return NextResponse.json({
      success: true,
      message: 'Skill and certificate submitted for cooperative admin verification',
      skill,
      certification: cert,
    });
  } catch (error) {
    console.error('Add worker skill error:', error);
    return NextResponse.json({ error: 'Failed to submit skill' }, { status: 500 });
  }
}
