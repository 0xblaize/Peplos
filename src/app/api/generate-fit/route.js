import { NextResponse } from 'next/server';

const PLACEHOLDER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1f1f1f" />
        <stop offset="100%" stop-color="#b9789b" />
      </linearGradient>
    </defs>
    <rect width="800" height="1100" fill="url(#bg)" />
    <text x="400" y="510" fill="#fff" font-family="Arial, sans-serif" font-size="34" text-anchor="middle">AI GENERATED FIT</text>
    <text x="400" y="555" fill="#fff" opacity=".72" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">Your virtual try-on preview</text>
  </svg>
`;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userImageUrl, garmentImageUrl } = body ?? {};

    if (typeof userImageUrl !== 'string' || typeof garmentImageUrl !== 'string') {
      return NextResponse.json(
        { error: 'userImageUrl and garmentImageUrl are required.' },
        { status: 400 },
      );
    }

    // Inject the Fashn.ai or Replicate API key and external VTO request here.
    await wait(3000);

    return NextResponse.json({
      resultImageUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PLACEHOLDER_SVG)}`,
      mock: true,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to generate the virtual try-on.' }, { status: 500 });
  }
}
