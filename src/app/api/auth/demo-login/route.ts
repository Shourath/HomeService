import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { accountType } = await request.json();

    let targetEmail: string | null = null;
    let targetMobile: string | null = null;

    switch (accountType) {
      case 'customer':
      case 'customer1':
        targetEmail = 'customer1@homeservice.coop';
        break;
      case 'customer2':
        targetEmail = 'customer2@homeservice.coop';
        break;
      case 'family_member':
        targetMobile = '9876543212';
        break;
      case 'worker':
      case 'kumar_plumber':
        targetEmail = 'kumar.plumber@homeservice.coop';
        break;
      case 'rajesh_electrician':
        targetEmail = 'rajesh.electrician@homeservice.coop';
        break;
      case 'unverified_worker':
        targetEmail = 'ravi.unverified@homeservice.coop';
        break;
      case 'admin':
      case 'coop_admin':
        targetEmail = 'admin@homeservice.coop';
        break;
      case 'federation_admin':
        targetEmail = 'federation@homeservice.coop';
        break;
      default:
        return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: targetEmail ? { email: targetEmail } : { mobile: targetMobile! },
      include: {
        customer: true,
        worker: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo account not found. Please re-seed database.' }, { status: 404 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      customerId: user.customer?.id,
      workerId: user.worker?.id,
      name: user.customer?.fullName || user.worker?.fullName || user.role,
      status: user.status,
    });

    await logAudit({
      userId: user.id,
      role: user.role,
      action: 'DEMO_LOGIN',
      targetEntity: 'User',
      targetId: user.id,
    });

    let redirectUrl = '/customer';
    if (user.role === 'WORKER') {
      redirectUrl = user.status === 'PENDING_VERIFICATION' ? '/provider/pending' : '/provider';
    } else if (user.role === 'COOPERATIVE_ADMIN' || user.role === 'FEDERATION_ADMIN') {
      redirectUrl = '/admin';
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        name: user.customer?.fullName || user.worker?.fullName || user.role,
        customerId: user.customer?.id,
        workerId: user.worker?.id,
      },
      redirectUrl,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
