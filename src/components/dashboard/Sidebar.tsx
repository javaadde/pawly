'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/pets', label: 'My Pets', icon: '🐾' },
  { href: '/dashboard/pets/new', label: 'Create Pet', icon: '✨' },
];

interface SidebarProps {
  user?: { name?: string | null; email?: string | null };
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--dark-border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>🐾</span>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>Pawly</span>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem' }}>AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="divider" style={{ margin: '1rem 0' }} />

        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
          Help
        </p>
        <Link href="/" className="sidebar-link">
          <span>🌐</span>
          <span>View Site</span>
        </Link>
      </nav>

      {/* User */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--dark-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="sidebar-link"
          style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}
          id="signout-btn"
        >
          <span>🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
