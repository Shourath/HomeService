import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        customer: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { endDate: 'desc' },
              take: 1,
            },
            familyMembers: true,
          },
        },
        worker: {
          include: {
            skills: {
              include: { service: true },
            },
            certifications: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
        customer: user.customer,
        worker: user.worker,
      },
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
