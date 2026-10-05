import prisma from './prisma';

export async function logAudit({
  userId,
  role,
  action,
  targetEntity,
  targetId,
  details,
  ipAddress,
}: {
  userId?: string | null;
  role?: string | null;
  action: string;
  targetEntity: string;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        role,
        action,
        targetEntity,
        targetId,
        detailsJson: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Audit log failure:', error);
  }
}
