import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';
import Lead from '@/lib/models/Lead';
import Conversation from '@/lib/models/Conversation';
import Link from 'next/link';

export default async function PetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await connectDB();
  const pets = await Pet.find({ userId: session.user.id }).sort({ createdAt: -1 });
  
  const activePetsCount = pets.filter(p => p.isActive).length;
  const inactivePetsCount = pets.length - activePetsCount;

  return (
    <div className="dashboard-home-page">
      <section className="dashboard-home-hero">
        <div className="dashboard-home-hero-copy">
          <p className="home-section-kicker">Manage Assistants</p>
          <h1>Your Pet Roster.</h1>
          <p>
            View, manage, and monitor all your AI assistants in one place. Each pet can have its own personality, knowledge base, and unique placement on your site.
          </p>
          <div className="home-hero-actions dashboard-home-hero-actions">
            <Link href="/dashboard/pets/new" className="home-hero-button">
              Create new pet
            </Link>
            <Link href="/dashboard" className="home-hero-button home-hero-button-secondary">
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="dashboard-home-hero-panel">
          <p className="dashboard-home-panel-label">Roster Summary</p>
          <div className="dashboard-home-panel-stat">
            <strong>{pets.length}</strong>
            <span>total assistants created across your account.</span>
          </div>
          <div className="dashboard-home-panel-divider" />
          <div className="dashboard-home-panel-grid">
            <div>
              <span>{activePetsCount}</span>
              <p>active pets</p>
            </div>
            <div>
              <span>{inactivePetsCount}</span>
              <p>draft/inactive</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-home-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dashboard-home-section-shell">
          <div className="dashboard-home-section-header">
            <div>
              <p className="home-section-kicker">Inventory</p>
              <h2>All assistants ({pets.length})</h2>
            </div>
            <Link href="/dashboard/pets/new" className="home-hero-button dashboard-home-inline-button">
              Add new pet
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="dashboard-home-empty-state">
              <div className="dashboard-home-empty-icon" aria-hidden="true">🐾</div>
              <h3>No pets found</h3>
              <p>You haven&apos;t created any AI pets yet. Start by creating one and deploying it to your website.</p>
              <Link href="/dashboard/pets/new" className="home-hero-button">
                Create your first pet
              </Link>
            </div>
          ) : (
            <div className="dashboard-home-pet-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
              {pets.map((pet) => (
                <article key={pet._id.toString()} className="dashboard-home-pet-card">
                  <div className="dashboard-home-pet-header">
                    <div className="dashboard-home-pet-avatar" style={{ background: `${pet.brandColor}20`, borderColor: `${pet.brandColor}40`, color: pet.brandColor }}>
                      {pet.petType === 'cat' ? '🐱' : pet.petType === 'dog' ? '🐶' : pet.petType === 'bunny' ? '🐰' : '🤖'}
                    </div>
                    <div>
                      <h3>{pet.name}</h3>
                      <p>{pet.personality} • {pet.position}</p>
                    </div>
                    <span className={`dashboard-home-status ${pet.isActive ? 'is-active' : ''}`}>
                      {pet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="dashboard-home-pet-quote">&quot;{pet.greetingMessage}&quot;</p>
                  
                  <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domain</p>
                      <p style={{ fontSize: '0.875rem', color: 'white', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pet.allowedDomain || 'Any domain'}</p>
                    </div>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RAG Mode</p>
                      <p style={{ fontSize: '0.875rem', color: pet.ragEnabled ? 'var(--orange-200)' : 'var(--text-muted)', marginTop: '0.25rem' }}>{pet.ragEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>

                  <div className="dashboard-home-pet-actions">
                    <Link href={`/dashboard/pets/${pet._id}`} className="home-hero-button dashboard-home-action-button">
                      Settings
                    </Link>
                    <Link href={`/dashboard/pets/${pet._id}/knowledge`} className="home-hero-button home-hero-button-secondary dashboard-home-action-button">
                      Knowledge
                    </Link>
                    <Link href={`/dashboard/pets/${pet._id}/leads`} className="home-hero-button home-hero-button-secondary dashboard-home-action-button">
                      Leads
                    </Link>
                    <Link href={`/dashboard/pets/${pet._id}/install`} className="home-hero-button home-hero-button-secondary dashboard-home-action-button">
                      Install
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
