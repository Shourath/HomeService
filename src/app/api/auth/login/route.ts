import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Mobile / Email and password are required' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanIdentifier }, { mobile: cleanIdentifier }],
      },
      include: {
        customer: true,
        worker: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check account lockout
    if (user.lockUntil && new Date() < user.lockUntil) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `Account is temporarily locked due to 5 failed attempts. Please try again in ${remainingMinutes} minute(s).` },
        { status: 429 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      const attempts = user.failedLoginAttempts + 1;
      const willLock = attempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: willLock ? 0 : attempts,
          lockUntil: willLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
          status: willLock ? 'LOCKED' : user.status,
        },
      });

      if (willLock) {
        return NextResponse.json(
          { error: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Invalid credentials. Attempt ${attempts} of 5 before 15-min lockout.` },
        { status: 401 }
      );
    }

    // Reset failed attempts upon successful login
    if (user.failedLoginAttempts > 0 || user.status === 'LOCKED') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockUntil: null,
          status: user.status === 'LOCKED' ? 'ACTIVE' : user.status,
        },
      });
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
      action: 'PASSWORD_LOGIN',
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
