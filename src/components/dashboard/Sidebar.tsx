'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home', shortLabel: 'Home' },
  { href: '/dashboard/pets', label: 'My Pets', icon: 'paw', shortLabel: 'Pets' },
  { href: '/dashboard/pets/new', label: 'Create Pet', icon: 'plus', shortLabel: 'Create' },
];

const utilityItems = [{ href: '/', label: 'View Site', icon: 'globe' }];

interface SidebarProps {
  user?: { name?: string | null; email?: string | null };
}

function SidebarIcon({ name, className }: { name: string; className?: string }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'spark':
      return (
        <svg {...props}>
          <path d="M12 3.5L13.7 8.3L18.5 10L13.7 11.7L12 16.5L10.3 11.7L5.5 10L10.3 8.3L12 3.5Z" />
        </svg>
      );
    case 'home':
      return (
        <svg {...props}>
          <path d="M4 10.5L12 4L20 10.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5Z" />
          <path d="M9.5 20V14.5H14.5V20" />
        </svg>
      );
    case 'paw':
      return (
        <svg {...props}>
          <circle cx="7.5" cy="8" r="1.5" />
          <circle cx="11.5" cy="6.5" r="1.5" />
          <circle cx="15.5" cy="8" r="1.5" />
          <circle cx="18" cy="11.5" r="1.5" />
          <path d="M12.2 18.5c2.4 0 4.3-1.2 4.3-3.1 0-1.2-.8-2.1-1.8-2.9-.7-.6-1.3-1.6-2.5-1.6s-1.8 1-2.5 1.6c-1 .8-1.8 1.7-1.8 2.9 0 1.9 1.9 3.1 4.3 3.1Z" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M12 8V16" />
          <path d="M8 12H16" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12H20" />
          <path d="M12 4C14.5 6.4 15.9 9.1 15.9 12C15.9 14.9 14.5 17.6 12 20" />
          <path d="M12 4C9.5 6.4 8.1 9.1 8.1 12C8.1 14.9 9.5 17.6 12 20" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
          <path d="M13 16L18 12L13 8" />
          <path d="M18 12H9" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...props}>
          <path d="M9 6L15 12L9 18" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...props}>
          <path d="M15 6L9 12L15 18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const activeItem = navItems.find(({ href }) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href))) || navItems[0];
  const isOpen = isPinnedOpen;

  useEffect(() => {
    document.body.classList.toggle('dashboard-sidebar-open', isOpen);

    return () => {
      document.body.classList.remove('dashboard-sidebar-open');
    };
  }, [isOpen]);

  const handleRailClick = () => {
    setIsPinnedOpen((current) => !current);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar-topbar">
        <button type="button" className="sidebar-rail-arrow" onClick={handleRailClick} aria-label={isOpen ? 'Close menu' : 'Open menu'}>
          <SidebarIcon name={isOpen ? 'chevron-left' : 'chevron-right'} className="sidebar-nav-icon" />
        </button>
      </div>

      <nav className="sidebar-primary-nav" aria-label="Dashboard navigation">
        {navItems.map(({ href, label, icon, shortLabel }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

          return (
            <Link key={href} href={href} className={`sidebar-primary-link ${isActive ? 'active' : ''}`} aria-label={shortLabel}>
              <span className="sidebar-primary-link-copy">
                <SidebarIcon name={icon} className="sidebar-nav-icon" />
                <span className="sidebar-primary-label">{label}</span>
              </span>
              <span className="sidebar-panel-link-indicator" />
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-rail-spine" aria-hidden="true" />

      <div className={`sidebar-panel ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-panel-subgroup">
          <p className="sidebar-section-label">Current focus</p>
          <div className="sidebar-panel-highlight">
            <span className="sidebar-panel-highlight-label">Active area</span>
            <strong>{activeItem.label}</strong>
            <p>Keep building with the same polished, warm brand feel as your landing page.</p>
          </div>
        </div>

        <div className="sidebar-panel-subgroup">
          <p className="sidebar-section-label">Explore</p>
          {utilityItems.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="sidebar-primary-link sidebar-secondary-link">
              <span className="sidebar-primary-link-copy">
                <SidebarIcon name={icon} className="sidebar-nav-icon" />
                <span className="sidebar-primary-label">{label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button onClick={() => signOut({ callbackUrl: '/' })} type="button" className={`sidebar-user-signout ${isOpen ? 'is-open' : ''}`} id="signout-btn" aria-label="Sign out">
          <SidebarIcon name="logout" className="sidebar-nav-icon" />
          <span className="sidebar-primary-label">Sign out</span>
        </button>

        <div className={`sidebar-user-block ${isOpen ? 'is-open' : ''}`}>
          <div className="sidebar-user-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
          <div className="sidebar-user-copy">
            <strong>{user?.name || 'User'}</strong>
            <span>{user?.email || ''}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
