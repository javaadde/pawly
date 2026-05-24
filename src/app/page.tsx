'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Animated pet SVG component (CSS-only cat)
function PawlyPet({ color = '#7C3AED', size = 120 }: { color?: string; size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="animate-float relative">
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        {/* Glow */}
        <ellipse cx="60" cy="105" rx="28" ry="6" fill={color} opacity="0.2" />
        {/* Body */}
        <ellipse cx="60" cy="72" rx="32" ry="28" fill={color} />
        {/* Belly */}
        <ellipse cx="60" cy="75" rx="18" ry="16" fill="white" opacity="0.15" />
        {/* Head */}
        <circle cx="60" cy="45" r="28" fill={color} />
        {/* Ears */}
        <polygon points="34,24 26,8 44,20" fill={color} />
        <polygon points="86,24 94,8 76,20" fill={color} />
        {/* Ear inner */}
        <polygon points="35,22 29,12 42,20" fill="#f472b6" opacity="0.6" />
        <polygon points="85,22 91,12 78,20" fill="#f472b6" opacity="0.6" />
        {/* Eyes */}
        <ellipse cx="49" cy="43" rx="6" ry="7" fill="white" />
        <ellipse cx="71" cy="43" rx="6" ry="7" fill="white" />
        <circle cx="51" cy="44" r="4" fill="#1a1a2e" />
        <circle cx="73" cy="44" r="4" fill="#1a1a2e" />
        {/* Eye shine */}
        <circle cx="53" cy="42" r="1.5" fill="white" />
        <circle cx="75" cy="42" r="1.5" fill="white" />
        {/* Nose */}
        <ellipse cx="60" cy="53" rx="3" ry="2" fill="#f472b6" />
        {/* Mouth */}
        <path d="M55 56 Q60 60 65 56" stroke="#f472b6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="30" y1="52" x2="52" y2="54" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="30" y1="56" x2="52" y2="56" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="68" y1="54" x2="90" y2="52" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="68" y1="56" x2="90" y2="56" stroke="white" strokeWidth="1" opacity="0.6" />
        {/* Tail */}
        <path d="M88 80 Q108 65 104 50 Q102 42 96 46" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* Paws */}
        <ellipse cx="40" cy="96" rx="10" ry="8" fill={color} />
        <ellipse cx="80" cy="96" rx="10" ry="8" fill={color} />
        {/* Paw toes */}
        <ellipse cx="36" cy="102" rx="4" ry="3" fill={color} opacity="0.8" />
        <ellipse cx="44" cy="103" rx="4" ry="3" fill={color} opacity="0.8" />
        <ellipse cx="76" cy="102" rx="4" ry="3" fill={color} opacity="0.8" />
        <ellipse cx="84" cy="103" rx="4" ry="3" fill={color} opacity="0.8" />
        {/* Blush */}
        <ellipse cx="43" cy="52" rx="5" ry="3" fill="#f472b6" opacity="0.25" />
        <ellipse cx="77" cy="52" rx="5" ry="3" fill="#f472b6" opacity="0.25" />
      </svg>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay = 0 }: { icon: string; title: string; desc: string; delay?: number }) {
  return (
    <div
      className="card card-hover animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white' }}
      >
        {step}
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ background: 'var(--dark-bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--dark-border)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>🐾</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Pawly</span>
            <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" className="btn-ghost" style={{ fontSize: '0.875rem' }}>Features</a>
            <a href="#how-it-works" className="btn-ghost" style={{ fontSize: '0.875rem' }}>How it works</a>
            <Link href="/login" className="btn-ghost" style={{ fontSize: '0.875rem' }}>Login</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* BG Orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '5%', left: '15%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
          <div className="badge" style={{ margin: '0 auto 1.5rem', width: 'fit-content' }}>
            🎉 Built for the next-gen web
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            {mounted && <PawlyPet color="#7C3AED" size={140} />}
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', color: 'white' }}>
            Add a cute AI pet to{' '}
            <span className="gradient-text">any website</span>
            <br />with one script tag
          </h1>

          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Pawly turns your boring chatbot into a friendly animated pet mascot that chats, guides visitors, answers questions using your business data, and captures leads.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              🐾 Start for free
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              See how it works
            </a>
          </div>

          {/* Script preview */}
          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
            <div className="code-block" style={{ maxWidth: 560, width: '100%', textAlign: 'left' }}>
              <span style={{ color: '#6b7280' }}>&lt;</span>
              <span style={{ color: '#c084fc' }}>script</span>
              <span style={{ color: '#34d399' }}> src</span>
              <span style={{ color: '#6b7280' }}>=</span>
              <span style={{ color: '#fbbf24' }}>&quot;https://pawly.ai/widget.js&quot;</span>
              <br />
              {'       '}
              <span style={{ color: '#34d399' }}>data-pet-id</span>
              <span style={{ color: '#6b7280' }}>=</span>
              <span style={{ color: '#fbbf24' }}>&quot;your-pet-id&quot;</span>
              <span style={{ color: '#6b7280' }}>&gt;&lt;/</span>
              <span style={{ color: '#c084fc' }}>script</span>
              <span style={{ color: '#6b7280' }}>&gt;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '2rem 0', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
          {[
            { val: '1 min', label: 'Setup time' },
            { val: '< 30kb', label: 'Widget size' },
            { val: '100%', label: 'Your data only' },
            { val: '∞', label: 'Personality options' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800 }}>{val}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '6rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="badge" style={{ margin: '0 auto 1rem', width: 'fit-content' }}>✨ Features</div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white' }}>
              Everything your website needs
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1.0625rem' }}>
              From animated pet mascot to AI chat to lead capture — all in one.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <FeatureCard delay={0}   icon="🐱" title="Cute Animated Pet"       desc="A floating CSS-animated pet mascot that waves, blinks, bounces, and reacts to visitor interactions." />
            <FeatureCard delay={50}  icon="🧠" title="AI-Powered Answers"      desc="Trained only on your website/business data. Visitors get accurate, helpful answers — never hallucinations." />
            <FeatureCard delay={100} icon="🗺️" title="Guide Visitors"          desc="Pawly scrolls to and highlights sections like pricing, menu, contact, or booking automatically." />
            <FeatureCard delay={150} icon="📋" title="Lead Capture"             desc="Pawly collects visitor name, email, phone, and requirements in a friendly, non-intrusive way." />
            <FeatureCard delay={200} icon="⚡" title="One Script Tag"           desc="Paste one line of HTML anywhere. No frameworks, no complex setup. Works on any website." />
            <FeatureCard delay={250} icon="🎨" title="Fully Customizable"       desc="Choose pet name, color, personality, greeting message, and position to match your brand perfectly." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '6rem 0', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="badge" style={{ margin: '0 auto 1rem', width: 'fit-content' }}>🚀 How it works</div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white' }}>Up and running in minutes</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <StepCard step="1" title="Create your pet" desc="Give Pawly a name, color, and personality that matches your brand." />
              <StepCard step="2" title="Add your knowledge" desc="Paste your FAQs, services, pricing, hours — any info visitors might ask about." />
              <StepCard step="3" title="Copy your script tag" desc="One line of code. Paste it before </body> on your website." />
              <StepCard step="4" title="Watch Pawly work" desc="Visitors see an animated pet, click it, ask questions, and get guided around your site." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Mock chat window */}
              <div className="card" style={{ width: 300, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--dark-border)' }}>
                  {mounted && <PawlyPet color="#7C3AED" size={40} />}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>Pawly</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>● Online</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ background: 'rgba(124,58,237,0.2)', borderRadius: '0.75rem 0.75rem 0.75rem 0', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'white', maxWidth: '85%' }}>
                    Hi! 👋 How can I help you today?
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '0.75rem 0.75rem 0 0.75rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '85%', alignSelf: 'flex-end' }}>
                    Where&apos;s the pricing?
                  </div>
                  <div style={{ background: 'rgba(124,58,237,0.2)', borderRadius: '0.75rem 0.75rem 0.75rem 0', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'white', maxWidth: '85%' }}>
                    I&apos;ll take you there! 🎯 Scrolling to pricing now...
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Ask anything...
                  </div>
                  <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '0.875rem' }}>
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 1.5rem' }}>
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.1) 100%)',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            {mounted && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}><PawlyPet color="#7C3AED" size={80} /></div>}
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
              Ready to make your website alive?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Join website owners who are using Pawly to engage visitors, answer questions, and capture more leads.
            </p>
            <Link href="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }}>
              🐾 Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--dark-border)', padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🐾</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Pawly AI</span>
          </div>
          <div>© {new Date().getFullYear()} Pawly AI. Making websites feel alive.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
            <Link href="/signup" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
