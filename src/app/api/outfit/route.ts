import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/lib/weather';
import { MOCK_SCHEDULE } from '@/lib/mockCalendar';
import { getCloset } from '@/lib/closet';
import { computeDayContext, generateOutfitOptions } from '@/lib/outfitEngine';
import { polishRationales } from '@/lib/groq';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') ?? 'New York';

  try {
    const [weather, closet] = await Promise.all([getWeather(city), getCloset()]);
    const context = computeDayContext(MOCK_SCHEDULE, weather);
    const options = generateOutfitOptions(closet, context);
    const polished = await polishRationales(options, context);

    return NextResponse.json({
      weather,
      schedule: MOCK_SCHEDULE,
      context,
      outfits: polished,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compute outfit' },
      { status: 500 },
    );
  }
}
