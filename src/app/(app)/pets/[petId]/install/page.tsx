import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';
import Link from 'next/link';
import { generateScriptTag } from '@/lib/utils';

export default async function InstallPage({ params }: { params: Promise<{ petId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { petId } = await params;
  await connectDB();
  const pet = await Pet.findById(petId);
  if (!pet || pet.userId.toString() !== session.user.id) redirect('/dashboard');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const scriptTag = generateScriptTag(petId, appUrl);

  return (
    <div style={{ padding: '2.5rem', maxWidth: 800 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem' }}>📋 Install {pet.name}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Add Pawly to your website by pasting one script tag.</p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>Your script tag</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Copy and paste before &lt;/body&gt;</span>
        </div>
        <div className="code-block" style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {scriptTag}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Pet ID: <code style={{ color: 'var(--purple-400)' }}>{petId}</code>
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>Installation guide</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { step: '1', title: 'Copy the script tag above', desc: 'Click the code block and copy the entire script tag.' },
            { step: '2', title: 'Open your website HTML', desc: 'Find the main HTML file of your website or the template file.' },
            { step: '3', title: 'Paste before </body>', desc: 'Paste the script tag just before the closing </body> tag on every page.' },
            { step: '4', title: 'Save and refresh', desc: `Pawly (${pet.name}) will appear in the ${pet.position} corner of your website.` },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0, marginTop: 2 }}>{step}</div>
              <div>
                <p style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{title}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="alert alert-info">
        🧪 <strong>Testing tip:</strong> Set the allowed domain to blank to test on any website (including localhost).
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <Link href={`/pets/${petId}`} className="btn-secondary">⚙️ Edit Settings</Link>
        <Link href={`/pets/${petId}/leads`} className="btn-secondary">📋 View Leads</Link>
        <Link href="/dashboard" className="btn-primary">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
