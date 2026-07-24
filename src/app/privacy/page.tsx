import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Peplos',
  description: 'How Peplos collects, uses, and protects your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0f0e0e', color: '#faf7f5', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em', color: '#faf7f5', textDecoration: 'none' }}>
            PEPLOS
          </Link>
          <Link href="/" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            ← Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '4rem 1.5rem 3rem' }}>
        <div className="mx-auto max-w-4xl">
          <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#E882B4', marginBottom: '1rem' }}>
            Legal
          </p>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12" style={{ lineHeight: 1.8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <Section title="1. Overview">
            <p>Peplos (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a generative wardrobe studio that helps you build outfits from your personal closet. This Privacy Policy explains how we collect, use, store, and protect your information when you use our application at <a href="https://peplos.vercel.app" style={linkStyle}>peplos.vercel.app</a>.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following types of information:</p>
            <ul style={listStyle}>
              <li><strong>Account information:</strong> When you sign in with Google, we receive your name, email address, and profile picture from Google OAuth.</li>
              <li><strong>Closet data:</strong> Photos and metadata (name, category, colour, warmth, formality) of garments you upload to your closet inventory.</li>
              <li><strong>Calendar data:</strong> If you connect Google Calendar, we read your upcoming events to provide outfit context. We do not store calendar data permanently.</li>
              <li><strong>Usage data:</strong> Basic analytics such as pages visited and features used, collected automatically by our hosting provider (Vercel).</li>
              <li><strong>Location context:</strong> A city name you optionally provide for weather-based outfit recommendations. We do not collect precise GPS location.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul style={listStyle}>
              <li>To provide and operate the Peplos service, including generating outfit recommendations.</li>
              <li>To store your closet inventory in our database (Supabase) so it persists across sessions.</li>
              <li>To personalise outfit suggestions based on your calendar schedule and local weather.</li>
              <li>To send you service-related communications (no marketing emails without your explicit consent).</li>
              <li>To improve and debug the application.</li>
            </ul>
          </Section>

          <Section title="4. Third-Party Services">
            <p>Peplos integrates with the following third-party services, each governed by their own privacy policy:</p>
            <ul style={listStyle}>
              <li><strong>Google OAuth &amp; Google Calendar API</strong> — for sign-in and schedule context. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Google Privacy Policy</a></li>
              <li><strong>Supabase</strong> — database and file storage for your closet items. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Supabase Privacy Policy</a></li>
              <li><strong>Vercel</strong> — application hosting and deployment. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Vercel Privacy Policy</a></li>
              <li><strong>OpenWeatherMap</strong> — weather data for outfit context (no personal data is shared). <a href="https://openweathermap.org/privacy-policy" target="_blank" rel="noopener noreferrer" style={linkStyle}>OpenWeatherMap Privacy Policy</a></li>
              <li><strong>Groq / Llama</strong> — AI language model for outfit rationale generation.</li>
            </ul>
          </Section>

          <Section title="5. Data Storage & Security">
            <p>Your closet data is stored in a Supabase database secured with row-level security policies. Garment images are stored in Supabase Storage with public read access (so the images can render in the app) but are only writable by authenticated users.</p>
            <p style={{ marginTop: '0.75rem' }}>We take reasonable technical and organisational measures to protect your data. However, no internet transmission is 100% secure.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your closet data for as long as you have an active account. You may delete individual items at any time from within the app. To request complete deletion of your account and all associated data, contact us at the email below.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location, you may have rights including:</p>
            <ul style={listStyle}>
              <li>The right to access the personal data we hold about you.</li>
              <li>The right to correct inaccurate data.</li>
              <li>The right to request deletion of your data.</li>
              <li>The right to withdraw consent at any time (e.g. disconnect Google Calendar).</li>
              <li>The right to lodge a complaint with a data protection authority.</li>
            </ul>
          </Section>

          <Section title="8. Children's Privacy">
            <p>Peplos is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last updated&quot; date at the top of this page. Continued use of Peplos after changes constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have any questions or requests regarding this Privacy Policy, please contact us at:</p>
            <div style={{ marginTop: '1rem', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              <p style={{ margin: 0 }}><strong>Peplos</strong><br />
              Email: <a href="mailto:privacy@peplos.app" style={linkStyle}>privacy@peplos.app</a><br />
              Website: <a href="https://peplos.vercel.app" style={linkStyle}>peplos.vercel.app</a></p>
            </div>
          </Section>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Terms of Service →</Link>
          <Link href="/" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Back to Peplos →</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.25rem', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '0.875rem', color: '#faf7f5' }}>
        {title}
      </h2>
      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );
}

const linkStyle: React.CSSProperties = {
  color: '#E882B4',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
};

const listStyle: React.CSSProperties = {
  paddingLeft: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginTop: '0.5rem',
};
