import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { identifier, code, purpose = 'LOGIN' } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json({ error: 'Identifier and OTP code are required' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        mobileOrEmail: cleanIdentifier,
        purpose,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'No active OTP found. Please request a new code.' }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ error: 'OTP code has expired. Please request a new code.' }, { status: 400 });
    }

    if (otpRecord.attempts >= 3) {
      return NextResponse.json({ error: 'Maximum attempts exceeded (3/3). Please request a new code.' }, { status: 400 });
    }

    if (otpRecord.code !== code.trim()) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: `Invalid OTP code. Remaining attempts: ${2 - otpRecord.attempts}` },
        { status: 400 }
      );
    }

    // Mark OTP used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // If purpose is LOGIN, check if user exists and create session
    if (purpose === 'LOGIN') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ mobile: cleanIdentifier }, { email: cleanIdentifier }],
        },
        include: {
          customer: true,
          worker: true,
        },
      });

      if (!user) {
        return NextResponse.json({
          success: true,
          verified: true,
          userExists: false,
          message: 'OTP verified. Please proceed to registration.',
        });
      }

      if (user.status === 'LOCKED') {
        return NextResponse.json({ error: 'Account is temporarily locked. Try again later.' }, { status: 403 });
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
        action: 'OTP_LOGIN',
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
        verified: true,
        userExists: true,
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
          name: user.customer?.fullName || user.worker?.fullName || user.role,
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
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
