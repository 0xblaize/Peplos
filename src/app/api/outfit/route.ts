import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/lib/weather';
import { getTodaysSchedule } from '@/lib/schedule';
import { getCloset } from '@/lib/closet';
import { computeDayContext, generateOutfitOptions } from '@/lib/outfitEngine';
import { polishRationales } from '@/lib/groq';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') ?? 'New York';
  const genderParam = request.nextUrl.searchParams.get('gender');
  const gender = genderParam === 'male' || genderParam === 'female' ? genderParam : undefined;

  try {
    const [weather, closet, schedule] = await Promise.all([
      getWeather(city),
      getCloset(gender),
      getTodaysSchedule(),
    ]);
    const context = computeDayContext(schedule.events, weather);
    const options = generateOutfitOptions(closet, context);
    const polished = await polishRationales(options, context);

    return NextResponse.json({
      weather,
      schedule: schedule.events,
      scheduleSource: schedule.source,
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
