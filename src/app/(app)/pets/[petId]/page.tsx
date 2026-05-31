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

  if (loading) return <div className="dashboard-settings-loading">Loading pet settings...</div>;

  const activeParts = form.animatedParts?.length || 0;
  const uploadedImages = VIEW_UPLOADS.filter(({ key }) => form.petImages?.[key]).length;

  return (
    <div className="dashboard-home-page pet-settings-page">
      <section className="dashboard-home-hero pet-settings-hero">
        <div className="dashboard-home-hero-copy">
          <p className="home-section-kicker">Pet settings</p>
          <h1>{form.name || 'Your pet'}</h1>
          <p>
            Tune the assistant visitors see on your site. Keep its personality, placement, visuals, and AI behavior aligned with your brand.
          </p>
          <div className="home-hero-actions dashboard-home-hero-actions">
            <Link href={`/pets/${petId}/knowledge`} className="home-hero-button home-hero-button-secondary">
              Knowledge
            </Link>
            <Link href={`/pets/${petId}/install`} className="home-hero-button">
              Install
            </Link>
          </div>
        </div>

        <div className="dashboard-home-hero-panel pet-settings-summary">
          <p className="dashboard-home-panel-label">Assistant health</p>
          <div className="pet-settings-avatar" style={{ borderColor: `${form.brandColor || '#ff6a3d'}66`, color: form.brandColor || '#ff6a3d' }}>
            {(form.name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="dashboard-home-panel-grid">
            <div>
              <span>{form.isActive ?? true ? 'Live' : 'Paused'}</span>
              <p>Website status</p>
            </div>
            <div>
              <span>{uploadedImages}/3</span>
              <p>Image views</p>
            </div>
            <div>
              <span>{activeParts}</span>
              <p>Motion parts</p>
            </div>
            <div>
              <span>{form.ragEnabled ? 'AI' : 'Direct'}</span>
              <p>Answer mode</p>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="alert alert-error pet-settings-alert">{error}</div>}
      {success && <div className="alert alert-success pet-settings-alert">{success}</div>}

      <form onSubmit={save} className="pet-settings-form">
        <section className="dashboard-home-section-shell pet-settings-section">
          <div className="dashboard-home-section-header pet-settings-section-header">
            <div>
              <p className="dashboard-home-panel-label">Identity</p>
              <h2>Basic settings</h2>
            </div>
            <span className={`dashboard-home-status ${form.isActive ?? true ? 'is-active' : ''}`}>
              {form.isActive ?? true ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="pet-settings-fields">
            <div className="field">
              <label className="label" htmlFor="edit-name">Pet name</label>
              <input id="edit-name" className="input" value={form.name || ''} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="edit-greeting">Greeting message</label>
              <textarea id="edit-greeting" className="input pet-settings-textarea" rows={4} value={form.greetingMessage || ''} onChange={(e) => set('greetingMessage', e.target.value)} />
            </div>

            <div className="pet-settings-two-column">
              <div className="field">
                <label className="label" htmlFor="edit-pet-type">Pet type</label>
                <select id="edit-pet-type" className="input" value={form.petType || 'cat'} onChange={(e) => set('petType', e.target.value)}>
                  <option value="cat">Cat</option>
                  <option value="dog">Dog</option>
                  <option value="bunny">Bunny</option>
                  <option value="robot">Robot</option>
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="edit-color">Brand color</label>
                <div className="pet-settings-color-row">
                  <input type="color" id="edit-color" value={form.brandColor || '#7C3AED'} onChange={(e) => set('brandColor', e.target.value)} />
                  <span>{form.brandColor}</span>
                </div>
              </div>
            </div>

            <div className="pet-settings-two-column">
              <div className="field">
                <label className="label" htmlFor="edit-personality">Personality</label>
                <select id="edit-personality" className="input" value={form.personality || 'friendly'} onChange={(e) => set('personality', e.target.value)}>
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="funny">Funny</option>
                  <option value="calm">Calm</option>
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="edit-position">Position</label>
                <select id="edit-position" className="input" value={form.position || 'bottom-right'} onChange={(e) => set('position', e.target.value)}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
            </div>

            <div className="pet-settings-two-column">
              <div className="field">
                <label className="label" htmlFor="edit-domain">Allowed domain</label>
                <input id="edit-domain" className="input" placeholder="example.com (leave blank for any)" value={form.allowedDomain || ''} onChange={(e) => set('allowedDomain', e.target.value)} />
              </div>
              <label className="pet-settings-toggle" htmlFor="edit-active">
                <input type="checkbox" id="edit-active" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} />
                <span>
                  <strong>Visible on website</strong>
                  <small>Show this pet to visitors when the script is installed.</small>
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="dashboard-home-section-shell pet-settings-section">
          <div className="dashboard-home-section-header pet-settings-section-header">
            <div>
              <p className="dashboard-home-panel-label">Appearance</p>
              <h2>Images and motion</h2>
            </div>
          </div>

          <div className="pet-settings-fields">
            <div className="field">
              <label className="label">Pet images</label>
              <div className="pet-settings-image-grid">
                {VIEW_UPLOADS.map(({ key, label }) => (
                  <label
                    key={key}
                    htmlFor={`edit-pet-image-${key}`}
                    className={`pet-settings-image-card ${form.petImages?.[key] ? 'has-image' : ''}`}
                  >
                    <p>{label}</p>
                    <div className="pet-settings-image-preview">
                      {form.petImages?.[key] ? (
                        <Image src={form.petImages[key]} alt={`${label} preview`} fill unoptimized style={{ objectFit: 'cover' }} />
                      ) : (
                        <span>
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
              <div className="pet-settings-choice-grid">
                {ANIMATION_OPTIONS.map(({ value, label, desc }) => {
                  const selected = form.animatedParts?.includes(value) ?? false;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleAnimatedPart(value)}
                      className={`pet-settings-choice ${selected ? 'is-selected' : ''}`}
                    >
                      <strong>{label}</strong>
                      <span>{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-home-section-shell pet-settings-section">
          <div className="dashboard-home-section-header pet-settings-section-header">
            <div>
              <p className="dashboard-home-panel-label">Intelligence</p>
              <h2>RAG settings</h2>
            </div>
          </div>

          <div className="pet-settings-fields">
            <label className="pet-settings-toggle" htmlFor="edit-rag-enabled">
              <input
                type="checkbox"
                id="edit-rag-enabled"
                checked={form.ragEnabled ?? false}
                onChange={(e) => set('ragEnabled', e.target.checked)}
              />
              <span>
                <strong>Enable RAG mode</strong>
                <small>Use your provider key and model to answer from saved knowledge context.</small>
              </span>
            </label>

            <p className="pet-settings-note">
              When disabled, Pawly answers by matching the visitor question against the saved knowledge directly. When enabled, it uses your API key and model to answer with AI from that knowledge context.
            </p>

            {form.ragEnabled ? (
              <div className="pet-settings-two-column">
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
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="pet-settings-actions">
          <button type="button" onClick={deletePet} disabled={deleting} className="pet-settings-delete-button" id="delete-pet-btn">
            {deleting ? 'Deleting...' : 'Delete pet'}
          </button>
          <button type="submit" className="home-hero-button" disabled={saving} id="save-pet-btn">
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
