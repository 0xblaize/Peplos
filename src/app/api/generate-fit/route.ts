import { NextRequest, NextResponse } from 'next/server';

interface GarmentInput {
  name: string;
  category: string;
  imageUrl: string;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function toDataURL(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error('Error fetching image for inline base64:', err, 'URL:', url);
    return url; // fallback to original URL
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userImageUrl, garmentImageUrls, garments, contextPrompt } = body ?? {};

    // Determine garments list
    let garmentList: GarmentInput[] = [];
    if (Array.isArray(garments) && garments.length > 0) {
      garmentList = garments;
    } else if (Array.isArray(garmentImageUrls)) {
      garmentList = garmentImageUrls.map((url, idx) => ({
        name: `Garment ${idx + 1}`,
        category: 'clothing',
        imageUrl: url,
      }));
    }

    if (typeof userImageUrl !== 'string' || garmentList.length < 1) {
      return NextResponse.json(
        { error: 'userImageUrl and at least one garment are required.' },
        { status: 400 },
      );
    }

    // Convert all images to base64 so they render securely inside the browser's <img> tag SVG
    const [userBase64, ...garmentBase64s] = await Promise.all([
      toDataURL(userImageUrl),
      ...garmentList.map((g) => toDataURL(g.imageUrl)),
    ]);

    const contextText = contextPrompt || 'Optimal Try-On Fit';

    // Build a beautiful editorial lookbook SVG
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#121111" />
            <stop offset="100%" stop-color="#241d20" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000" flood-opacity="0.65" />
          </filter>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="50" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Background -->
        <rect width="800" height="1100" fill="url(#bg)" />

        <!-- Subtle backdrop glow -->
        <circle cx="400" cy="500" r="300" fill="#E882B4" opacity="0.06" filter="url(#soft-glow)" />

        <!-- Base Model / User Image -->
        <g filter="url(#shadow)">
          <rect x="70" y="110" width="660" height="810" rx="32" fill="#1f1d1e" />
          <image href="${userBase64}" x="70" y="110" width="660" height="810" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-rect)" />
        </g>

        <clipPath id="clip-rect">
          <rect x="70" y="110" width="660" height="810" rx="32" />
        </clipPath>

        <!-- Branding Header -->
        <text x="70" y="72" fill="#faf7f5" font-family="'Inter', sans-serif" font-weight="900" font-size="28" letter-spacing="0.1em">PEPLOS</text>
        <text x="730" y="70" fill="rgba(255,255,255,0.4)" font-family="'Inter', sans-serif" font-weight="700" font-size="11" text-anchor="end" letter-spacing="0.25em">EDITORIAL WORKSPACE</text>
        <line x1="70" y1="88" x2="730" y2="88" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

        <!-- Garment overlay cards (Styled like luxury polaroids) -->
        ${garmentList.map((g, idx) => {
          const base64 = garmentBase64s[idx];
          // Position differently if there are 1 or 2 garments
          const count = garmentList.length;
          let transform = '';
          if (count === 1) {
            transform = 'translate(470, 620) rotate(-3)';
          } else if (idx === 0) {
            transform = 'translate(420, 620) rotate(-6)';
          } else {
            transform = 'translate(510, 640) rotate(5)';
          }

          return `
            <g transform="${transform}" filter="url(#shadow)">
              <rect width="210" height="260" rx="16" fill="#ffffff" />
              <rect x="10" y="10" width="190" height="190" rx="10" fill="#fcfaf9" />
              <image href="${base64}" x="10" y="10" width="190" height="190" preserveAspectRatio="xMidYMid slice" clip-path="url(#g-clip-${idx})" />
              <clipPath id="g-clip-${idx}">
                <rect x="10" y="10" width="190" height="190" rx="10" />
              </clipPath>
              <text x="16" y="222" fill="#171516" font-family="'Inter', sans-serif" font-weight="700" font-size="12" letter-spacing="-0.02em">${g.name.toUpperCase()}</text>
              <text x="16" y="240" fill="#E882B4" font-family="'Inter', sans-serif" font-weight="800" font-size="9" letter-spacing="0.08em">${g.category.toUpperCase()}</text>
            </g>
          `;
        }).join('')}

        <!-- Context & Details Footer -->
        <rect x="70" y="950" width="660" height="80" rx="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        
        <!-- Small hanger logo watermark in footer -->
        <g transform="translate(95, 972) scale(0.65)" stroke="#E882B4" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- hanger hook -->
          <path d="M 20 10 C 20 4, 28 4, 28 10 C 28 15, 20 18, 20 22" />
          <!-- hanger triangle -->
          <path d="M 20 22 L 5 32 C 5 35, 35 35, 35 32 Z" />
        </g>

        <text x="140" y="986" fill="#faf7f5" font-family="'Inter', sans-serif" font-weight="700" font-size="13" letter-spacing="0.05em">RECOMMENDED STYLE FOR</text>
        <text x="140" y="1006" fill="rgba(255,255,255,0.6)" font-family="'Inter', sans-serif" font-weight="500" font-size="12">${contextText}</text>
        
        <text x="710" y="996" fill="rgba(255,255,255,0.3)" font-family="monospace" font-size="10" text-anchor="end" letter-spacing="0.1em">PEPLOS LABS v2.0</text>
      </svg>
    `;

    // Wait a brief moment to simulate processing
    await wait(1500);

    return NextResponse.json({
      resultImageUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent.trim())}`,
      mock: true,
    });
  } catch (err) {
    console.error('Error generating VTO layout:', err);
    return NextResponse.json({ error: 'Unable to generate the virtual try-on.' }, { status: 500 });
  }
}

