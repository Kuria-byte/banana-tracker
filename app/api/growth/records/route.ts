import { NextResponse } from 'next/server';
import { getAllGrowthRecords } from '@/db/repositories/growth-records-repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plotId = searchParams.get('plotId');

  if (!plotId) {
    return NextResponse.json({ error: 'plotId is required' }, { status: 400 });
  }

  try {
    const records = await getAllGrowthRecords({ plotId: Number(plotId) });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch growth records' }, { status: 500 });
  }
} 