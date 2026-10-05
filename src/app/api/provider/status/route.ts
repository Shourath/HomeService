import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.workerId) {
      return NextResponse.json({ error: 'Worker session required' }, { status: 401 });
    }

    const { statusMode } = await request.json(); // 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'EMERGENCY_ONLY'

    let updateData: Record<string, boolean> = {};

    switch (statusMode) {
      case 'AVAILABLE':
        updateData = { isAvailable: true, isBusy: false, isOffline: false, isEmergencyAvailable: true };
        break;
      case 'BUSY':
        updateData = { isAvailable: false, isBusy: true, isOffline: false, isEmergencyAvailable: false };
        break;
      case 'OFFLINE':
        updateData = { isAvailable: false, isBusy: false, isOffline: true, isEmergencyAvailable: false };
        break;
      case 'EMERGENCY_ONLY':
        updateData = { isAvailable: false, isBusy: false, isOffline: false, isEmergencyAvailable: true };
        break;
      default:
        return NextResponse.json({ error: 'Invalid status mode' }, { status: 400 });
    }

    const worker = await prisma.worker.update({
      where: { id: session.workerId },
      data: updateData,
    });

    return NextResponse.json({ success: true, statusMode, worker });
  } catch (error) {
    console.error('Update worker status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
