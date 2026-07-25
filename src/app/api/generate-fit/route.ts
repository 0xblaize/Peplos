import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// The person photo can be a multi-MB base64 data URL, so run on the Node
// runtime (Buffer + large bodies) and give Gemini time to render.
export const runtime = 'nodejs';
export const maxDuration = 60;

interface GarmentInput {
  name: string;
  category: string;
  imageUrl: string;
  color?: string;
}

// Gemini 2.5 Flash Image ("Nano Banana"). Override with GEMINI_IMAGE_MODEL if
// Google renames the model (e.g. a newer Nano Banana Pro) — no code change needed.
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

interface InlineImage {
  mimeType: string;
  data: string; // base64, no data: prefix
}

/**
 * Turns either a `data:` URL (the base64 person photo from the browser) or a
 * remote https image (a Supabase garment URL) into base64 bytes Gemini can read.
 */
async function toInlineImage(url: string): Promise<InlineImage | null> {
  if (!url) return null;
  try {
    const dataMatch = url.match(/^data:([^;]+);base64,(.+)$/);
    if (dataMatch) {
      return { mimeType: dataMatch[1], data: dataMatch[2] };
    }
    if (/^https?:\/\//i.test(url)) {
      const res = await fetch(url);
      if (!res.ok) return null;
      const mimeType = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
      const buffer = Buffer.from(await res.arrayBuffer());
      return { mimeType, data: buffer.toString('base64') };
    }
    return null;
  } catch {
    return null;
  }
}

/** Builds the try-on instruction. One garment = "half" look, two = full outfit. */
function buildTryOnPrompt(garments: GarmentInput[], contextText: string): string {
  const list = garments
    .map((g, i) => `${i + 1}. ${g.name} — a ${g.category}${g.color ? ` (dominant color ${g.color})` : ''}`)
    .join('\n');

  return [
    'You are a photorealistic virtual try-on engine.',
    'The FIRST image is a real photo of a person. The following image(s) are clothing garments.',
    'Generate a single new photorealistic image of THAT SAME PERSON wearing the garment(s).',
    '',
    'Garments to put on the person:',
    list,
    '',
    'Strict requirements:',
    '- Keep the person’s exact face, hair, skin tone, body shape and identity unchanged.',
    '- Keep a natural standing pose and realistic proportions; fit the clothing to their body.',
    '- Replace only the relevant clothing layer(s). If one garment is a top, keep existing bottoms; if a top and a bottom are given, dress both.',
    '- Match the garment’s real color, pattern and texture from its photo as closely as possible.',
    '- Produce a clean, well-lit editorial fashion photograph, full-body if possible.',
    contextText ? `- Style the lighting and setting to suit: ${contextText}.` : '',
    '',
    'Output only the final generated image.',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Calls Gemini 2.5 Flash Image to composite the garments onto the person.
 * Returns a data URL of the generated photo, or throws with a readable reason.
 */
async function generateWithGemini(
  userImageUrl: string,
  garments: GarmentInput[],
  contextText: string,
): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY is not set.');

  const person = await toInlineImage(userImageUrl);
  if (!person) throw new Error('Could not read the base model photo. Upload a fresh photo and retry.');

  const garmentImages: InlineImage[] = [];
  for (const garment of garments) {
    const image = await toInlineImage(garment.imageUrl);
    if (image) garmentImages.push(image);
  }
  if (garmentImages.length === 0) throw new Error('Could not read any garment images.');

  const parts: Array<Record<string, unknown>> = [
    { text: buildTryOnPrompt(garments, contextText) },
    { inline_data: { mime_type: person.mimeType, data: person.data } },
    ...garmentImages.map((image) => ({
      inline_data: { mime_type: image.mimeType, data: image.data },
    })),
  ];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || `Gemini request failed (${res.status}).`;
    throw new Error(message);
  }

  // The generated image comes back as an inline_data / inlineData part.
  const responseParts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const part of responseParts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) {
      const mimeType = inline.mimeType || inline.mime_type || 'image/png';
      return `data:${mimeType};base64,${inline.data}`;
    }
  }

  const textNote = responseParts.find((p: { text?: string }) => p.text)?.text;
  throw new Error(textNote ? `Gemini returned text, not an image: ${textNote}` : 'Gemini returned no image.');
}

