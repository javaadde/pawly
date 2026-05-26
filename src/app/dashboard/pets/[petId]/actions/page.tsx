'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageAction } from '@/types';

export default function ActionsPage() {
  const { petId } = useParams<{ petId: string }>();
  const [actions, setActions] = useState<PageAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: '', intent: '', selector: '', actionType: 'scroll_to', url: '' });

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/actions/${petId}`);
    if (res.ok) setActions((await res.json()).actions);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const res = await fetch(`/api/actions/${petId}`);
      if (!res.ok || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      const data = await res.json();
      if (cancelled) return;

      setActions(data.actions);
      setLoading(false);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [petId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/actions/${petId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, url: form.url || null }),
    });
    setForm({ label: '', intent: '', selector: '', actionType: 'scroll_to', url: '' });
    load(); setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Delete this action?')) return;
    await fetch(`/api/actions/${petId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId: id }),
    });
    load();
  }

  if (loading) return <div style={{ padding: '2.5rem', color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div style={{ padding: '2.5rem', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem' }}>🗺️ Page Actions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Define what Pawly should do when visitors ask about specific sections.</p>
        </div>
        <Link href={`/dashboard/pets/${petId}/install`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>📋 Install Script</Link>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        💡 Actions let Pawly scroll to, highlight, or open links. Example: when someone asks about pricing, Pawly scrolls to <code>#pricing</code>.
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 700, color: 'white', marginBottom: '1.25rem', fontSize: '1rem' }}>Add page action</h2>
        <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label className="label" htmlFor="a-label">Label *</label>
              <input id="a-label" className="input" placeholder="e.g. Pricing" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="a-intent">Intent keyword *</label>
              <input id="a-intent" className="input" placeholder="e.g. pricing" value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label className="label" htmlFor="a-selector">CSS Selector *</label>
              <input id="a-selector" className="input" placeholder="e.g. #pricing" value={form.selector} onChange={(e) => setForm({ ...form, selector: e.target.value })} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="a-type">Action type</label>
              <select id="a-type" className="input" value={form.actionType} onChange={(e) => setForm({ ...form, actionType: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)' }}>
                <option value="scroll_to">Scroll to</option>
                <option value="highlight">Highlight</option>
                <option value="open_link">Open link</option>
              </select>
            </div>
            {form.actionType === 'open_link' && (
              <div className="field">
                <label className="label" htmlFor="a-url">URL</label>
                <input id="a-url" className="input" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }} id="add-action-submit">
            {saving ? 'Adding...' : '+ Add Action'}
          </button>
        </form>
      </div>

      <h2 style={{ fontWeight: 700, color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Actions ({actions.length})</h2>
      {actions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No actions yet. Add your first one above.</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Label</th><th>Intent</th><th>Selector</th><th>Type</th><th></th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a._id}>
                  <td style={{ color: 'white', fontWeight: 500 }}>{a.label}</td>
                  <td><code style={{ color: 'var(--purple-400)', fontSize: '0.8125rem' }}>{a.intent}</code></td>
                  <td><code style={{ color: '#34d399', fontSize: '0.8125rem' }}>{a.selector}</code></td>
                  <td><span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', background: 'rgba(168,85,247,0.15)', color: 'var(--purple-400)', border: '1px solid rgba(168,85,247,0.2)' }}>{a.actionType}</span></td>
                  <td><button onClick={() => del(a._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} id={`delete-action-${a._id}`}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
