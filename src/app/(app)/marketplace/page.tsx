'use client';

import { useState } from 'react';

export default function MarketplacePage() {
  const categories = ['All Pets', 'Dogs', 'Cats', 'Bunnies', 'Fantasy', 'More'];
  const [activeCat, setActiveCat] = useState('All Pets');

  const pets = [
    { name: 'Byte', type: 'Dog', desc: 'Loyal companion with a playful personality.', color: '#ff6a3d', emoji: '🐶' },
    { name: 'Luna', type: 'Cat', desc: 'Curious and elegant. Perfect for any website.', color: '#ffb18c', emoji: '🐱' },
    { name: 'Bolt', type: 'Bunny', desc: 'Energetic and fast. Always ready to help.', color: '#ff5a0a', emoji: '🐰' },
    { name: 'Ava', type: 'Companion', desc: 'Wise and helpful. Guides your visitors.', color: '#d54d24', emoji: '🦉' },
  ];

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Internal Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🐰</div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>Pawly AI</h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--orange-500)', letterSpacing: '0.1em', fontWeight: 700 }}>MARKETPLACE</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <button style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</button>
           <button style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        position: 'relative', height: '360px', borderRadius: '2.5rem', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.9), rgba(10, 10, 15, 0.95)), url("/assets/images/background.png")',
        backgroundSize: 'cover',
        border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '3.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '420px', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '3.25rem', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Robotic pets for <br/><span style={{ color: 'var(--orange-500)' }}>your website.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1.25rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Download, customize, and deploy intelligent companions that engage your visitors.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '2.25rem' }}>
            <button className="home-hero-button" style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}>Browse all pets</button>
            <button className="btn-ghost" style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>▶</span>
              How it works
            </button>
          </div>
        </div>
        
        {/* Large Pet Preview (Mock) */}
        <div style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', width: '340px', height: '340px' }}>
           <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, var(--orange-600) 0%, transparent 70%)', filter: 'blur(50px)', opacity: 0.15 }}></div>
           <div style={{ fontSize: '10rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', filter: 'drop-shadow(0 0 20px rgba(255, 90, 10, 0.3))' }}>🐶</div>
        </div>
      </section>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)} style={{
            padding: '0.7rem 1.5rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
            background: activeCat === cat ? 'rgba(255, 106, 61, 0.1)' : 'rgba(255,255,255,0.02)',
            color: activeCat === cat ? 'var(--orange-500)' : 'rgba(255,255,255,0.6)',
            transition: 'all 0.2s ease'
          }}>{cat}{cat === 'More' ? ' ⌵' : ''}</button>
        ))}
      </div>

      {/* Popular Pets Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--orange-600)' }}>🔥</span> Popular Pets
          </h2>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View all ›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {pets.map((pet) => (
            <div key={pet.name} className="card-hover" style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.75rem', padding: '1.25rem'
            }}>
              <div style={{ position: 'relative', aspectRatio: '1/1.1', background: '#08080c', borderRadius: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', fontSize: '0.55rem', fontWeight: 900, padding: '0.3rem 0.6rem', borderRadius: '0.4rem', background: 'var(--orange-600)', color: '#000', letterSpacing: '0.05em' }}>POPULAR</div>
                <button style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '1.1rem', cursor: 'pointer', transition: 'color 0.2s' }} className="heart-hover">♡</button>
                <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 15px rgba(255, 90, 10, 0.15))' }}>{pet.emoji}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>{pet.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.5rem', borderRadius: '0.4rem', marginTop: '0.4rem', display: 'inline-block', fontWeight: 600 }}>{pet.type}</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.85rem', lineHeight: 1.5, height: '2.6rem', overflow: 'hidden' }}>{pet.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <span style={{ color: 'var(--orange-200)', fontWeight: 800, fontSize: '1.05rem' }}>Free</span>
                <button style={{ width: 38, height: 38, borderRadius: '11px', background: 'white', color: 'black', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'transform 0.2s' }} className="btn-adopt">📥</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { title: 'Easy to Download', desc: 'Get your pet files in seconds.', icon: '📥' },
          { title: 'Simple Integration', desc: 'Add to your website with one tag.', icon: '</>' },
          { title: 'Fully Customizable', desc: 'Make your pet truly yours.', icon: '✨' },
        ].map(feat => (
          <div key={feat.title} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255, 106, 61, 0.05)', border: '1px solid rgba(255, 106, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: 'var(--orange-500)' }}>{feat.icon}</div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>{feat.title}</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{feat.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Result Banner */}
      <section style={{ padding: '1.5rem 2rem', borderRadius: '1.5rem', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>✓</div>
        <div>
          <p style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '1rem' }}>The result: Happy visitors. More engagement. More conversions.</p>
          <p style={{ color: 'rgba(110, 231, 183, 0.5)', fontSize: '0.85rem', marginTop: '0.15rem' }}>From static pages to smart conversations—this is the future of websites.</p>
        </div>
      </section>
    </div>
  );
}
