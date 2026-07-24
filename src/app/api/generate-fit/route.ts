import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

interface GarmentInput {
  name: string;
  category: string;
  imageUrl: string;
  color?: string;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Initialise Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

async function uploadBase64ToSupabase(base64DataUrl: string, prefix: string): Promise<string> {
  if (!supabase) return '';
  try {
    const matches = base64DataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return '';
    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const path = `temp/${fileName}`;

    const { error } = await supabase.storage
      .from('garments')
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (error) return '';
    return supabase.storage.from('garments').getPublicUrl(path).data.publicUrl;
  } catch {
    return '';
  }
}

async function generateFallbackSVG(targetGarment: GarmentInput, contextText: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  
  const garmentColor = targetGarment.color || '#E882B4';
  const prompt = `You are a premium vector graphic designer. 
Generate a modern raw SVG code representing a virtual try-on of a person wearing a specific garment.

Subject description: A stylish minimalist fashion avatar representation of the person.
Garment description: "${targetGarment.name}" (Category: "${targetGarment.category}", Color: "${garmentColor}").
Context: "${contextText}".

Requirements:
1. Output ONLY the raw SVG code. Start directly with "<svg" and end with "</svg>". Do not put any markdown, backticks, or text explanation.
2. The SVG viewBox must be "0 0 800 1100".
3. Render a clean vector human silhouette wearing the garment (rendered in its signature color: ${garmentColor}) matching the category: ${targetGarment.category}. If it's a bottom, color the trousers. If it's a top, color the shirt. If it's a full outfit, color the entire suit/dress.
4. Use a dark background (#121111) with elegant neon highlights (e.g. pink, blue) and clean styling.
5. Include "PEPLOS VIRTUAL TRY-ON" as header text inside the SVG.
6. The SVG must be completely self-contained and render beautifully.`;

  let svgText = '';

  // 1. Try Claude (Anthropic) first if key is present
  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.content?.[0]?.text) {
        svgText = data.content[0].text;
      }
    } catch (e) {
      console.error('Claude fallback failed, trying Groq:', e);
    }
  }

  // 2. Fall back to Groq (Llama 3) if Claude is not set or failed
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
      console.error('Groq fallback failed:', e);
    }
  }

  // Clean markdown wraps from the response if any
  svgText = svgText.replace(/```xml/g, '').replace(/```html/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

  // If both failed or output is invalid, return a default styled SVG
  if (!svgText.startsWith('<svg')) {
    svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
        <rect width="800" height="1100" fill="#121111" />
        <text x="400" y="520" fill="#faf7f5" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle">PEPLOS LOOKBOOK</text>
        <rect x="300" y="580" width="200" height="240" rx="16" fill="${garmentColor}" opacity="0.8" />
        <text x="400" y="700" fill="#121111" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">${targetGarment.name.toUpperCase()}</text>
        <text x="400" y="725" fill="#121111" font-family="sans-serif" font-size="11" text-anchor="middle">${targetGarment.category.toUpperCase()}</text>
        <text x="400" y="900" fill="rgba(255,255,255,0.4)" font-family="sans-serif" font-size="12" text-anchor="middle">${contextText}</text>
      </svg>
    `;
  }

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgText.trim())}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userImageUrl, garments, contextPrompt } = body ?? {};
  const contextText = contextPrompt || 'Optimal Try-On Fit';

  let garmentList: GarmentInput[] = garments || [];
  if (garmentList.length < 1) {
    return NextResponse.json(
      { error: 'At least one garment is required to generate a try-on look.' },
      { status: 400 },
    );
  }

  const targetGarment = garmentList[0];

  try {
    // Get Replicate token
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      throw new Error('REPLICATE_API_TOKEN missing. Triggering AI graphics fallback.');
    }

    // Convert userImageUrl to a public URL if it is a base64 string
    let publicUserImageUrl = userImageUrl;
    if (userImageUrl.startsWith('data:')) {
      const uploadedUrl = await uploadBase64ToSupabase(userImageUrl, 'base-photo');
      if (uploadedUrl) publicUserImageUrl = uploadedUrl;
      else throw new Error('Base photo conversion failed.');
    }

    // Convert garment image to a public URL if it is a base64 string
    let publicGarmentUrl = targetGarment.imageUrl;
    if (publicGarmentUrl.startsWith('data:')) {
      const uploadedUrl = await uploadBase64ToSupabase(publicGarmentUrl, 'garment');
      if (uploadedUrl) publicGarmentUrl = uploadedUrl;
      else throw new Error('Garment photo conversion failed.');
    }

    let categoryKey = 'upper_body';
    if (targetGarment.category === 'bottom') {
      categoryKey = 'lower_body';
    } else if (targetGarment.category === 'full outfit') {
      categoryKey = 'dresses';
    }

    // Trigger prediction via Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985',
        input: {
          human_img: publicUserImageUrl,
          garm_img: publicGarmentUrl,
          garment_des: targetGarment.name || 'garment item',
          category: categoryKey,
          steps: 30,
        },
      }),
    });

    const prediction = await response.json();
    if (prediction.error || !prediction.urls) {
      throw new Error(prediction.error || 'Start prediction failed.');
    }

    let status = prediction.status;
    let resultUrl = '';
    const pollUrl = prediction.urls.get;

    while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
      await wait(2000);
      const pollRes = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        },
      });
      const pollData = await pollRes.json();
      status = pollData.status;
      if (status === 'succeeded') {
        resultUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
        break;
      }
      if (status === 'failed' || status === 'canceled') {
        throw new Error(pollData.error || 'AI generation failed.');
      }
    }

    if (!resultUrl) throw new Error('No output URL from Replicate.');

    return NextResponse.json({
      resultImageUrl: resultUrl,
      mock: false,
    });

  } catch (err) {
    console.warn('Replicate pipeline failed. Falling back to Claude/Groq SVG generator:', err);
    try {
      const fallbackUrl = await generateFallbackSVG(targetGarment, contextText);
      return NextResponse.json({
        resultImageUrl: fallbackUrl,
        mock: true,
      });
    } catch (fallbackErr) {
      return NextResponse.json(
        { error: 'Both try-on engine and fallback generator failed.' },
        { status: 500 },
      );
    }
  }
}

