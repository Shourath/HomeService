import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Customer session required' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        familyMembers: {
          orderBy: { createdAt: 'asc' },
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Total used slots: 1 primary member + number of active family members
    const activeFamilyMembers = customer.familyMembers.filter(m => m.status === 'ACTIVE');
    const totalSlots = 4;
    const usedSlots = 1 + activeFamilyMembers.length;
    const remainingSlots = Math.max(0, totalSlots - usedSlots);

    return NextResponse.json({
      success: true,
      primaryCustomer: {
        id: customer.id,
        fullName: customer.fullName,
        city: customer.city,
      },
      familyMembers: customer.familyMembers,
      slots: {
        total: totalSlots,
        used: usedSlots,
        remaining: remainingSlots,
        isFull: usedSlots >= totalSlots,
      },
      hasActiveSubscription: customer.subscriptions.length > 0 && customer.subscriptions[0].endDate >= new Date(),
    });
  } catch (error) {
    console.error('Fetch family error:', error);
    return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Customer session required' }, { status: 401 });
    }

    const { name, mobile, canBook = true, canBookEmergency = false, canViewPayments = false } = await request.json();

    if (!name || !mobile) {
      return NextResponse.json({ error: 'Name and mobile number are required' }, { status: 400 });
    }

    // Count existing active family members
    const currentActiveMembers = await prisma.familyMember.count({
      where: {
        customerId: session.customerId,
        status: 'ACTIVE',
      },
    });

    // Enforce 1 Primary + 3 Family = 4 Max
    if (currentActiveMembers >= 3) {
      return NextResponse.json(
        {
          error: 'Family plan limit reached: Maximum 4 members allowed (1 Primary + 3 Family Members). Please remove an existing member to free a slot.',
          limitReached: true,
        },
        { status: 400 }
      );
    }

    // Check duplicate mobile for this family
    const existing = await prisma.familyMember.findFirst({
      where: {
        customerId: session.customerId,
        mobile: mobile.trim(),
        status: 'ACTIVE',
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'A family member with this mobile number already exists' }, { status: 409 });
    }

    // Create family member
    const newMember = await prisma.familyMember.create({
      data: {
        customerId: session.customerId,
        name: name.trim(),
        mobile: mobile.trim(),
        canBook: Boolean(canBook),
        canBookEmergency: Boolean(canBookEmergency),
        canViewPayments: Boolean(canViewPayments),
        status: 'ACTIVE',
        inviteToken: `INV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      },
    });

    // If customer has an active subscription, link member to subscription
    const activeSub = await prisma.subscription.findFirst({
      where: { customerId: session.customerId, status: 'ACTIVE' },
      orderBy: { endDate: 'desc' },
    });

    if (activeSub) {
      await prisma.subscriptionMember.create({
        data: {
          subscriptionId: activeSub.id,
          familyMemberId: newMember.id,
        },
      });
    }

    await logAudit({
      userId: session.userId,
      role: 'CUSTOMER',
      action: 'FAMILY_MEMBER_ADDED',
      targetEntity: 'FamilyMember',
      targetId: newMember.id,
      details: { name: newMember.name, mobile: newMember.mobile },
    });

    return NextResponse.json({
      success: true,
      message: 'Family member invited successfully',
      member: newMember,
      inviteUrl: `/family/join?token=${newMember.inviteToken}`,
    });
  } catch (error) {
    console.error('Add family member error:', error);
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Customer session required' }, { status: 401 });
    }

    const { id, canBook, canBookEmergency, canViewPayments } = await request.json();

    const member = await prisma.familyMember.findFirst({
      where: { id, customerId: session.customerId },
    });

    if (!member) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    const updated = await prisma.familyMember.update({
      where: { id },
      data: {
        canBook: canBook !== undefined ? canBook : member.canBook,
        canBookEmergency: canBookEmergency !== undefined ? canBookEmergency : member.canBookEmergency,
        canViewPayments: canViewPayments !== undefined ? canViewPayments : member.canViewPayments,
      },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Update family permissions error:', error);
    return NextResponse.json({ error: 'Failed to update member permissions' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Customer session required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, customerId: session.customerId },
    });

    if (!member) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    // Remove subscription links first
    await prisma.subscriptionMember.deleteMany({
      where: { familyMemberId: memberId },
    });

    await prisma.familyMember.delete({
      where: { id: memberId },
    });

    await logAudit({
      userId: session.userId,
      role: 'CUSTOMER',
      action: 'FAMILY_MEMBER_REMOVED',
      targetEntity: 'FamilyMember',
      targetId: memberId,
    });

    return NextResponse.json({
      success: true,
      message: 'Family member removed successfully. Slot is now available.',
    });
  } catch (error) {
    console.error('Delete family member error:', error);
    return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 });
  }
}
