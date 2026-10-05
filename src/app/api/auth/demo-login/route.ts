import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, COOKIE_NAME, hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawAccountType = (body.accountType || 'customer1').toString().trim().toLowerCase();

    let targetEmail: string | null = null;
    let targetMobile: string | null = null;
    let targetRole: string = 'CUSTOMER';

    switch (rawAccountType) {
      case 'customer':
      case 'customer1':
      case 'cust1':
      case 'aravind':
        targetEmail = 'customer1@homeservice.coop';
        targetMobile = '9876543210';
        targetRole = 'CUSTOMER';
        break;

      case 'customer2':
      case 'cust2':
      case 'lakshmi':
        targetEmail = 'customer2@homeservice.coop';
        targetMobile = '9876543211';
        targetRole = 'CUSTOMER';
        break;

      case 'family':
      case 'family_member':
      case 'meena':
        targetMobile = '9876543212';
        targetEmail = 'meena.family@homeservice.coop';
        targetRole = 'FAMILY_MEMBER';
        break;

      case 'worker':
      case 'kumar':
      case 'kumar_plumber':
      case 'plumber':
        targetEmail = 'kumar.plumber@homeservice.coop';
        targetMobile = '9876543220';
        targetRole = 'WORKER';
        break;

      case 'rajesh':
      case 'rajesh_electrician':
      case 'electrician':
        targetEmail = 'rajesh.electrician@homeservice.coop';
        targetMobile = '9876543221';
        targetRole = 'WORKER';
        break;

      case 'unverified':
      case 'unverified_worker':
      case 'ravi':
        targetEmail = 'ravi.unverified@homeservice.coop';
        targetMobile = '9876543230';
        targetRole = 'WORKER';
        break;

      case 'admin':
      case 'coop_admin':
      case 'cooperative_admin':
        targetEmail = 'admin@homeservice.coop';
        targetMobile = '9876543240';
        targetRole = 'COOPERATIVE_ADMIN';
        break;

      case 'federation':
      case 'federation_admin':
        targetEmail = 'federation@homeservice.coop';
        targetMobile = '9876543250';
        targetRole = 'FEDERATION_ADMIN';
        break;

      default:
        // Default to primary customer if unrecognized
        targetEmail = 'customer1@homeservice.coop';
        targetMobile = '9876543210';
        targetRole = 'CUSTOMER';
        break;
    }

    // Try finding user by email or mobile
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(targetEmail ? [{ email: targetEmail }] : []),
          ...(targetMobile ? [{ mobile: targetMobile }] : []),
        ],
      },
      include: {
        customer: true,
        worker: true,
      },
    });

    // Special handling for family member demo: ensure user exists and links to primary customer
    if (!user && targetRole === 'FAMILY_MEMBER') {
      const defaultPassword = await hashPassword('Password123!');
      user = await prisma.user.upsert({
        where: { mobile: '9876543212' },
        update: { role: 'FAMILY_MEMBER', status: 'ACTIVE' },
        create: {
          mobile: '9876543212',
          email: 'meena.family@homeservice.coop',
          passwordHash: defaultPassword,
          role: 'FAMILY_MEMBER',
          status: 'ACTIVE',
          preferredLanguage: 'en',
        },
        include: {
          customer: true,
          worker: true,
        },
      });

      // Ensure FamilyMember record exists under primary customer
      const primaryCust = await prisma.customer.findFirst({ orderBy: { createdAt: 'asc' } });
      if (primaryCust) {
        const existingFam = await prisma.familyMember.findFirst({
          where: { customerId: primaryCust.id, mobile: '9876543212' },
        });
        if (!existingFam) {
          await prisma.familyMember.create({
            data: {
              customerId: primaryCust.id,
              name: 'Meena Krishnan (Spouse)',
              mobile: '9876543212',
              canBook: true,
              canBookEmergency: true,
              canViewPayments: true,
              status: 'ACTIVE',
            },
          });
        }
      }
    }

    // Fallback: If still not found by exact criteria, find by role
    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: targetRole },
        include: {
          customer: true,
          worker: true,
        },
      });
    }

    // Ultimate fallback: First user in database
    if (!user) {
      user = await prisma.user.findFirst({
        include: {
          customer: true,
          worker: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Database is empty. Please run: npm run prisma:seed' },
        { status: 404 }
      );
    }

    // Resolve customerId and workerId accurately
    let customerId = user.customer?.id || null;
    let workerId = user.worker?.id || null;

    if (user.role === 'FAMILY_MEMBER' || !customerId) {
      const fam = await prisma.familyMember.findFirst({
        where: { mobile: user.mobile },
      });
      if (fam) {
        customerId = fam.customerId;
      } else {
        const firstCust = await prisma.customer.findFirst({ orderBy: { createdAt: 'asc' } });
        if (firstCust) customerId = firstCust.id;
      }
    }

    if (user.role === 'WORKER' && !workerId) {
      const w = await prisma.worker.findFirst({
        where: { userId: user.id },
      });
      if (w) workerId = w.id;
    }

    const displayName = user.customer?.fullName || user.worker?.fullName || (user.role === 'FAMILY_MEMBER' ? 'Meena Krishnan' : user.role);

    const token = await signToken({
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      customerId,
      workerId,
      name: displayName,
      status: user.status,
    });

    await logAudit({
      userId: user.id,
      role: user.role,
      action: 'DEMO_LOGIN',
      targetEntity: 'User',
      targetId: user.id,
      details: { accountType: rawAccountType },
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
        name: displayName,
        customerId,
        workerId,
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
