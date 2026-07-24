import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/lib/weather';
import { getTodaysSchedule } from '@/lib/schedule';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') ?? 'New York';

  try {
    const [weather, schedule] = await Promise.all([getWeather(city), getTodaysSchedule()]);
    return NextResponse.json({ weather, schedule: schedule.events, source: schedule.source });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch daily context' },
      { status: 502 },
    );
  }
}
