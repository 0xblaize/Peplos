import Hero from '@/components/Hero';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Peplos',
    url: 'https://peplos.vercel.app',
    description:
      'Peplos is a generative AI wardrobe studio that cross-references your calendar, the weather, and your personal closet to recommend the perfect outfit for your day.',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
    </>
  );
}
