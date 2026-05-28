'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  { key: 'front', label: 'Front view', hint: 'Facing forward' },
  { key: 'left', label: 'Left view', hint: 'Moving left' },
  { key: 'right', label: 'Right view', hint: 'Moving right' },
] as const;

const ANIMATION_OPTIONS: Array<{ value: AnimatedPart; label: string; desc: string }> = [
  { value: 'head', label: 'Head', desc: 'Nodding motion' },
  { value: 'hands', label: 'Hands', desc: 'Waving motion' },
  { value: 'legs', label: 'Legs', desc: 'Walking motion' },
  { value: 'tail', label: 'Tail', desc: 'Gentle wag' },
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingView, setUploadingView] = useState<keyof PetImages | ''>('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    petType: 'cat',
    brandColor: '#ff6a3d',
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

  const totalSteps = 4;

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function updatePetImage(view: keyof PetImages, file: File | null) {
    if (!file) return;
    setUploadingView(view);
    try {
      const image = await readFileAsDataUrl(file);
      if (!image) throw new Error('Invalid image file');
      setForm((current) => ({
        ...current,
        petImages: { ...current.petImages, [view]: image },
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

  function nextStep() {
    if (step === 1 && !form.name) {
      setError('Please give your pet a name.');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function prevStep() {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
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
        body: JSON.stringify({ ...form, allowedDomain: form.allowedDomain || null }),
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
    <div className="dashboard-home-page">
      <section className="dashboard-home-hero">
        <div className="dashboard-home-hero-copy">
          <p className="home-section-kicker">Step {step} of {totalSteps}</p>
          <h1>{step === 1 ? 'Start with a name.' : step === 2 ? 'Choose a look.' : step === 3 ? 'Set the vibe.' : 'Bring it to life.'}</h1>
          <p>
            {step === 1 ? 'Every great assistant needs a name and a warm welcome for your visitors.' : 
             step === 2 ? 'Pick a pet type and a color that matches your brand’s hero section.' : 
             step === 3 ? 'Decide how your pet talks and where it should hang out on your site.' : 
             'Upload your custom illustrations and choose which parts should move.'}
          </p>
          
          <div className="home-hero-actions dashboard-home-hero-actions">
            {step > 1 && (
              <button onClick={prevStep} className="home-hero-button home-hero-button-secondary" style={{ minWidth: '8rem' }}>
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button onClick={nextStep} className="home-hero-button" style={{ minWidth: '10rem' }}>
                Next step
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="home-hero-button" style={{ minWidth: '12rem' }}>
                {loading ? '🐾 Creating...' : '🐾 Finish & Train'}
              </button>
            )}
          </div>
        </div>

        <div className="dashboard-home-hero-panel">
          <p className="dashboard-home-panel-label">Onboarding progress</p>
          <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.85rem' }}>
            {[
              { s: 1, label: 'Basic Identity' },
              { s: 2, label: 'Visual Style' },
              { s: 3, label: 'Behavior' },
              { s: 4, label: 'Asset Upload' },
            ].map((item) => (
              <div key={item.s} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800,
                  background: step > item.s ? 'var(--orange-500)' : step === item.s ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: step === item.s ? '2px solid var(--orange-500)' : step > item.s ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: step >= item.s ? '#fff' : 'rgba(255,255,255,0.3)'
                }}>
                  {step > item.s ? '✓' : item.s}
                </div>
                <span style={{ 
                  fontSize: '0.95rem', fontWeight: step === item.s ? 700 : 500,
                  color: step === item.s ? '#fff' : 'rgba(255,255,255,0.4)'
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="dashboard-home-panel-divider" />
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            {step === 1 ? 'A good name makes your brand more approachable.' : 'Colors and motion help the assistant feel like a native part of your UI.'}
          </p>
        </div>
      </section>

      <section className="dashboard-home-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dashboard-home-section-shell" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {step === 1 && (
            <div className="animate-fade-up" style={{ display: 'grid', gap: '1.75rem' }}>
              <div className="field">
                <label className="label">What should we call your pet? *</label>
                <input className="input" placeholder="e.g. Bella, Max, Luna" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="field">
                <label className="label">How should it greet visitors?</label>
                <textarea className="input" rows={4} value={form.greetingMessage} onChange={(e) => set('greetingMessage', e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up" style={{ display: 'grid', gap: '2rem' }}>
              <div className="field">
                <label className="label">Choose your mascot type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {PET_TYPES.map(({ value, emoji, label }) => (
                    <button key={value} onClick={() => set('petType', value)} className="card-hover" style={{
                      padding: '1.5rem', borderRadius: '1.25rem', border: `2px solid ${form.petType === value ? 'var(--orange-500)' : 'rgba(255,255,255,0.05)'}`,
                      background: form.petType === value ? 'rgba(255, 106, 61, 0.08)' : 'rgba(255,255,255,0.02)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s ease'
                    }}>
                      <span style={{ fontSize: '2.5rem' }}>{emoji}</span>
                      <span style={{ color: form.petType === value ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.9rem' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">Brand highlight color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <input type="color" value={form.brandColor} onChange={(e) => set('brandColor', e.target.value)} style={{ width: '4rem', height: '4rem', borderRadius: '0.75rem' }} />
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{form.brandColor}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>This color will be used for buttons and accents.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up" style={{ display: 'grid', gap: '2rem' }}>
              <div className="field">
                <label className="label">Tone & Personality</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {PERSONALITIES.map(({ value, label, desc }) => (
                    <button key={value} onClick={() => set('personality', value)} className="card-hover" style={{
                      padding: '1.25rem', borderRadius: '1.1rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease',
                      border: `2px solid ${form.personality === value ? 'var(--orange-500)' : 'rgba(255,255,255,0.05)'}`,
                      background: form.personality === value ? 'rgba(255, 106, 61, 0.08)' : 'rgba(255,255,255,0.02)',
                    }}>
                      <p style={{ fontWeight: 800, color: form.personality === value ? '#fff' : 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>{label}</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="field">
                  <label className="label">Placement</label>
                  <select className="input" value={form.position} onChange={(e) => set('position', e.target.value)}>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Security Domain</label>
                  <input className="input" placeholder="e.g. example.com" value={form.allowedDomain} onChange={(e) => set('allowedDomain', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-up" style={{ display: 'grid', gap: '2rem' }}>
              <div className="field">
                <label className="label">Upload your pet illustrations</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {VIEW_UPLOADS.map(({ key, label, hint }) => (
                    <label key={key} className="card-hover" style={{
                      display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', borderRadius: '1.25rem', cursor: 'pointer',
                      border: `1px solid ${form.petImages[key] ? 'var(--orange-500)' : 'rgba(255,255,255,0.08)'}`,
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{label}</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{hint}</p>
                      </div>
                      <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '1rem', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {form.petImages[key] ? (
                          <Image src={form.petImages[key]} alt={label} fill unoptimized style={{ objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{uploadingView === key ? '...' : 'Click to upload'}</span>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => updatePetImage(key, e.target.files?.[0] || null)} style={{ display: 'none' }} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">Motion Settings</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {ANIMATION_OPTIONS.map(({ value, label }) => {
                    const selected = form.animatedParts.includes(value);
                    return (
                      <button key={value} onClick={() => toggleAnimatedPart(value)} style={{
                        padding: '0.75rem', borderRadius: '0.85rem', border: `1px solid ${selected ? 'var(--orange-500)' : 'rgba(255,255,255,0.1)'}`,
                        background: selected ? 'rgba(255, 106, 61, 0.1)' : 'transparent',
                        color: selected ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                      }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
