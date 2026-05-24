'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PET_TYPES = [
  { value: 'cat', label: 'Cat 🐱', emoji: '🐱' },
  { value: 'dog', label: 'Dog 🐶', emoji: '🐶' },
  { value: 'bunny', label: 'Bunny 🐰', emoji: '🐰' },
];

const PERSONALITIES = [
  { value: 'friendly', label: 'Friendly', desc: 'Warm and cheerful' },
  { value: 'professional', label: 'Professional', desc: 'Polite and concise' },
  { value: 'funny', label: 'Funny', desc: 'Playful with humor' },
  { value: 'calm', label: 'Calm', desc: 'Soft and reassuring' },
];

export default function NewPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    petType: 'cat',
    brandColor: '#7C3AED',
    greetingMessage: "Hi! 👋 I'm here to help! What can I do for you today?",
    personality: 'friendly',
    position: 'bottom-right',
    allowedDomain: '',
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          allowedDomain: form.allowedDomain || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create pet');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/pets/${data.pet._id}/knowledge`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: 700 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem' }}>Create a new pet ✨</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Customize your AI pet mascot for your website.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {error && <div className="alert alert-error">{error}</div>}

        {/* Pet name */}
        <div className="field">
          <label className="label" htmlFor="pet-name">Pet name *</label>
          <input id="pet-name" className="input" placeholder="e.g. Bella, Max, Luna" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>This is what visitors will see above the chat window.</p>
        </div>

        {/* Pet type */}
        <div className="field">
          <label className="label">Pet type</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {PET_TYPES.map(({ value, emoji, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('petType', value)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `2px solid ${form.petType === value ? 'var(--purple-500)' : 'var(--dark-border)'}`,
                  background: form.petType === value ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                  color: form.petType === value ? 'var(--purple-400)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.15s ease',
                }}
                id={`pet-type-${value}`}
              >
                <span style={{ fontSize: '1.75rem' }}>{emoji}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand color */}
        <div className="field">
          <label className="label">Brand color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="color" value={form.brandColor} onChange={(e) => set('brandColor', e.target.value)} id="brand-color" />
            <div>
              <p style={{ color: 'white', fontWeight: 500, fontSize: '0.9rem' }}>{form.brandColor}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>The pet and chat panel will use this color.</p>
            </div>
          </div>
        </div>

        {/* Personality */}
        <div className="field">
          <label className="label">Personality</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            {PERSONALITIES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('personality', value)}
                id={`personality-${value}`}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '0.625rem',
                  border: `2px solid ${form.personality === value ? 'var(--purple-500)' : 'var(--dark-border)'}`,
                  background: form.personality === value ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: form.personality === value ? 'var(--purple-400)' : 'white' }}>{label}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Greeting */}
        <div className="field">
          <label className="label" htmlFor="greeting">Greeting message</label>
          <textarea
            id="greeting"
            className="input"
            rows={3}
            value={form.greetingMessage}
            onChange={(e) => set('greetingMessage', e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Position */}
        <div className="field">
          <label className="label">Widget position</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['bottom-right', 'bottom-left'].map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => set('position', pos)}
                id={`position-${pos}`}
                style={{
                  flex: 1, padding: '0.75rem',
                  borderRadius: '0.625rem',
                  border: `2px solid ${form.position === pos ? 'var(--purple-500)' : 'var(--dark-border)'}`,
                  background: form.position === pos ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                  color: form.position === pos ? 'var(--purple-400)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                {pos === 'bottom-right' ? '↘ Bottom Right' : '↙ Bottom Left'}
              </button>
            ))}
          </div>
        </div>

        {/* Allowed domain */}
        <div className="field">
          <label className="label" htmlFor="domain">Allowed domain <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
          <input id="domain" className="input" placeholder="e.g. example.com" value={form.allowedDomain} onChange={(e) => set('allowedDomain', e.target.value)} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Leave empty to allow the widget on any website (useful for testing).</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} id="cancel-pet">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }} id="create-pet-submit">
            {loading ? '🐾 Creating...' : '🐾 Create Pet & Add Knowledge'}
          </button>
        </div>
      </form>
    </div>
  );
}
