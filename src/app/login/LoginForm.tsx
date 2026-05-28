'use client';

import { useEffect, useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import heroBackground from '@/assets/images/background.png';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getSession().then((session) => {
      if (isMounted && session) {
        router.replace('/dashboard');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.replace('/dashboard');
      router.refresh();
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
            <Link href="/signup" className="auth-header-link">
              Create account
            </Link>
          </nav>
        </header>

        <div className="auth-shell auth-shell-login">
          <aside className="auth-showcase auth-showcase-login">
            <div className="auth-showcase-copy auth-showcase-copy-login">
              <p className="auth-showcase-kicker">You can easily</p>
              <h2>Get back to your AI pet dashboard in seconds.</h2>
            </div>
          </aside>

          <div className="auth-panel auth-panel-login">
            <div className="auth-heading auth-heading-left">
              <h1>Welcome back</h1>
              <p>Access your dashboard, leads, and assistant settings from one place.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="alert alert-error">{error}</div>}

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
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="auth-submit" disabled={loading} id="login-submit">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="auth-divider auth-divider-centered">New to Pawly?</div>

            <p className="auth-footer auth-footer-centered">
              Create your account to launch your pet assistant in minutes.{' '}
              <Link href="/signup" className="auth-link">Start for free</Link>
            </p>
            <p className="auth-back auth-back-centered">
              <Link href="/" className="auth-backlink">Back to homepage</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
