'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import petHero from '@/assets/images/pet-2.png';

interface Pet {
  _id: string;
  name: string;
  petType: string;
  description: string;
  brandColor: string;
  emoji: string;
  isPopular: boolean;
  downloads: number;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Pets' },
    { id: 'dog', label: 'Dogs' },
    { id: 'cat', label: 'Cats' },
    { id: 'bunny', label: 'Bunnies' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'robot', label: 'Robots' },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      async function fetchPets() {
        setLoading(true);
        try {
          const res = await fetch(`/api/marketplace?type=${activeCat}&q=${searchTerm}`);
          const data = await res.json();
          setPets(data.pets || []);
        } catch (err) {
          console.error('Failed to fetch marketplace pets:', err);
        } finally {
          setLoading(false);
        }
      }
      fetchPets();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCat, searchTerm]);

  async function handleAdopt(marketplaceId: string) {
    if (installing) return;
    setInstalling(marketplaceId);
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketplaceId }),
      });
      const data = await res.json();
      if (data.pet) {
        router.push(`/pets/${data.pet._id}`);
      }
    } catch (err) {
      console.error('Failed to adopt pet:', err);
    } finally {
      setInstalling(null);
    }
  }

  return (
    <div className="marketplace-container" style={{ padding: '0rem 4rem 6rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Main Hero Showcase */}
      <section className="home-feature-card" style={{ 
        position: 'relative', height: '520px', borderRadius: '2.5rem', overflow: 'hidden',
        display: 'flex', alignItems: 'center', marginBottom: '5rem', padding: 0, border: '1px solid rgba(255,255,255,0.08)',
        marginTop: '2rem'
      }}>
        {/* Visual Background Elements */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(255, 106, 61, 0.08), transparent 50%)', zIndex: 0 }}></div>
        
        <div style={{ maxWidth: '640px', padding: '0 5rem', position: 'relative', zIndex: 2 }}>
          <p className="home-hero-kicker" style={{ position: 'static', marginBottom: '1.5rem', display: 'inline-flex' }}>Featured Model</p>
          <h2 style={{ fontSize: '4.5rem', fontWeight: 900, color: 'white', lineHeight: 0.92, letterSpacing: '-0.07em' }}>
            Advanced <br/><span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>AI Spirits.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1.5rem', fontSize: '1.15rem', lineHeight: 1.65, maxWidth: '440px', fontWeight: 500 }}>
            Deploy high-fidelity companions with integrated memory and emotional intelligence.
          </p>
          <div className="home-hero-actions" style={{ justifyContent: 'flex-start', marginTop: '2.5rem' }}>
            <button 
              onClick={() => router.push('/pets-create')}
              className="home-hero-button"
              style={{ marginTop: 0, minHeight: '3.4rem' }}
            >
              Create a new design
            </button>
            <button className="home-hero-button home-hero-button-secondary" style={{ marginTop: 0, minHeight: '3.4rem' }}>
              Sell your created design
            </button>
          </div>
        </div>
        
        {/* Featured Image */}
        <div style={{ position: 'absolute', right: '4%', bottom: '-4%', width: '540px', height: '540px', zIndex: 1 }}>
           <Image 
             src={petHero} 
             alt="Featured Pet" 
             style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))' }}
             priority
           />
        </div>
      </section>

      {/* Category Navigation & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="home-section-kicker" style={{ marginRight: '1.5rem', fontSize: '0.75rem' }}>Filter by</span>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
              padding: '0.6rem 1.4rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 800,
              background: activeCat === cat.id ? '#f6f1eb' : 'transparent',
              color: activeCat === cat.id ? '#101010' : 'rgba(255,255,255,0.5)',
              border: 'none',
              transition: 'all 0.2s ease',
            }}>{cat.label}</button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '320px', flexShrink: 0 }}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ 
              position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', 
              width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.4)' 
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '3.2rem',
              padding: '0 1.25rem 0 3rem',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="home-feature-card" style={{ height: '460px', opacity: 0.4, animation: 'pulse 2s infinite' }}></div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {pets.map((pet) => (
            <div key={pet._id} className="home-feature-card marketplace-card-v2" style={{
              display: 'flex', flexDirection: 'column', padding: '1.75rem', transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
            }}>
              <div style={{ 
                position: 'relative', aspectRatio: '1/1', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', 
                marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' 
              }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${pet.brandColor}10 0%, transparent 70%)` }}></div>
                <span style={{ fontSize: '6.5rem', zIndex: 1, filter: `drop-shadow(0 15px 30px ${pet.brandColor}25)` }}>{pet.emoji}</span>
                
                {pet.isPopular && (
                  <span style={{ 
                    position: 'absolute', top: '1rem', right: '1rem', background: '#f6f1eb', color: '#101010', 
                    fontSize: '0.65rem', fontWeight: 900, padding: '0.35rem 0.75rem', borderRadius: '999px', 
                    textTransform: 'uppercase', letterSpacing: '0.05em' 
                  }}>Popular</span>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.04em' }}>{pet.name}</h3>
                  <span className="home-feature-index">{pet.petType}</span>
                </div>
                
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginTop: '0.85rem', lineHeight: 1.6, height: '3rem', overflow: 'hidden' }}>
                  {pet.description}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2.5rem' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>Free</span>
                <button 
                  onClick={() => handleAdopt(pet._id)}
                  disabled={!!installing}
                  className="home-hero-button"
                  style={{ 
                    marginTop: 0, minHeight: '2.8rem', padding: '0 1.5rem', fontSize: '0.85rem',
                    background: installing === pet._id ? 'rgba(255,255,255,0.1)' : '#f6f1eb',
                    opacity: installing ? 0.7 : 1
                  }}
                >
                  {installing === pet._id ? 'Deploying...' : 'Deploy Spirit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && pets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '8rem 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.4rem', fontWeight: 600 }}>No companions found in this category.</p>
          <button 
            onClick={() => setActiveCat('all')}
            className="home-hero-button home-hero-button-secondary"
            style={{ marginTop: '2rem' }}
          >
            Show all models
          </button>
        </div>
      )}

      <style jsx global>{`
        .marketplace-card-v2:hover {
          transform: translateY(-8px);
          border-color: rgba(255,255,255,0.15) !important;
          background: linear-gradient(180deg, rgba(20, 20, 20, 0.96), rgba(12, 12, 12, 0.98)) !important;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5) !important;
        }
        .btn-hover-pill:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        @keyframes pulse {
          0% { opacity: 0.2; }
          50% { opacity: 0.4; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
