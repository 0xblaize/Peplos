import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Peplos',
  description: 'The terms and conditions governing your use of Peplos.',
};

export default function TermsPage() {
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
          <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#F4845F', marginBottom: '1rem' }}>
            Legal
          </p>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using Peplos (&quot;the Service&quot;), operated at <a href="https://peplos.vercel.app" style={linkStyle}>peplos.vercel.app</a>, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service.</p>
            <p style={{ marginTop: '0.75rem' }}>We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>Peplos is a generative wardrobe studio that helps users build outfit recommendations by cross-referencing their personal closet inventory, calendar schedule, and local weather conditions. The Service uses AI to generate editorial outfit images and styling suggestions.</p>
          </Section>

          <Section title="3. Eligibility">
            <p>You must be at least 13 years of age to use Peplos. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you represent that you have parental or guardian consent to use the Service.</p>
          </Section>

          <Section title="4. Account & Authentication">
            <ul style={listStyle}>
              <li>You may sign in to Peplos using your Google account via Google OAuth. By doing so, you authorise us to access the Google account data described in our <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>.</li>
              <li>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</li>
              <li>You agree to notify us immediately of any unauthorised use of your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </Section>

          <Section title="5. User Content">
            <p>You retain full ownership of any content you upload to Peplos, including garment photos and closet data (&quot;User Content&quot;).</p>
            <p style={{ marginTop: '0.75rem' }}>By uploading User Content, you grant Peplos a limited, non-exclusive, royalty-free licence to store, display, and process your content solely for the purpose of providing the Service to you.</p>
            <p style={{ marginTop: '0.75rem' }}>You agree not to upload content that:</p>
            <ul style={listStyle}>
              <li>Infringes any third-party intellectual property rights.</li>
              <li>Contains illegal, harmful, or offensive material.</li>
              <li>Includes personal information of other individuals without their consent.</li>
            </ul>
          </Section>

          <Section title="6. Acceptable Use">
            <p>You agree not to:</p>
            <ul style={listStyle}>
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations.</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its related systems.</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
              <li>Use automated tools (bots, scrapers) to access the Service without our written permission.</li>
              <li>Transmit viruses, malware, or any other malicious code.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            </ul>
          </Section>

          <Section title="7. AI-Generated Content">
            <p>Peplos uses artificial intelligence to generate outfit suggestions and editorial images. You acknowledge that:</p>
            <ul style={listStyle}>
              <li>AI-generated recommendations are for inspiration and entertainment purposes only and do not constitute professional styling advice.</li>
              <li>Generated images and content may not always be accurate, appropriate, or error-free.</li>
              <li>Peplos does not guarantee the quality, accuracy, or suitability of any AI-generated output.</li>
            </ul>
          </Section>

          <Section title="8. Third-Party Integrations">
            <p>The Service integrates with third-party platforms including Google Calendar, OpenWeatherMap, Supabase, and Groq. Your use of these integrations is subject to the respective third-party terms of service. Peplos is not responsible for the availability, accuracy, or practices of any third-party service.</p>
          </Section>

          <Section title="9. Intellectual Property">
            <p>The Peplos name, logo, design, and all original application content (excluding User Content) are the intellectual property of Peplos and are protected by applicable copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our explicit written consent.</p>
          </Section>

          <Section title="10. Disclaimers">
            <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
            <p style={{ marginTop: '0.75rem' }}>Peplos does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>TO THE FULLEST EXTENT PERMITTED BY LAW, PEPLOS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p style={{ marginTop: '0.75rem' }}>Our total liability to you for any claim arising out of these Terms shall not exceed the greater of £50 or the amount you have paid us in the past 12 months.</p>
          </Section>

          <Section title="12. Termination">
            <p>We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for any reason including violation of these Terms.</p>
            <p style={{ marginTop: '0.75rem' }}>You may stop using the Service at any time. To request deletion of your data, contact us at <a href="mailto:privacy@peplos.app" style={linkStyle}>privacy@peplos.app</a>.</p>
          </Section>

          <Section title="13. Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </Section>

          <Section title="14. Contact">
            <p>For any questions regarding these Terms, please contact us at:</p>
            <div style={{ marginTop: '1rem', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              <p style={{ margin: 0 }}><strong>Peplos</strong><br />
              Email: <a href="mailto:legal@peplos.app" style={linkStyle}>legal@peplos.app</a><br />
              Website: <a href="https://peplos.vercel.app" style={linkStyle}>peplos.vercel.app</a></p>
            </div>
          </Section>

        </div>

        {/* Footer nav */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Privacy Policy →</Link>
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
  color: '#F4845F',
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
