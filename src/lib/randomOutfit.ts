import type { ClosetItem } from './supabase';
import type { WeatherSnapshot } from './weather';
import { colorsClash } from './color';

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function topScorers(items: ClosetItem[], thermalTarget: number, rainy: boolean): ClosetItem[] {
  if (items.length === 0) return [];
  const scored = items.map((item) => {
    const thermalDistance = Math.abs(item.warmth - thermalTarget);
    const rainBonus = rainy && item.category === 'outerwear' ? 2 : 0;
    return { item, score: -thermalDistance + rainBonus };
  });
  const best = Math.max(...scored.map((s) => s.score));
  return scored.filter((s) => s.score >= best - 1).map((s) => s.item);
}

/**
 * Picks a weather-appropriate look from the closet: a single "full outfit"
 * item, a non-clashing top+bottom pair, or a lone item — mirroring the same
 * single/pair invariant the dashboard's manual selection enforces.
 */
export function pickRandomWeatherOutfit(closet: ClosetItem[], weather: WeatherSnapshot): ClosetItem[] {
  const rainy = /rain|snow|storm|drizzle/i.test(weather.condition) || weather.precipitationChance > 0.4;
  const thermalTarget = Math.max(0, Math.min(10, Math.round((20 - weather.tempC) / 3)));

  const available = closet.filter((item) => !item.in_laundry);
  const fullOutfits = available.filter((item) => item.category === 'full outfit');
  const tops = available.filter((item) => item.category === 'top');
  const bottoms = available.filter((item) => item.category === 'bottom');

  // Prefer a top+bottom pair when both categories exist, so outfits stay
  // varied rather than always collapsing to a single full-outfit item.
  if (tops.length > 0 && bottoms.length > 0) {
    const bestTops = topScorers(tops, thermalTarget, rainy);
    const bestBottoms = topScorers(bottoms, thermalTarget, rainy);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const top = pickRandom(bestTops);
      const bottom = pickRandom(bestBottoms);
      if (top && bottom && !colorsClash(top.color, bottom.color)) {
        return [top, bottom];
      }
    }
    // Fall through if no non-clashing pair was found in a few tries.
  }

  if (fullOutfits.length > 0) {
    const pick = pickRandom(topScorers(fullOutfits, thermalTarget, rainy));
    if (pick) return [pick];
  }

  const single = pickRandom(topScorers([...tops, ...bottoms], thermalTarget, rainy));
  if (single) return [single];

  const anything = pickRandom(available);
  return anything ? [anything] : [];
}
