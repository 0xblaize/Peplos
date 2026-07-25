import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Client as GradioClient } from '@gradio/client';
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

// Replicate IDM-VTON — real photorealistic virtual try-on with a working free
// tier (pay-per-second compute, new accounts get free credit). Preferred over
// Gemini because Gemini's image model requires billing with zero free quota.
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_MODEL = process.env.REPLICATE_VTON_MODEL || 'cuuupid/idm-vton';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Hugging Face Space (community GPU, no API key or billing) — the truly free
// try-on path. Slower and less reliable than a paid API (queueing, cold
// starts, occasional downtime), so it's tried first but falls through fast.
const HF_SPACE = process.env.HF_VTON_SPACE || 'yisol/IDM-VTON';
const HF_DISABLED = process.env.DISABLE_HF_VTON === 'true';

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

async function toPublicImageUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith('data:')) return null;
  if (!supabase) return null;

  try {
    const dataMatch = url.match(/^data:([^;]+);base64,(.+)$/);
    if (!dataMatch) return null;
    const contentType = dataMatch[1];
    const base64Data = dataMatch[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${contentType.split('/')[1] || 'png'}`;
    const { error } = await supabase.storage.from('garments').upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

    if (error) return null;
    return supabase.storage.from('garments').getPublicUrl(fileName).data.publicUrl;
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

// ── Hugging Face Space: free community-GPU try-on, garment-by-garment ─────────

async function toBlob(url: string): Promise<Blob> {
  const dataMatch = url.match(/^data:([^;]+);base64,(.+)$/);
  if (dataMatch) {
    const buffer = Buffer.from(dataMatch[2], 'base64');
    return new Blob([buffer], { type: dataMatch[1] });
  }
  if (!/^https?:\/\//i.test(url)) throw new Error('Unsupported image reference.');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not download an image for the free try-on engine.');
  const mimeType = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  return new Blob([buffer], { type: mimeType });
}

let hfClientPromise: Promise<GradioClient> | null = null;
function getHfClient(): Promise<GradioClient> {
  if (!hfClientPromise) hfClientPromise = GradioClient.connect(HF_SPACE);
  return hfClientPromise;
}

/** IDM-VTON's Gradio demo takes: person image, garment image, description, auto-mask, auto-crop, steps, seed. */
async function runHuggingFaceTryOn(personUrl: string, garment: GarmentInput): Promise<string> {
  const client = await getHfClient();
  const [personBlob, garmentBlob] = await Promise.all([toBlob(personUrl), toBlob(garment.imageUrl)]);

  try {
    const result = await client.predict('/tryon', [
      personBlob,
      garmentBlob,
      garment.name || garment.category,
      true,
      false,
      30,
      42,
    ]);

    const data = result.data as unknown[];
    const first = data?.[0] as { url?: string; path?: string } | string | undefined;
    const imageUrl = typeof first === 'string' ? first : first?.url || first?.path;
    if (!imageUrl) throw new Error('The free try-on engine returned no image.');
    return imageUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Hugging Face try-on failed: ${message}`);
  }
}

/** Dresses the person one garment at a time on the free Hugging Face Space. */
async function generateWithHuggingFace(userImageUrl: string, garments: GarmentInput[]): Promise<string> {
  if (HF_DISABLED) throw new Error('Free try-on engine is disabled.');
  if (!userImageUrl) throw new Error('Could not read the base model photo. Upload a fresh photo and retry.');

  let currentPersonUrl = userImageUrl;
  for (const garment of garments) {
    if (!garment.imageUrl) continue;
    currentPersonUrl = await runHuggingFaceTryOn(currentPersonUrl, garment);
  }
  return currentPersonUrl;
}

// ── Replicate IDM-VTON: real photo try-on, garment-by-garment ─────────────────

/** IDM-VTON dresses one garment at a time. Map our categories onto its slots. */
function replicateCategory(category: string): 'upper_body' | 'lower_body' | 'dresses' {
  if (category === 'bottom') return 'lower_body';
  if (category === 'full outfit') return 'dresses';
  return 'upper_body';
}

let cachedReplicateVersion: string | null = null;

