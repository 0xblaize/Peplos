import Groq from 'groq-sdk';
import type { OutfitOption } from './outfitEngine';
import type { DayContext } from './outfitEngine';

/**
 * Sends the rule-selected outfits to Groq (Llama 3) to rewrite their
 * rationale in plain, contextual language. Purely cosmetic — the actual
 * item selection stays rule-based so the 3D renderer always gets valid
 * item ids. Falls back to the rule-based rationale untouched if no API
 * key is configured.
 */
export async function polishRationales(
  options: OutfitOption[],
  context: DayContext,
): Promise<OutfitOption[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return options;

  const groq = new Groq({ apiKey });

  const prompt = `You are a stylist. Given this context: formality ${context.formalityScore}/10, thermal requirement ${context.thermalRequirement}/10, rainy: ${context.rainy}, indoor-only day: ${context.allIndoor}.
For each outfit below, write a single upbeat sentence (max 20 words) explaining why it fits today. Respond as JSON: {"rationales": ["...", "...", "..."]} in the same order as given.

Outfits:
${options.map((o, i) => `${i + 1}. ${o.label}: ${o.items.map((it) => it.name).join(', ')}`).join('\n')}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return options;

    const parsed = JSON.parse(raw) as { rationales?: string[] };
    if (!parsed.rationales || parsed.rationales.length !== options.length) return options;

    return options.map((option, i) => ({ ...option, rationale: parsed.rationales![i] }));
  } catch {
    // Network/parse failure — keep the deterministic rule-based rationale.
    return options;
  }
}
