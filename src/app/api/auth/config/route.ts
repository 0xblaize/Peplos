import { NextResponse } from 'next/server';
import { isGoogleCalendarConfigured } from '@/auth';

export async function GET() {
  return NextResponse.json({ googleConfigured: isGoogleCalendarConfigured });
}
