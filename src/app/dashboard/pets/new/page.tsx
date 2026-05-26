'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { AnimatedPart, PetImages } from '@/types';

const PET_TYPES = [
  { value: 'cat', label: 'Cat 🐱', emoji: '🐱' },
  { value: 'dog', label: 'Dog 🐶', emoji: '🐶' },
  { value: 'bunny', label: 'Bunny 🐰', emoji: '🐰' },
  { value: 'robot', label: 'Robot 🤖', emoji: '🤖' },
];

const PERSONALITIES = [
  { value: 'friendly', label: 'Friendly', desc: 'Warm and cheerful' },
  { value: 'professional', label: 'Professional', desc: 'Polite and concise' },
  { value: 'funny', label: 'Funny', desc: 'Playful with humor' },
  { value: 'calm', label: 'Calm', desc: 'Soft and reassuring' },
];

const VIEW_UPLOADS = [
  { key: 'front', label: 'Front view', hint: 'Used while the pet is facing forward.' },
  { key: 'left', label: 'Left view', hint: 'Used while the pet moves to the left.' },
  { key: 'right', label: 'Right view', hint: 'Used while the pet moves to the right.' },
] as const;

const ANIMATION_OPTIONS: Array<{ value: AnimatedPart; label: string; desc: string }> = [
  { value: 'head', label: 'Head', desc: 'Small nodding motion.' },
  { value: 'hands', label: 'Hands', desc: 'Short waving motion.' },
  { value: 'legs', label: 'Legs', desc: 'Walking motion while roaming.' },
  { value: 'tail', label: 'Tail', desc: 'Gentle side-to-side wag.' },
];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export default function NewPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingView, setUploadingView] = useState<keyof PetImages | ''>('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    petType: 'cat',
    brandColor: '#7C3AED',
    greetingMessage: "Hi! 👋 I'm here to help! What can I do for you today?",
    personality: 'friendly',
    position: 'bottom-right',
    allowedDomain: '',
    petImages: {
      front: '',
      left: '',
      right: '',
    } as PetImages,
    animatedParts: ['legs'] as AnimatedPart[],
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function updatePetImage(view: keyof PetImages, file: File | null) {
    if (!file) return;

    setUploadingView(view);

    try {
      const image = await readFileAsDataUrl(file);
      if (!image) {
        throw new Error('Invalid image file');
      }

      setForm((current) => ({
        ...current,
        petImages: {
          ...current.petImages,
          [view]: image,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingView('');
    }
  }

  function toggleAnimatedPart(part: AnimatedPart) {
    setForm((current) => ({
      ...current,
      animatedParts: current.animatedParts.includes(part)
        ? current.animatedParts.filter((item) => item !== part)
        : [...current.animatedParts, part],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.petImages.front || !form.petImages.left || !form.petImages.right) {
      setError('Please upload the front, left, and right pet images.');
      return;
    }

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

        <div className="field">
          <label className="label">Pet images *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {VIEW_UPLOADS.map(({ key, label, hint }) => (
              <label
                key={key}
                htmlFor={`pet-image-${key}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '0.875rem',
                  borderRadius: '0.875rem',
                  border: `1px solid ${form.petImages[key] ? 'rgba(168,85,247,0.45)' : 'var(--dark-border)'}`,
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{hint}</p>
                </div>
                <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: '0.75rem', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {form.petImages[key] ? (
                    <Image src={form.petImages[key]} alt={`${label} preview`} fill unoptimized style={{ objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.75rem' }}>
                      {uploadingView === key ? 'Uploading...' : 'Click to upload'}
                    </span>
                  )}
                </div>
                <input
                  id={`pet-image-${key}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => updatePetImage(key, e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </label>
            ))}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Upload one image for each pet angle so the widget can switch between front, left, and right views.
          </p>
        </div>

        <div className="field">
          <label className="label">Animated body parts</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.625rem' }}>
            {ANIMATION_OPTIONS.map(({ value, label, desc }) => {
              const selected = form.animatedParts.includes(value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleAnimatedPart(value)}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${selected ? 'var(--purple-500)' : 'var(--dark-border)'}`,
                    background: selected ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <p style={{ color: selected ? 'var(--purple-400)' : 'white', fontWeight: 600, fontSize: '0.875rem' }}>{label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{desc}</p>
                </button>
              );
            })}
          </div>
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
