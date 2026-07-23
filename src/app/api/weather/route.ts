import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') ?? 'New York';

  try {
    const weather = await getWeather(city);
    return NextResponse.json(weather);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch weather' },
      { status: 502 },
    );
  }
}
