import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'COOPERATIVE_ADMIN' && session.role !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const forecastData = await prisma.demandAnalytics.findMany({
      include: {
        service: true,
        society: true,
      },
      orderBy: { date: 'asc' },
    });

    // Zone heatmap summary
    const zones = [
      { name: 'Tambaram Zone', risk: 'HIGH', demandIndex: 88, activeWorkers: 18, pendingBookings: 12 },
      { name: 'Chromepet Zone', risk: 'NORMAL', demandIndex: 64, activeWorkers: 14, pendingBookings: 6 },
      { name: 'Pallavaram Zone', risk: 'HIGH', demandIndex: 82, activeWorkers: 12, pendingBookings: 9 },
      { name: 'Guindy Zone', risk: 'NORMAL', demandIndex: 58, activeWorkers: 16, pendingBookings: 4 },
    ];

    return NextResponse.json({
      success: true,
      forecast: forecastData,
      heatmap: zones,
    });
  } catch (error) {
    console.error('Fetch forecast error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI forecast' }, { status: 500 });
  }
}
