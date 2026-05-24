'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import heroBackground from '@/assets/images/background.png';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create the account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but sign-in failed. Please log in.');
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero" style={{ backgroundImage: `url(${heroBackground.src})` }}>
        <div className="home-hero-overlay" />

        <header className="home-hero-header">
          <Link href="/" className="auth-brand-button">
            Pawly AI
          </Link>
          <nav className="home-hero-nav" aria-label="Primary">
            <Link href="/login" className="auth-header-link">
              Sign in
            </Link>
          </nav>
        </header>

        <div className="auth-shell">
          <aside className="auth-showcase auth-showcase-signup">
            <div className="auth-showcase-copy">
              <p className="auth-showcase-kicker">Launch fast</p>
              <h2>Give your website a branded AI pet in minutes.</h2>
              <p>
                Create your account, customize your assistant, and bring the same warm hero-section energy into every visitor conversation.
              </p>
            </div>

            <div className="auth-showcase-card">
              <span className="auth-showcase-label">What you get</span>
              <ul className="auth-showcase-list">
                <li>Quick setup with one script snippet</li>
                <li>Answer customer questions with your site knowledge</li>
                <li>Capture more leads without adding extra tools</li>
              </ul>
            </div>
          </aside>

          <div className="auth-panel">
            <div className="auth-heading auth-heading-left">
              <h1>Create an account</h1>
              <p>Start for free and set up your Pawly assistant with a dark, polished dashboard experience.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="alert alert-error">{error}</div>}

              <div className="field">
                <label className="label" htmlFor="name">Your name</label>
                <input
                  id="name"
                  type="text"
                  className="input auth-input"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="email">Your email</label>
                <input
                  id="email"
                  type="email"
                  className="input auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="password">Create password</label>
                <input
                  id="password"
                  type="password"
                  className="input auth-input"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
                id="signup-submit"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="auth-divider">Already with Pawly?</div>

            <p className="auth-footer auth-footer-left">
              Sign in to manage your assistant, leads, and website conversations.{' '}
              <Link href="/login" className="auth-link">
                Sign in
              </Link>
            </p>

            <p className="auth-back auth-back-left">
              <Link href="/" className="auth-backlink">Back to homepage</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
