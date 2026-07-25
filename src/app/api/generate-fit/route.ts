import { NextRequest, NextResponse } from 'next/server';
import { Client as GradioClient } from '@gradio/client';
import Groq from 'groq-sdk';

// The person photo can be a multi-MB base64 data URL, so run on the Node
// runtime (Buffer + large bodies) and give the Space time to render.
export const runtime = 'nodejs';
export const maxDuration = 60;

interface GarmentInput {
  name: string;
  category: string;
  imageUrl: string;
  color?: string;
}

// Hugging Face Space (community GPU, no API key or billing) — the only
// try-on engine, kept truly free. Slower and less reliable than a paid API
// (queueing, cold starts, occasional downtime).
const HF_SPACE = process.env.HF_VTON_SPACE || 'yisol/IDM-VTON';
const HF_DISABLED = process.env.DISABLE_HF_VTON === 'true';

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

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('The free try-on engine returned an image that could not be downloaded.');
  const mimeType = res.headers.get('content-type')?.split(';')[0] || 'image/webp';
  const buffer = Buffer.from(await res.arrayBuffer());
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
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
    // The person image goes through a Gradio ImageEditor component, which
    // expects a { background, layers, composite } shape server-side — not a
    // raw file — or the Space's Python code throws a bare AttributeError.
    const result = await client.predict('/tryon', [
      { background: personBlob, layers: [], composite: personBlob },
      garmentBlob,
      garment.name || garment.category,
      true,
      false,
      30,
      42,
    ]);

    const data = result.data as unknown[];
    const first = data?.[0] as { url?: string; path?: string } | string | undefined;
    let imageUrl = typeof first === 'string' ? first : first?.url;
    // The server sometimes only sends back a local disk `path` (e.g.
    // "/tmp/gradio/xyz/output.webp") with no `url` — that's not fetchable as-is,
    // so build the real file URL from the connected Space's own root.
    if (!imageUrl && typeof first === 'object' && first?.path) {
      const config = (client as unknown as { config?: { root?: string }; api_prefix?: string }).config;
      const apiPrefix = (client as unknown as { api_prefix?: string }).api_prefix || '';
      if (config?.root) imageUrl = `${config.root}${apiPrefix}/file=${first.path}`;
    }
    if (!imageUrl) throw new Error('The free try-on engine returned no image.');
    // The Space's file URL is a temporary link into its own /tmp storage and
    // can vanish within seconds (before a second garment call re-fetches it,
    // or before the browser reopens it later from history) — convert it to a
    // permanent, self-contained data URL right away.
    return imageUrl.startsWith('data:') ? imageUrl : await toDataUrl(imageUrl);
  } catch (error) {
    // @gradio/client's predict() rejects with a plain status object
    // ({ stage: 'error', message: '...' }), not an Error instance, on
    // in-app failures — only real network/config issues throw actual Errors.
    const statusLike = error as { message?: unknown; stage?: string; broken?: boolean } | null;
    const message =
      (typeof statusLike?.message === 'string' && statusLike.message) ||
      (error instanceof Error ? error.message : '') ||
      JSON.stringify(error);
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

// ── Fallback: stylised SVG when the free engine is unavailable ────────────────

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
        <text x="400" y="860" fill="#8a8384" font-family="sans-serif" font-size="12" text-anchor="middle">Free try-on engine unavailable — showing a placeholder</text>
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

    // Only engine: a free Hugging Face Space — no API key, no billing.
    if (!HF_DISABLED) {
      try {
        const resultUrl = await generateWithHuggingFace(userImageUrl || '', garmentList);
        return NextResponse.json({ resultImageUrl: resultUrl, engine: 'huggingface' });
      } catch (hfError) {
        const reason = hfError instanceof Error ? hfError.message : 'Free try-on engine failed.';
        console.error('Hugging Face try-on failed:', reason);
        const fallback = await generateFallbackSVG(garmentList, userImageUrl || '', contextText);
        return NextResponse.json({ resultImageUrl: fallback, engine: 'svg-fallback', warning: reason });
      }
    }

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
