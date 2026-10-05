import { NextResponse } from 'next/server';
import { rankWorkersForService } from '@/lib/matching';

export async function POST(request: Request) {
  try {
    const { serviceId, lat, lng, isEmergency } = await request.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const customerLat = Number(lat) || 12.9249;
    const customerLng = Number(lng) || 80.1472;

    const rankedWorkers = await rankWorkersForService({
      serviceId,
      customerLat,
      customerLng,
      isEmergency: Boolean(isEmergency),
    });

    return NextResponse.json({
      success: true,
      totalMatched: rankedWorkers.length,
      topRecommended: rankedWorkers.slice(0, 3),
      allWorkers: rankedWorkers,
    });
  } catch (error) {
    console.error('Matching engine error:', error);
    return NextResponse.json({ error: 'Failed to find matching cooperative workers' }, { status: 500 });
  }
}
