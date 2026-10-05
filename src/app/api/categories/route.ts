import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        services: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch service categories' }, { status: 500 });
  }
}
