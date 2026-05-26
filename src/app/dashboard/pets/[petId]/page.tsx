'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AnimatedPart, Pet, PetImages } from '@/types';

const VIEW_UPLOADS = [
  { key: 'front', label: 'Front view' },
  { key: 'left', label: 'Left view' },
  { key: 'right', label: 'Right view' },
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

export default function EditPetPage() {
  const { petId } = useParams<{ petId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingView, setUploadingView] = useState<keyof PetImages | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<Partial<Pet>>({});

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const res = await fetch(`/api/pets/${petId}`);
      if (!res.ok || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { pet } = await res.json();
      if (cancelled) return;

      setForm(pet);
      setLoading(false);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [petId]);

  function set(key: string, value: string | boolean) {
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
          front: current.petImages?.front || '',
          left: current.petImages?.left || '',
          right: current.petImages?.right || '',
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
    setForm((current) => {
      const animatedParts = current.animatedParts || [];

      return {
        ...current,
        animatedParts: animatedParts.includes(part)
          ? animatedParts.filter((item) => item !== part)
          : [...animatedParts, part],
      };
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!form.petImages?.front || !form.petImages?.left || !form.petImages?.right) {
      setError('Please upload the front, left, and right pet images.');
      return;
    }

    setSaving(true); setError(''); setSuccess('');
    const res = await fetch(`/api/pets/${petId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) setSuccess('Pet settings saved!');
    else setError((await res.json()).error || 'Failed to save');
    setSaving(false);
  }

  async function deletePet() {
    if (!confirm(`Delete ${form.name}? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/pets/${petId}`, { method: 'DELETE' });
    router.push('/dashboard');
  }

  if (loading) return <div style={{ padding: '2.5rem', color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div style={{ padding: '2.5rem', maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem' }}>⚙️ Edit {form.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update your pet&apos;s settings and appearance.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/dashboard/pets/${petId}/knowledge`} className="btn-ghost" style={{ fontSize: '0.875rem' }}>🧠 Knowledge</Link>
          <Link href={`/dashboard/pets/${petId}/install`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>📋 Install</Link>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{success}</div>}

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontWeight: 700, color: 'white', marginBottom: '1.25rem', fontSize: '1rem' }}>Basic settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="field">
              <label className="label" htmlFor="edit-name">Pet name</label>
              <input id="edit-name" className="input" value={form.name || ''} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="edit-greeting">Greeting message</label>
              <textarea id="edit-greeting" className="input" rows={3} value={form.greetingMessage || ''} onChange={(e) => set('greetingMessage', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="field" style={{ flex: 1 }}>
                <label className="label" htmlFor="edit-pet-type">Pet type</label>
                <select id="edit-pet-type" className="input" value={form.petType || 'cat'} onChange={(e) => set('petType', e.target.value)} style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <option value="cat">Cat</option>
                  <option value="dog">Dog</option>
                  <option value="bunny">Bunny</option>
                  <option value="robot">Robot</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="label" htmlFor="edit-color">Brand color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="color" id="edit-color" value={form.brandColor || '#7C3AED'} onChange={(e) => set('brandColor', e.target.value)} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{form.brandColor}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="field" style={{ flex: 1 }}>
                <label className="label" htmlFor="edit-personality">Personality</label>
                <select id="edit-personality" className="input" value={form.personality || 'friendly'} onChange={(e) => set('personality', e.target.value)} style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="funny">Funny</option>
                  <option value="calm">Calm</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="field" style={{ flex: 1 }}>
                <label className="label" htmlFor="edit-position">Position</label>
                <select id="edit-position" className="input" value={form.position || 'bottom-right'} onChange={(e) => set('position', e.target.value)} style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="label" htmlFor="edit-domain">Allowed domain</label>
                <input id="edit-domain" className="input" placeholder="example.com (leave blank for any)" value={form.allowedDomain || ''} onChange={(e) => set('allowedDomain', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="checkbox" id="edit-active" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--purple-600)' }} />
              <label htmlFor="edit-active" style={{ color: 'white', fontSize: '0.9rem', cursor: 'pointer' }}>Pet is active (visible on website)</label>
            </div>
            <div className="field">
              <label className="label">Pet images</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {VIEW_UPLOADS.map(({ key, label }) => (
                  <label
                    key={key}
                    htmlFor={`edit-pet-image-${key}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      padding: '0.875rem',
                      borderRadius: '0.875rem',
                      border: `1px solid ${form.petImages?.[key] ? 'rgba(168,85,247,0.45)' : 'var(--dark-border)'}`,
                      background: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
                    <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: '0.75rem', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {form.petImages?.[key] ? (
                        <Image src={form.petImages[key]} alt={`${label} preview`} fill unoptimized style={{ objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.75rem' }}>
                          {uploadingView === key ? 'Uploading...' : 'Click to upload'}
                        </span>
                      )}
                    </div>
                    <input
                      id={`edit-pet-image-${key}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => updatePetImage(key, e.target.files?.[0] || null)}
                      style={{ display: 'none' }}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label">Animated body parts</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.625rem' }}>
                {ANIMATION_OPTIONS.map(({ value, label, desc }) => {
                  const selected = form.animatedParts?.includes(value) ?? false;

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
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontWeight: 700, color: 'white', marginBottom: '1.25rem', fontSize: '1rem' }}>RAG settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="edit-rag-enabled"
                checked={form.ragEnabled ?? false}
                onChange={(e) => set('ragEnabled', e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--purple-600)' }}
              />
              <label htmlFor="edit-rag-enabled" style={{ color: 'white', fontSize: '0.9rem', cursor: 'pointer' }}>
                Enable RAG mode for this pet
              </label>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              When disabled, Pawly answers by matching the visitor question against the saved knowledge directly. When enabled, it uses your API key and model to answer with AI from that knowledge context.
            </p>

            {form.ragEnabled ? (
              <>
                <div className="field">
                  <label className="label" htmlFor="edit-rag-api-key">RAG API key</label>
                  <input
                    id="edit-rag-api-key"
                    type="password"
                    className="input"
                    placeholder="Paste your OpenRouter / AI provider key"
                    value={form.ragApiKey || ''}
                    onChange={(e) => set('ragApiKey', e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="edit-rag-model">RAG model</label>
                  <input
                    id="edit-rag-model"
                    className="input"
                    placeholder="openai/gpt-4o-mini"
                    value={form.ragModel || 'openai/gpt-4o-mini'}
                    onChange={(e) => set('ragModel', e.target.value)}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    Use a model supported by your provider. This is only used when RAG mode is enabled.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={deletePet} disabled={deleting} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '0.625rem', padding: '0.625rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }} id="delete-pet-btn">
            {deleting ? 'Deleting...' : '🗑️ Delete Pet'}
          </button>
          <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }} id="save-pet-btn">
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
