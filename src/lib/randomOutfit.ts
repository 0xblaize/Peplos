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
 * Picks a weather-appropriate look from the closet. Prefers a single item
 * (full outfit or lone piece) over a top+bottom pair — the free Hugging Face
 * engine dresses garments one at a time, so a pair means two sequential
 * generation calls, which is much more likely to time out.
 */
export function pickRandomWeatherOutfit(closet: ClosetItem[], weather: WeatherSnapshot): ClosetItem[] {
  const rainy = /rain|snow|storm|drizzle/i.test(weather.condition) || weather.precipitationChance > 0.4;
  const thermalTarget = Math.max(0, Math.min(10, Math.round((20 - weather.tempC) / 3)));

  const available = closet.filter((item) => !item.in_laundry);
  const fullOutfits = available.filter((item) => item.category === 'full outfit');
  const tops = available.filter((item) => item.category === 'top');
  const bottoms = available.filter((item) => item.category === 'bottom');

  if (fullOutfits.length > 0) {
    const pick = pickRandom(topScorers(fullOutfits, thermalTarget, rainy));
    if (pick) return [pick];
  }

  const single = pickRandom(topScorers([...tops, ...bottoms], thermalTarget, rainy));
  if (single) return [single];

  // Only fall back to a top+bottom pair if that's genuinely all we have.
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
  }

  const anything = pickRandom(available);
  return anything ? [anything] : [];
}
