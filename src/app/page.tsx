import Link from 'next/link';
import heroBackground from '@/assets/images/background.png';

export default function LandingPage() {
  return (
    <main className="home-page">
      <section
        className="home-hero"
        style={{ backgroundImage: `url(${heroBackground.src})` }}
      >
        <div className="home-hero-overlay" />
        <header className="home-hero-header">
          <div className="home-hero-brand">
            <p className="home-hero-kicker">Pawly AI</p>
          </div>

          <nav className="home-hero-nav" aria-label="Primary">
            <Link href="/login" className="home-hero-navlink">
              Log in
            </Link>
            <Link href="/signup" className="home-hero-navcta">
              Sign up
            </Link>
          </nav>
        </header>
        <div className="home-hero-content">
          <h1>Add an AI pet assistant to your website.</h1>
          <p>
            A friendly branded pet that answers questions, guides visitors, and captures leads from one simple script.
          </p>
          <div className="home-hero-actions">
            <Link href="/signup" className="home-hero-button">
              Start for free
            </Link>
            <Link href="#features" className="home-hero-button home-hero-button-secondary">
              See how it works
            </Link>
          </div>

          <div className="home-hero-stage" aria-hidden="true">
            <div className="home-hero-stage-copy">
              <span>Live on your website</span>
              <p>Your pet can roam, idle, and feel like part of the page instead of a static icon.</p>
            </div>

            <div className="home-hero-stage-lane">
              <div className="home-live-pet-runner">
                <div className="home-live-pet-facing">
                  <div className="home-live-pet">
                    <div className="home-live-pet-ears">
                      <span className="home-live-pet-ear home-live-pet-ear-left" />
                      <span className="home-live-pet-ear home-live-pet-ear-right" />
                    </div>
                    <div className="home-live-pet-tail" />
                    <div className="home-live-pet-body">
                      <div className="home-live-pet-face">
                        <span className="home-live-pet-eye" />
                        <span className="home-live-pet-eye" />
                        <span className="home-live-pet-nose" />
                      </div>
                      <div className="home-live-pet-belly" />
                    </div>
                    <div className="home-live-pet-legs">
                      <span className="home-live-pet-leg home-live-pet-leg-front" />
                      <span className="home-live-pet-leg home-live-pet-leg-back" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="home-live-pet-shadow-runner">
                <div className="home-live-pet-shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="home-section home-section-grid">
        <div className="home-section-copy">
          <p className="home-section-kicker">Why teams choose Pawly</p>
          <h2>A polished website assistant that feels useful, warm, and on-brand.</h2>
          <p>
            Pawly is built to feel like part of your website, not a generic support widget. Give visitors quick answers, soft guidance, and a natural next step.
          </p>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <span className="home-feature-index">01</span>
            <h3>Answers from your own content</h3>
            <p>Train your assistant on your site, product details, and FAQs so replies stay relevant.</p>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-index">02</span>
            <h3>Lead capture without friction</h3>
            <p>Turn visitor questions into warm leads with a natural conversation instead of a cold form.</p>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-index">03</span>
            <h3>Fits your brand personality</h3>
            <p>Adjust the tone, greeting, and visual feel so the assistant matches your hero and overall brand.</p>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-index">04</span>
            <h3>Simple install</h3>
            <p>Drop one script onto your site and start running a smarter support layer in minutes.</p>
          </article>
        </div>
      </section>

      <section className="home-section home-process-section">
        <div className="home-process-panel">
          <div className="home-section-copy">
            <p className="home-section-kicker">How it works</p>
            <h2>Launch your AI pet in three simple steps.</h2>
          </div>

          <div className="home-process-list">
            <article className="home-process-item">
              <strong>1</strong>
              <div>
                <h3>Create your assistant</h3>
                <p>Set the name, tone, and core personality of your Pawly experience.</p>
              </div>
            </article>
            <article className="home-process-item">
              <strong>2</strong>
              <div>
                <h3>Add your website knowledge</h3>
                <p>Feed your assistant the pages, answers, and details visitors ask about most.</p>
              </div>
            </article>
            <article className="home-process-item">
              <strong>3</strong>
              <div>
                <h3>Install and start chatting</h3>
                <p>Paste the script once, then monitor conversations and captured leads in your dashboard.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="home-metrics-card">
          <p className="home-metrics-label">Built for modern websites</p>
          <div className="home-metrics-stat">
            <strong>24/7</strong>
            <span>Answers common questions even when your team is offline.</span>
          </div>
          <div className="home-metrics-stat">
            <strong>1 script</strong>
            <span>Fast setup with minimal engineering effort.</span>
          </div>
          <div className="home-metrics-stat">
            <strong>Your brand</strong>
            <span>Warm visuals and conversational tone that feel native to your page.</span>
          </div>
        </div>
      </section>

      <section className="home-section home-audience-section">
        <div className="home-section-copy">
          <p className="home-section-kicker">Where it fits best</p>
          <h2>Built for brands that want their website to feel more alive.</h2>
          <p>
            Pawly works especially well when your site already has personality. The assistant extends that tone into product discovery,
            support, and lead capture without adding friction.
          </p>
        </div>

        <div className="home-audience-grid">
          <article className="home-audience-card">
            <span className="home-feature-index">01</span>
            <h3>E-commerce storefronts</h3>
            <p>Help shoppers compare products, answer sizing or shipping questions, and nudge them toward checkout.</p>
          </article>
          <article className="home-audience-card">
            <span className="home-feature-index">02</span>
            <h3>Service-led businesses</h3>
            <p>Turn curiosity into booked calls by guiding visitors through pricing, process, and next steps in plain language.</p>
          </article>
          <article className="home-audience-card">
            <span className="home-feature-index">03</span>
            <h3>Modern product sites</h3>
            <p>Keep launch pages clean while still giving visitors an easy place to ask detailed questions and get instant context.</p>
          </article>
        </div>
      </section>

      <section className="home-section home-preview-section">
        <div className="home-preview-shell">
          <div className="home-preview-copy">
            <p className="home-section-kicker">Conversation feel</p>
            <h2>A warmer, more helpful experience than a generic chat bubble.</h2>
            <p>
              Shape the greeting, voice, and prompts so visitors feel like they are talking to a thoughtful guide that belongs on your site.
            </p>

            <div className="home-preview-points">
              <div className="home-preview-point">
                <strong>Brand-matched opening</strong>
                <span>Start with a greeting that sounds like your homepage, not a canned support script.</span>
              </div>
              <div className="home-preview-point">
                <strong>Useful follow-up prompts</strong>
                <span>Keep momentum with smart next questions that help visitors move toward clarity or conversion.</span>
              </div>
              <div className="home-preview-point">
                <strong>Lead capture at the right time</strong>
                <span>Ask for contact details naturally once the conversation has already created trust.</span>
              </div>
            </div>
          </div>

          <div className="home-preview-card">
            <p className="home-preview-label">Sample website conversation</p>
            <div className="home-chat-thread">
              <div className="home-chat-message home-chat-message-user">
                <span>Can you help me choose the right plan for a small team?</span>
              </div>
              <div className="home-chat-message home-chat-message-assistant">
                <span>
                  Absolutely. If your team wants quick setup and lightweight support coverage, I&apos;d start with the Growth plan. Want me to
                  break down what&apos;s included?
                </span>
              </div>
              <div className="home-chat-message home-chat-message-user">
                <span>Yes, and can it capture leads too?</span>
              </div>
              <div className="home-chat-message home-chat-message-assistant">
                <span>
                  Yes. It can answer questions, collect contact details mid-conversation, and send everything to your dashboard so your team can
                  follow up fast.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-cta-band">
          <div>
            <p className="home-section-kicker">Ready to launch?</p>
            <h2>Bring the same energy from your hero section into every visitor conversation.</h2>
            <p>
              Start with a free account, customize your assistant, and turn your website into a more helpful experience.
            </p>
          </div>
          <div className="home-cta-actions">
            <Link href="/signup" className="home-hero-button">
              Create account
            </Link>
            <Link href="/login" className="home-hero-button home-hero-button-secondary">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
