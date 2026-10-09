import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useCompare } from '../lib/compare';
import { unreadCount } from '../lib/notify';

interface Props {
  page: string;
  onNavigate: (p: string, arg?: string) => void;
}

export default function Navbar({ page, onNavigate }: Props) {
  const { session, profile, signOut } = useAuth();
  const { items } = useCompare();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session) {
      unreadCount(session.user.id).then(setUnread);
      const t = setInterval(() => {
        unreadCount(session.user.id).then(setUnread);
      }, 30000);
      return () => clearInterval(t);
    }
  }, [session, page]);

  // Close mobile menu on navigation
  const go = (p: string, arg?: string) => {
    setMenuOpen(false);
    onNavigate(p, arg);
  };

  const link = (key: string, label: string, badge?: number) => (
    <button
      key={key}
      className={`nav-link${page === key ? ' active' : ''}`}
      aria-current={page === key ? 'page' : undefined}
      onClick={() => go(key)}
    >
      {label}
      {badge ? <span className="nav-badge" aria-label={`${badge} unread`}>{badge}</span> : null}
    </button>
  );

  const isBuyer = profile?.role === 'buyer';
  const isSociety =
    profile?.role === 'society_admin' || profile?.role === 'super_admin';
  const isDealer = profile?.role === 'dealer' || profile?.role === 'super_admin';
  const isSuper = profile?.role === 'super_admin';
  const canAdd = isDealer || isSociety;

  return (
    <nav className="navbar" aria-label="Main navigation">
      <button className="nav-brand" onClick={() => go('dashboard')} aria-label="ManzilIQ home">
        <span className="mark" aria-hidden="true">M</span>
        ManzilIQ
      </button>

      <button
        className="nav-toggle"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links${menuOpen ? ' open' : ''}`}>
        {link('marketplace', 'Marketplace')}
        {link('map-view', 'Map')}
        {link('price-estimator', 'AI Price')}
        {isBuyer && link('book-plot', 'Book a plot')}
        {isBuyer && link('my-payments', 'My payments')}
        {isSociety && link('society-bookings', 'Bookings')}
        {link('compare', 'Compare', items.length || undefined)}
        {canAdd && link('add-property', '＋ Add property')}
        {isSociety && link('society', 'Society')}
        {isDealer && link('dealer', 'Dealer hub')}
        {link('inbox', 'Inbox', unread || undefined)}
        {link('documents', 'Documents')}
        {link('market-trends', 'Market trends')}
        {isSociety && link('broadcast', 'Broadcasts')}
        {isSuper && link('admin', 'Admin')}
        {isSuper && link('admin-disputes', 'Disputes')}
        {isSuper && link('admin-verification', 'Verification')}
        <button
          className="nav-link"
          onClick={async () => {
            await signOut();
            go('login');
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
