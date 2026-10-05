import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const ProviderSignupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  primaryCategory: z.string().min(2, 'Primary category is required'),
  skills: z.array(z.string()).min(1, 'At least 1 skill must be selected'),
  experienceYears: z.number().min(0).default(1),
  workingHours: z.string().default('08:00 - 18:00'),
  areasServed: z.string().default('Tambaram, Chromepet, Pallavaram'),
  address: z.string().min(5, 'Address is required'),
  kycDocType: z.string().default('AADHAAR'),
  kycDocNumber: z.string().min(4, 'ID document number required'),
  bankAccount: z.string().min(6, 'Bank account details required'),
  upiId: z.string().optional(),
  certificateTitle: z.string().optional(),
  consentAccepted: z.boolean().refine(val => val === true, 'You must accept terms of cooperative membership'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ProviderSignupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = validated.data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ mobile: data.mobile }, { email: data.email }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this mobile number or email already exists' },
        { status: 409 }
      );
    }

    const defaultCoop = await prisma.cooperative.findFirst();
    const defaultSociety = await prisma.society.findFirst();

    const passwordHash = await hashPassword(data.password);

    // Mask sensitive fields
    const maskedKyc = `•••• •••• ${data.kycDocNumber.slice(-4)}`;
    const maskedBank = `Coop A/c •••• ${data.bankAccount.slice(-4)}`;

    const user = await prisma.user.create({
      data: {
        mobile: data.mobile,
        email: data.email,
        passwordHash,
        role: 'WORKER',
        status: 'PENDING_VERIFICATION', // As required by Section 5
        preferredLanguage: 'ta',
        worker: {
          create: {
            fullName: data.fullName,
            mobile: data.mobile,
            primaryCategory: data.primaryCategory,
            experienceYears: data.experienceYears,
            cooperativeId: defaultCoop?.id,
            societyId: defaultSociety?.id,
            workingHours: data.workingHours,
            areasServed: data.areasServed,
            address: data.address,
            kycDocType: data.kycDocType,
            kycDocNumberEncrypted: maskedKyc,
            kycStatus: 'PENDING',
            bankAccountEncrypted: maskedBank,
            upiIdEncrypted: data.upiId || `${data.mobile}@coopbank`,
            currentLevel: 1, // Level 1 Registered
            profileCompletionPct: 65,
            isAvailable: false,
            isBusy: false,
            isOffline: false,
            isEmergencyAvailable: false,
          },
        },
        consents: {
          create: {
            consentType: 'WORKER_COOPERATIVE_AGREEMENT',
            version: '1.0',
          },
        },
      },
      include: {
        worker: true,
      },
    });

    // Add selected skills as unverified
    if (user.worker) {
      for (const skillSlug of data.skills) {
        const service = await prisma.service.findUnique({
          where: { slug: skillSlug },
        });
        if (service) {
          await prisma.workerSkill.create({
            data: {
              workerId: user.worker.id,
              serviceId: service.id,
              experienceYears: data.experienceYears,
              isVerified: false, // Must be verified by admin
            },
          });
        }
      }

      // Add certification if provided
      if (data.certificateTitle) {
        await prisma.workerCertification.create({
          data: {
            workerId: user.worker.id,
            certificateTitle: data.certificateTitle,
            issuingAuthority: 'State Artisan Guild / ITI',
            status: 'PENDING',
          },
        });
      }
    }

    await logAudit({
      userId: user.id,
      role: 'WORKER',
      action: 'PROVIDER_SIGNUP',
      targetEntity: 'Worker',
      targetId: user.worker?.id,
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      workerId: user.worker?.id,
      name: user.worker?.fullName,
      status: user.status,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Worker registration submitted for cooperative verification',
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      redirectUrl: '/provider/pending',
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
    console.error('Provider signup error:', error);
    return NextResponse.json({ error: 'Failed to create service provider application' }, { status: 500 });
  }
}
