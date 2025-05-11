import { NextResponse } from 'next/server';
import { getGrowthSummaryForFarm } from '@/db/repositories/growth-records-repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId');

  if (!farmId) {
    return NextResponse.json({ error: 'Farm ID is required' }, { status: 400 });
  }

  try {
    const summary = await getGrowthSummaryForFarm(Number(farmId));
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch growth summary' }, { status: 500 });
  }
} 