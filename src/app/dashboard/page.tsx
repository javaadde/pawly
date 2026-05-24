import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';
import Lead from '@/lib/models/Lead';
import Conversation from '@/lib/models/Conversation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await connectDB();
  const [pets, allLeads, allChats] = await Promise.all([
    Pet.find({ userId: session.user.id }),
    Lead.find({ petId: { $in: (await Pet.find({ userId: session.user.id }, '_id')).map((p) => p._id) } }),
    Conversation.find({ petId: { $in: (await Pet.find({ userId: session.user.id }, '_id')).map((p) => p._id) } }),
  ]);

  const stats = [
    { label: 'Active Pets', value: pets.filter((p) => p.isActive).length, icon: '🐾', color: '#7c3aed' },
    { label: 'Leads Captured', value: allLeads.length, icon: '📋', color: '#10b981' },
    { label: 'Conversations', value: allChats.length, icon: '💬', color: '#f59e0b' },
    { label: 'Total Pets', value: pets.length, icon: '✨', color: '#ec4899' },
  ];

  return (
    <div style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.375rem' }}>
          Welcome back, {session.user.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Here&apos;s what&apos;s happening with your Pawly pets.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pets list */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Your Pets</h2>
        <Link href="/dashboard/pets/new" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
          + Create New Pet
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐾</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>No pets yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Create your first AI pet and add it to your website in minutes.</p>
          <Link href="/dashboard/pets/new" className="btn-primary" style={{ display: 'inline-flex' }}>
            🐾 Create your first pet
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {pets.map((pet) => (
            <div key={pet._id.toString()} className="card card-hover" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${pet.brandColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `2px solid ${pet.brandColor}44` }}>
                  {pet.petType === 'cat' ? '🐱' : pet.petType === 'dog' ? '🐶' : '🐰'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{pet.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{pet.personality} • {pet.position}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{
                    padding: '0.2rem 0.625rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: pet.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                    color: pet.isActive ? '#34d399' : 'var(--text-muted)',
                    border: `1px solid ${pet.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.3)'}`,
                  }}>
                    {pet.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                &quot;{pet.greetingMessage}&quot;
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={`/dashboard/pets/${pet._id}`} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.8125rem' }}>
                  ⚙️ Edit
                </Link>
                <Link href={`/dashboard/pets/${pet._id}/knowledge`} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.8125rem' }}>
                  🧠 Train
                </Link>
                <Link href={`/dashboard/pets/${pet._id}/install`} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.8125rem' }}>
                  📋 Install
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