/** Resolves the model's latest published version ID (also confirms the slug is real). */
async function resolveReplicateVersion(): Promise<string> {
  if (cachedReplicateVersion) return cachedReplicateVersion;

  const res = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}`, {
    headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.detail
        ? `Replicate model "${REPLICATE_MODEL}" — ${data.detail}`
        : `Replicate model "${REPLICATE_MODEL}" could not be found (${res.status}). Check REPLICATE_VTON_MODEL.`,
    );
  }

  const versionId = data?.latest_version?.id;
  if (!versionId) throw new Error(`Replicate model "${REPLICATE_MODEL}" has no published version to run.`);
  cachedReplicateVersion = versionId;
  return versionId;
}

async function runReplicatePrediction(input: Record<string, unknown>): Promise<string> {
  if (!REPLICATE_TOKEN) throw new Error('REPLICATE_API_TOKEN is not set.');

  const version = await resolveReplicateVersion();

  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=50',
    },
    body: JSON.stringify({ version, input }),
  });

  let prediction = await createRes.json();
  if (!createRes.ok) {
    throw new Error(prediction?.detail || `Replicate request failed (${createRes.status}).`);
  }

  const getUrl: string | undefined = prediction?.urls?.get;
  const start = Date.now();
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (Date.now() - start > 55000) throw new Error('Replicate try-on timed out. Please try again.');
    if (!getUrl) break;
    await wait(1500);
    const pollRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` } });
    prediction = await pollRes.json();
  }

  if (prediction.status !== 'succeeded') {
    throw new Error(prediction?.error || 'Replicate did not return a result.');
  }

  const output = prediction.output;
  const imageUrl = Array.isArray(output) ? output[0] : output;
  if (typeof imageUrl !== 'string' || !imageUrl) throw new Error('Replicate returned no image.');
  return imageUrl;
}

/**
 * Dresses the person one garment at a time. A single garment is one call;
 * a top+bottom pair chains two calls, feeding the first result back in as
 * the "person" for the second so both layers land on the same photo.
 */
async function generateWithReplicate(userImageUrl: string, garments: GarmentInput[]): Promise<string> {
  if (!REPLICATE_TOKEN) throw new Error('REPLICATE_API_TOKEN is not set.');
  if (!userImageUrl) throw new Error('Could not read the base model photo. Upload a fresh photo and retry.');

  let currentPersonUrl = userImageUrl;

  for (const garment of garments) {
    if (!garment.imageUrl) continue;
    currentPersonUrl = await runReplicatePrediction({
      human_img: currentPersonUrl,
      garm_img: garment.imageUrl,
      garment_des: garment.name || garment.category,
      category: replicateCategory(garment.category),
    });
  }

  return currentPersonUrl;
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
  const safeUserImage = userImageUrl && userImageUrl.startsWith('http') ? userImageUrl : '/base-model-placeholder.svg';
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

    const engineFailures: string[] = [];

    // Preferred path: a free Hugging Face Space — no API key, no billing.
    // Slower/less reliable (shared community GPU), so it falls through fast
    // to the paid engines below if it errors or the space is unavailable.
    if (!HF_DISABLED) {
      try {
        const resultUrl = await generateWithHuggingFace(userImageUrl || '', garmentList);
        return NextResponse.json({ resultImageUrl: resultUrl, engine: 'huggingface' });
      } catch (hfError) {
        const reason = hfError instanceof Error ? hfError.message : 'Free try-on engine failed.';
        console.error('Hugging Face try-on failed:', reason);
        engineFailures.push(`Hugging Face: ${reason}`);
      }
    }

    if (REPLICATE_TOKEN) {
      try {
        const publicUserImageUrl = await toPublicImageUrl(userImageUrl || '');
        const publicGarments = await Promise.all(
          garmentList.map(async (garment) => ({
            ...garment,
            imageUrl: (await toPublicImageUrl(garment.imageUrl)) || garment.imageUrl,
          })),
        );
        if (!publicUserImageUrl) {
          throw new Error('Could not prepare the base model photo for Replicate.');
        }
        const resultUrl = await generateWithReplicate(publicUserImageUrl, publicGarments);
        return NextResponse.json({ resultImageUrl: resultUrl, engine: 'replicate' });
      } catch (replicateError) {
        const reason = replicateError instanceof Error ? replicateError.message : 'Replicate generation failed.';
        console.error('Replicate try-on failed:', reason);
        engineFailures.push(`Replicate: ${reason}`);
      }
    }

    if (GEMINI_KEY) {
      try {
        const resultUrl = await generateWithGemini(userImageUrl || '', garmentList, contextText);
        return NextResponse.json({ resultImageUrl: resultUrl, engine: 'gemini' });
      } catch (geminiError) {
        const reason = geminiError instanceof Error ? geminiError.message : 'Gemini generation failed.';
        console.error('Gemini try-on failed:', reason);
        engineFailures.push(`Gemini: ${reason}`);
      }
    }

    if (engineFailures.length > 0) {
      const fallback = await generateFallbackSVG(garmentList, userImageUrl || '', contextText);
      return NextResponse.json({ resultImageUrl: fallback, engine: 'svg-fallback', warning: engineFailures.join(' | ') });
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
