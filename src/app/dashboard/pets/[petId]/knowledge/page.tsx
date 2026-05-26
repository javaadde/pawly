'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { KnowledgeItem } from '@/types';

const SUPPORTED_DOCUMENT_EXTENSIONS = ['txt', 'md', 'csv', 'json', 'html'];
const MAX_DOCUMENT_CHARACTERS = 20000;

function getFileExtension(fileName: string) {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

function toDocumentTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '');
}

export default function KnowledgePage() {
  const { petId } = useParams<{ petId: string }>();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', content: '', sourceType: 'manual' });
  const [petName, setPetName] = useState('');

  async function load() {
    setLoading(true);
    const [itemsRes, petRes] = await Promise.all([
      fetch(`/api/knowledge/${petId}`),
      fetch(`/api/pets/${petId}`),
    ]);
    if (itemsRes.ok) setItems((await itemsRes.json()).items);
    if (petRes.ok) setPetName((await petRes.json()).pet?.name || 'Pet');
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [itemsRes, petRes] = await Promise.all([
        fetch(`/api/knowledge/${petId}`),
        fetch(`/api/pets/${petId}`),
      ]);

      if (cancelled) return;

      if (itemsRes.ok) setItems((await itemsRes.json()).items);
      if (petRes.ok) setPetName((await petRes.json()).pet?.name || 'Pet');
      setLoading(false);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [petId]);

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

  async function uploadDocuments(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      for (const file of files) {
        const extension = getFileExtension(file.name);

        if (!SUPPORTED_DOCUMENT_EXTENSIONS.includes(extension)) {
          throw new Error(`Unsupported file type for ${file.name}. Use ${SUPPORTED_DOCUMENT_EXTENSIONS.join(', ')}.`);
        }

        const rawText = await file.text();
        const content = rawText.trim();

        if (!content) {
          throw new Error(`${file.name} is empty.`);
        }

        const res = await fetch(`/api/knowledge/${petId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: toDocumentTitle(file.name),
            content: content.slice(0, MAX_DOCUMENT_CHARACTERS),
            sourceType: 'document',
            fileName: file.name,
          }),
        });

        if (!res.ok) {
          throw new Error((await res.json()).error || `Failed to upload ${file.name}`);
        }
      }

      setSuccess(`Uploaded ${files.length} document${files.length > 1 ? 's' : ''} for training.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload documents');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 700, color: 'white', marginBottom: '0.75rem', fontSize: '1rem' }}>Upload training documents</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Upload text-based documents and Pawly will save them as training knowledge for this pet.
        </p>
        <div className="field">
          <label className="label" htmlFor="knowledge-documents">Documents</label>
          <input
            id="knowledge-documents"
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.html,text/plain,text/markdown,text/csv,application/json,text/html"
            onChange={uploadDocuments}
            disabled={uploading}
            className="input"
            style={{ padding: '0.75rem' }}
          />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Supported for now: .txt, .md, .csv, .json, .html. Large files are trimmed to the first {MAX_DOCUMENT_CHARACTERS.toLocaleString()} characters.
          </p>
        </div>
        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {uploading ? 'Uploading documents...' : 'Each uploaded file becomes a saved knowledge item.'}
        </div>
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
                {item.fileName ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Source file: {item.fileName}
                  </p>
                ) : null}
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
