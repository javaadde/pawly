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
  const pets = await Pet.find({ userId: session.user.id });
  const petIds = pets.map((pet) => pet._id);
  const [allLeads, allChats] = await Promise.all([
    Lead.find({ petId: { $in: petIds } }),
    Conversation.find({ petId: { $in: petIds } }),
  ]);

  const firstName = session.user.name?.split(' ')[0] || 'there';
  const activePets = pets.filter((pet) => pet.isActive).length;
  const inactivePets = pets.length - activePets;

  const stats = [
    { label: 'Active pets', value: activePets, detail: `${inactivePets} waiting in draft`, icon: '🐾' },
    { label: 'Leads captured', value: allLeads.length, detail: 'Warm conversations worth following up', icon: '📋' },
    { label: 'Conversations', value: allChats.length, detail: 'Questions answered across your site', icon: '💬' },
    { label: 'Pet roster', value: pets.length, detail: 'Branded assistants ready to customize', icon: '✨' },
  ];

  const launchSteps = [
    {
      title: 'Create your assistant',
      description: pets.length === 0 ? 'Start with your first pet and give it a name, tone, and personality.' : `${pets.length} pet${pets.length === 1 ? '' : 's'} already created.`,
      href: '/pets-create',
      cta: pets.length === 0 ? 'Create your first pet' : 'Create another pet',
    },
    {
      title: 'Train it on your content',
      description: 'Add website knowledge so replies sound grounded in your product, policies, and FAQs.',
      href: pets[0] ? `/pets/${pets[0]._id}/knowledge` : '/pets-create',
      cta: pets[0] ? 'Open knowledge base' : 'Create a pet first',
    },
    {
      title: 'Install on your site',
      description: 'Drop in the script and let your Pawly assistant start helping visitors in real time.',
      href: pets[0] ? `/pets/${pets[0]._id}/install` : '/pets-create',
      cta: pets[0] ? 'View install steps' : 'Create a pet first',
    },
  ];

  return (
    <div className="dashboard-home-page">
      <section className="dashboard-home-hero">
        <div className="dashboard-home-hero-copy">
          <p className="home-section-kicker">Pawly dashboard</p>
          <h1>Welcome back, {firstName}.</h1>
          <p>
            Keep the same warm, polished energy from your landing page while you build, train, and launch each assistant.
          </p>
          <div className="home-hero-actions dashboard-home-hero-actions">
            <Link href="/pets-create" className="home-hero-button">
              Create new pet
            </Link>
            <Link href={pets[0] ? `/pets/${pets[0]._id}/install` : '/pets-create'} className="home-hero-button home-hero-button-secondary">
              {pets[0] ? 'Open install guide' : 'See setup flow'}
            </Link>
          </div>
        </div>

        <div className="dashboard-home-hero-panel">
          <p className="dashboard-home-panel-label">At a glance</p>
          <div className="dashboard-home-panel-stat">
            <strong>{activePets}</strong>
            <span>active assistants currently working across your site experience.</span>
          </div>
          <div className="dashboard-home-panel-divider" />
          <div className="dashboard-home-panel-grid">
            <div>
              <span>{allLeads.length}</span>
              <p>leads captured</p>
            </div>
            <div>
              <span>{allChats.length}</span>
              <p>conversations started</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-home-stats">
        {stats.map(({ label, value, detail, icon }) => (
          <article key={label} className="dashboard-home-stat-card">
            <div className="dashboard-home-stat-icon" aria-hidden="true">
              {icon}
            </div>
            <p className="dashboard-home-stat-label">{label}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-home-grid">
        <div className="dashboard-home-section-shell">
          <div className="dashboard-home-section-header">
            <div>
              <p className="home-section-kicker">Your pets</p>
              <h2>Your assistant lineup.</h2>
            </div>
            <Link href="/pets-create" className="home-hero-button dashboard-home-inline-button">
              Create pet
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="dashboard-home-empty-state">
              <div className="dashboard-home-empty-icon" aria-hidden="true">🐾</div>
              <h3>No pets yet</h3>
              <p>Create your first AI pet, train it on your content, and make your website feel more alive.</p>
              <Link href="/pets-create" className="home-hero-button">
                Create your first pet
              </Link>
            </div>
          ) : (
            <div className="dashboard-home-pet-grid">
              {pets.map((pet) => (
                <article key={pet._id.toString()} className="dashboard-home-pet-card">
                  <div className="dashboard-home-pet-header">
                    <div className="dashboard-home-pet-avatar" style={{ background: `${pet.brandColor}20`, borderColor: `${pet.brandColor}40`, color: pet.brandColor }}>
                      {pet.petType === 'cat' ? '🐱' : pet.petType === 'dog' ? '🐶' : '🐰'}
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

                  <div className="dashboard-home-pet-actions">
                    <Link href={`/pets/${pet._id}`} className="home-hero-button dashboard-home-action-button">
                      Edit
                    </Link>
                    <Link href={`/pets/${pet._id}/knowledge`} className="home-hero-button home-hero-button-secondary dashboard-home-action-button">
                      Train
                    </Link>
                    <Link href={`/pets/${pet._id}/install`} className="home-hero-button home-hero-button-secondary dashboard-home-action-button">
                      Install
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="dashboard-home-side-column">
          <section className="dashboard-home-section-shell dashboard-home-checklist-shell">
            <p className="home-section-kicker">Launch flow</p>
            <h2>Bring the landing page vibe into the live product.</h2>
            <div className="dashboard-home-checklist">
              {launchSteps.map((step, index) => (
                <article key={step.title} className="dashboard-home-checklist-item">
                  <strong>{index + 1}</strong>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <Link href={step.href}>{step.cta}</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-home-section-shell dashboard-home-conversation-shell">
            <p className="dashboard-home-panel-label">Brand feel</p>
            <div className="home-chat-thread dashboard-home-chat-thread">
              <div className="home-chat-message home-chat-message-user">
                <span>Can this still feel like our homepage instead of a generic widget?</span>
              </div>
              <div className="home-chat-message home-chat-message-assistant">
                <span>
                  Yes. Keep the tone warm, train it on your core pages, and use the dashboard to refine how your pet greets and guides visitors.
                </span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
