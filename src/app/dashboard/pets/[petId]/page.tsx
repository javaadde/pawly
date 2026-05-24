'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pet } from '@/types';

export default function EditPetPage() {
  const { petId } = useParams<{ petId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<Partial<Pet>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/pets/${petId}`);
    if (res.ok) {
      const { pet } = await res.json();
      setForm(pet);
    }
    setLoading(false);
  }, [petId]);

  useEffect(() => { load(); }, [load]);

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
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
                <label className="label" htmlFor="edit-color">Brand color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="color" id="edit-color" value={form.brandColor || '#7C3AED'} onChange={(e) => set('brandColor', e.target.value)} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{form.brandColor}</span>
                </div>
              </div>
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
