import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { identifier, purpose = 'LOGIN' } = await request.json();

    if (!identifier || identifier.trim().length < 6) {
      return NextResponse.json({ error: 'Valid mobile number or email is required' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();

    // Check if recent OTP was generated within 30 seconds
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        mobileOrEmail: cleanIdentifier,
        purpose,
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000), // 30s
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'Please wait 30 seconds before requesting a new OTP' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP code (e.g. 123456 or deterministic for demo)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpCode.create({
      data: {
        mobileOrEmail: cleanIdentifier,
        code,
        purpose,
        expiresAt,
        attempts: 0,
      },
    });

    console.log(`[SANDBOX OTP DISPATCH] To: ${cleanIdentifier}, Code: ${code}, Purpose: ${purpose}`);

    return NextResponse.json({
      success: true,
      message: 'Demo OTP dispatched to sandbox channel',
      isDemo: true,
      demoCode: code,
      expiresInSeconds: 300,
      resendAfterSeconds: 30,
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
  }
}
