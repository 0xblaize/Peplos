import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fifth-gentle-45902158.figma.site' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
