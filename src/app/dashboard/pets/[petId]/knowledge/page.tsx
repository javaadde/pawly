'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { KnowledgeItem } from '@/types';

export default function KnowledgePage() {
  const { petId } = useParams<{ petId: string }>();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', content: '', sourceType: 'manual' });
  const [petName, setPetName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [itemsRes, petRes] = await Promise.all([
      fetch(`/api/knowledge/${petId}`),
      fetch(`/api/pets/${petId}`),
    ]);
    if (itemsRes.ok) setItems((await itemsRes.json()).items);
    if (petRes.ok) setPetName((await petRes.json()).pet?.name || 'Pet');
    setLoading(false);
  }, [petId]);

  useEffect(() => { load(); }, [load]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const res = await fetch(`/api/knowledge/${petId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess('Knowledge item added!');
      setForm({ title: '', content: '', sourceType: 'manual' });
      load();
    } else {
      setError((await res.json()).error || 'Failed to add');
    }
    setSaving(false);
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/knowledge/${petId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id }),
    });
    load();
  }

  if (loading) return <div style={{ padding: '2.5rem', color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div style={{ padding: '2.5rem', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem' }}>🧠 Knowledge Base</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Train <strong style={{ color: 'white' }}>{petName}</strong> with your business info, FAQs, and services.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/dashboard/pets/${petId}/actions`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>🗺️ Page Actions</Link>
          <Link href={`/dashboard/pets/${petId}/install`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>📋 Install</Link>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{success}</div>}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 700, color: 'white', marginBottom: '1.25rem', fontSize: '1rem' }}>Add knowledge item</h2>
        <form onSubmit={addItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="field" style={{ flex: 2 }}>
              <label className="label" htmlFor="k-title">Title *</label>
              <input id="k-title" className="input" placeholder="e.g. Pricing, Opening Hours" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="label" htmlFor="k-type">Type</label>
              <select id="k-type" className="input" value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)' }}>
                <option value="manual">Manual</option>
                <option value="faq">FAQ</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="k-content">Content *</label>
            <textarea id="k-content" className="input" rows={4} placeholder="Paste business info, FAQ answers, pricing details..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }} id="add-knowledge-submit">
            {saving ? 'Adding...' : '+ Add Knowledge'}
          </button>
        </form>
      </div>

      <h2 style={{ fontWeight: 700, color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Saved knowledge ({items.length} items)</h2>
      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          No items yet. Add your first one above!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div key={item._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                  <p style={{ fontWeight: 600, color: 'white', fontSize: '0.9375rem' }}>{item.title}</p>
                  <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', background: 'rgba(168,85,247,0.15)', color: 'var(--purple-400)', border: '1px solid rgba(168,85,247,0.2)' }}>{item.sourceType}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>
              </div>
              <button onClick={() => deleteItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.125rem', padding: '0.25rem', borderRadius: '0.375rem', flexShrink: 0 }} id={`delete-k-${item._id}`}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
