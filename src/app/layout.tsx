import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Peplos — Your outfit, decided for you',
  description:
    'Peplos cross-references your calendar, the weather, and your closet to dress your 3D avatar in the optimal outfit from your clean clothes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
