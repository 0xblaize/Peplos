import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Peplos — Your outfit, decided for you',
  description:
    'Peplos cross-references your calendar, the weather, and your closet to dress your 3D avatar in the optimal outfit from your clean clothes.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'Peplos — Your outfit, decided for you',
    description: 'Generative wardrobe studio. Your fit, decided.',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Peplos' }],
  },
  verification: {
    google: 'QSRgs5KtDyqMMWFoLRg0afCU2H2_OWtNt-P7fXGfL9o',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Search Console verification — also set via metadata API above */}
        <meta name="google-site-verification" content="QSRgs5KtDyqMMWFoLRg0afCU2H2_OWtNt-P7fXGfL9o" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
