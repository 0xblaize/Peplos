import type { CalendarEvent } from './schedule';
import type { ClosetItem } from './supabase';
import type { WeatherSnapshot } from './weather';
import { colorsClash } from './color';

export interface DayContext {
  formalityScore: number; // 0 (loungewear) – 10 (black tie)
  thermalRequirement: number; // 0 (tank top) – 10 (parka)
  rainy: boolean;
  allIndoor: boolean;
}

const FORMALITY_KEYWORDS: Array<{ pattern: RegExp; score: number }> = [
  { pattern: /pitch|board|interview|wedding|gala/i, score: 9 },
  { pattern: /client|meeting|presentation|office/i, score: 7 },
  { pattern: /dinner|date/i, score: 6 },
  { pattern: /standup|call|class/i, score: 4 },
  { pattern: /gym|run|workout|yoga/i, score: 1 },
];

/**
 * Rule-based context derivation. The highest-formality event of the day
 * drives the outfit floor — thermal requirement discounts warmth for
 * indoor-only days so a snowstorm doesn't force a coat onto someone who
 * never leaves the building.
 */
export function computeDayContext(
  events: CalendarEvent[],
  weather: WeatherSnapshot,
): DayContext {
  const allIndoor = events.length > 0 && events.every((event) => event.indoor);

  const formalityScore = events.reduce((max, event) => {
    const match = FORMALITY_KEYWORDS.find((entry) => entry.pattern.test(event.title));
    return match ? Math.max(max, match.score) : max;
  }, 3); // default: smart casual baseline

  const rainy = /rain|snow|storm|drizzle/i.test(weather.condition) || weather.precipitationChance > 0.4;

  let thermalRequirement = Math.max(0, Math.min(10, Math.round((20 - weather.tempC) / 3)));
  if (allIndoor) {
    thermalRequirement = Math.min(thermalRequirement, 4);
  }

  return { formalityScore, thermalRequirement, rainy, allIndoor };
}

export interface OutfitOption {
  label: 'Formal' | 'Smart Casual' | 'Layered for Rain';
  items: ClosetItem[];
  rationale: string;
}

interface Candidate {
  items: ClosetItem[];
  formalityFit: number;
  thermalFit: number;
}

function pickClosest(items: ClosetItem[], target: number, key: 'formality' | 'warmth') {
  return [...items].sort((a, b) => Math.abs(a[key] - target) - Math.abs(b[key] - target));
}

function buildCandidate(
  top: ClosetItem,
  bottom: ClosetItem,
  footwear: ClosetItem,
  outerwear: ClosetItem | null,
  context: DayContext,
): Candidate | null {
  const pieces = [top, bottom, footwear, ...(outerwear ? [outerwear] : [])];

  for (let i = 0; i < pieces.length; i += 1) {
    for (let j = i + 1; j < pieces.length; j += 1) {
      if (colorsClash(pieces[i].color, pieces[j].color)) return null;
    }
  }

  const avgFormality = pieces.reduce((sum, p) => sum + p.formality, 0) / pieces.length;
  const totalWarmth = pieces.reduce((sum, p) => sum + p.warmth, 0);

  return {
    items: pieces,
    formalityFit: Math.abs(avgFormality - context.formalityScore),
    thermalFit: Math.abs(totalWarmth - context.thermalRequirement * 1.8),
  };
}

/**
 * Generates and validates candidate outfits from the closet, then selects
 * three distinct options (Formal / Smart Casual / Layered for Rain) that
 * satisfy the day's formality and thermal requirements without color
 * clashes.
 */
export function generateOutfitOptions(
  closet: ClosetItem[],
  context: DayContext,
): OutfitOption[] {
  const available = closet.filter((item) => !item.in_laundry);
  const tops = available.filter((item) => item.category === 'top');
  const bottoms = available.filter((item) => item.category === 'bottom');
  const footwear = available.filter((item) => item.category === 'footwear');
  const outerwear = available.filter((item) => item.category === 'outerwear');

  const candidates: Candidate[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of footwear) {
        const withoutOuter = buildCandidate(top, bottom, shoe, null, context);
        if (withoutOuter) candidates.push(withoutOuter);

        for (const outer of outerwear) {
          const withOuter = buildCandidate(top, bottom, shoe, outer, context);
          if (withOuter) candidates.push(withOuter);
        }
      }
    }
  }

  candidates.sort((a, b) => a.formalityFit + a.thermalFit - (b.formalityFit + b.thermalFit));

  const formal = candidates.find((c) => c.items.some((i) => i.formality >= 7)) ?? candidates[0];
  const smartCasual = candidates.find(
    (c) => c !== formal && c.items.every((i) => i.formality >= 3 && i.formality <= 7),
  ) ?? candidates[1] ?? candidates[0];
  const layered = candidates.find(
    (c) => c !== formal && c !== smartCasual && c.items.some((i) => i.category === 'outerwear'),
  ) ?? candidates[2] ?? candidates[0];

  const options: Array<{ label: OutfitOption['label']; candidate?: Candidate }> = [
    { label: 'Formal', candidate: formal },
    { label: 'Smart Casual', candidate: smartCasual },
    { label: 'Layered for Rain', candidate: layered },
  ];

  return options
    .filter((o): o is { label: OutfitOption['label']; candidate: Candidate } => Boolean(o.candidate))
    .map(({ label, candidate }) => ({
      label,
      items: candidate.items,
      rationale: buildRationale(label, candidate, context),
    }));
}

function buildRationale(label: OutfitOption['label'], candidate: Candidate, context: DayContext): string {
  const names = candidate.items.map((i) => i.name).join(', ');
  if (context.allIndoor && context.thermalRequirement < 5) {
    return `${label}: ${names} — the day is indoor-only, so warmth was capped even though it's cold out.`;
  }
  if (context.rainy) {
    return `${label}: ${names} — picked to handle precipitation while matching today's formality.`;
  }
  return `${label}: ${names} — balances today's formality score (${context.formalityScore}/10) with the weather.`;
}
