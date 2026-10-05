import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const CustomerSignupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.string().default('en'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().default('Chennai'),
  pinCode: z.string().min(6, 'Valid 6-digit PIN code required'),
  latitude: z.number().default(12.9249),
  longitude: z.number().default(80.1472),
  planType: z.enum(['INDIVIDUAL', 'ANNUAL_FAMILY']).default('ANNUAL_FAMILY'),
  consentAccepted: z.boolean().refine(val => val === true, 'You must accept the terms of service'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CustomerSignupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const {
      fullName,
      mobile,
      email,
      password,
      preferredLanguage,
      address,
      city,
      pinCode,
      latitude,
      longitude,
      planType,
    } = validated.data;

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ mobile }, { email }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this mobile number or email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user and customer
    const user = await prisma.user.create({
      data: {
        mobile,
        email,
        passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        preferredLanguage,
        customer: {
          create: {
            fullName,
            address,
            city,
            pinCode,
            latitude,
            longitude,
          },
        },
        consents: {
          create: {
            consentType: 'TERMS_AND_PRIVACY',
            version: '1.0',
          },
        },
      },
      include: {
        customer: true,
      },
    });

    // If Annual Family plan chosen, create subscription
    if (planType === 'ANNUAL_FAMILY' && user.customer) {
      await prisma.subscription.create({
        data: {
          customerId: user.customer.id,
          planType: 'ANNUAL_FAMILY',
          price: 1499,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
          status: 'ACTIVE',
          isDemo: true,
        },
      });
    }

    await logAudit({
      userId: user.id,
      role: 'CUSTOMER',
      action: 'CUSTOMER_SIGNUP',
      targetEntity: 'Customer',
      targetId: user.customer?.id,
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      customerId: user.customer?.id,
      name: user.customer?.fullName,
      status: user.status,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        fullName: user.customer?.fullName,
      },
      redirectUrl: '/customer',
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
    console.error('Customer signup error:', error);
    return NextResponse.json({ error: 'Failed to create customer account' }, { status: 500 });
  }
}