// ── Fallback: stylised SVG when no image model is configured ──────────────────

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function generateFallbackSVG(garments: GarmentInput[], userImageUrl: string, contextText: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const garmentColor = garments[0]?.color || '#E882B4';
  const garmentListText = garments
    .map((garment, index) => `${index + 1}. ${garment.name} (${garment.category}${garment.color ? `, ${garment.color}` : ''})`)
    .join('; ');
  const prompt = `You are a premium vector graphic designer.
Generate a modern raw SVG code representing a virtual try-on of a person wearing one or more selected garments.

Subject description: A stylish minimalist fashion avatar representation of the person.
User photo: ${userImageUrl ? 'provided' : 'no photo provided'}.
Garments: ${garmentListText}.
Context: "${contextText}".

Requirements:
1. Output ONLY the raw SVG code. Start directly with "<svg" and end with "</svg>". No markdown or backticks.
2. The SVG viewBox must be "0 0 800 1100".
3. Render a clean vector human silhouette wearing the selected garments, layered appropriately.
4. Use a dark background (#121111) with elegant neon highlights and clean styling.
5. Include "PEPLOS VIRTUAL TRY-ON" as header text inside the SVG.
6. The SVG must be completely self-contained and render beautifully.`;

  let svgText = '';

  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      if (data.content?.[0]?.text) svgText = data.content[0].text;
    } catch (e) {
      console.error('Claude SVG fallback failed:', e);
    }
  }

  if (!svgText && groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 3000,
      });
      svgText = completion.choices[0]?.message?.content || '';
    } catch (e) {
      console.error('Groq SVG fallback failed:', e);
    }
  }

  svgText = svgText.replace(/```xml/g, '').replace(/```html/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

  const firstGarment = garments[0];
  const firstGarmentLabel = firstGarment ? `${firstGarment.name} (${firstGarment.category})` : 'Selected garment';

  if (!svgText.startsWith('<svg')) {
    await wait(300);
    svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
        <rect width="800" height="1100" fill="#121111" />
        <text x="400" y="500" fill="#faf7f5" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle">PEPLOS LOOKBOOK</text>
        <rect x="300" y="560" width="200" height="240" rx="16" fill="${garmentColor}" opacity="0.85" />
        <text x="400" y="690" fill="#121111" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">${firstGarmentLabel.toUpperCase()}</text>
        <text x="400" y="860" fill="#8a8384" font-family="sans-serif" font-size="12" text-anchor="middle">Add GEMINI_API_KEY for a real photo try-on</text>
      </svg>`;
  }

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgText.trim())}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { garments, contextPrompt, userImageUrl } = body ?? {};
    const contextText = contextPrompt || '';
    const garmentList: GarmentInput[] = garments || [];

    if (garmentList.length < 1) {
      return NextResponse.json({ error: 'At least one garment is required to generate a try-on look.' }, { status: 400 });
    }

    // Preferred path: a real photorealistic try-on via Gemini image generation.
    if (GEMINI_KEY) {
      try {
        const resultUrl = await generateWithGemini(userImageUrl || '', garmentList, contextText);
        return NextResponse.json({ resultImageUrl: resultUrl, engine: 'gemini' });
      } catch (geminiError) {
        // Don't kill the demo — fall back to the stylised SVG but report why.
        const reason = geminiError instanceof Error ? geminiError.message : 'Gemini generation failed.';
        console.error('Gemini try-on failed, falling back to SVG:', reason);
        const fallback = await generateFallbackSVG(garmentList, userImageUrl || '', contextText);
        return NextResponse.json({ resultImageUrl: fallback, engine: 'svg-fallback', warning: reason });
      }
    }

    // No image key configured — stylised placeholder so the UI still works.
    const resultUrl = await generateFallbackSVG(garmentList, userImageUrl || '', contextText);
    return NextResponse.json({ resultImageUrl: resultUrl, engine: 'svg-mock' });
  } catch (err) {
    console.error('AI try-on generation failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to complete virtual try-on.' },
      { status: 500 },
    );
  }
}
