import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';
import Lead from '@/lib/models/Lead';
import Link from 'next/link';

export default async function LeadsPage({ params }: { params: Promise<{ petId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { petId } = await params;
  await connectDB();
  const pet = await Pet.findById(petId);
  if (!pet || pet.userId.toString() !== session.user.id) redirect('/dashboard');

  const leads = await Lead.find({ petId }).sort({ createdAt: -1 });

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem' }}>📋 Leads — {pet.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{leads.length} lead{leads.length !== 1 ? 's' : ''} collected</p>
        </div>
        <Link href="/dashboard" className="btn-ghost">← Dashboard</Link>
      </div>

      {leads.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>No leads yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Leads will appear here when {pet.name} collects visitor contact info during conversations.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id.toString()}>
                  <td style={{ color: 'white', fontWeight: 500 }}>{lead.name || '—'}</td>
                  <td>{lead.email ? <a href={`mailto:${lead.email}`} style={{ color: 'var(--purple-400)', textDecoration: 'none' }}>{lead.email}</a> : '—'}</td>
                  <td>{lead.phone || '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.message || '—'}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
