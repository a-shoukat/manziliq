import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useCompare } from '../lib/compare';
import { unreadCount } from '../lib/notify';

interface Props {
  page: string;
  onNavigate: (p: string, arg?: string) => void;
  /** hide app links and show marketing nav (landing) */
  variant?: 'app' | 'public';
}

export default function Navbar({ page, onNavigate, variant = 'app' }: Props) {
  const { session, profile, signOut } = useAuth();
  const { items } = useCompare();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session) {
      unreadCount(session.user.id).then(setUnread);
      const t = setInterval(() => unreadCount(session.user.id).then(setUnread), 30000);
      return () => clearInterval(t);
    }
  }, [session, page]);

  const go = (p: string, arg?: string) => { setOpen(false); onNavigate(p, arg); };

  const link = (key: string, label: string, badge?: number) => (
    <button
      key={key}
      className={`nav-link${page === key ? ' active' : ''}`}
      aria-current={page === key ? 'page' : undefined}
      onClick={() => go(key)}
    >
      {label}
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </button>
  );

  const isBuyer = profile?.role === 'buyer';
  const isSociety = profile?.role === 'society_admin' || profile?.role === 'super_admin';
  const isDealer = profile?.role === 'dealer' || profile?.role === 'super_admin';
  const isSuper = profile?.role === 'super_admin';

  return (
    <>
      {variant === 'public' && (
        <div className="utilbar">
          <div className="wrap">
            <div>
              <span>✉️ info@manziliq.pk</span>
              <span>📞 +92 300 000 0000</span>
              <span>📍 Lahore, Pakistan</span>
            </div>
            <div>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram" style={{ marginLeft: 12 }}>ig</a>
              <a href="#" aria-label="LinkedIn" style={{ marginLeft: 12 }}>in</a>
            </div>
          </div>
        </div>
      )}
      <nav className="navbar" aria-label="Main navigation">
        <div className="wrap">
          <button
            className="nav-brand"
            onClick={() => go(variant === 'public' ? 'landing' : 'dashboard')}
            aria-label="ManzilIQ home"
          >
            <img src="/manziliq-logo.png" alt="ManzilIQ" className="brand-logo" />
          </button>

          <button className="nav-toggle" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}>
            {open ? '✕' : '☰'}
          </button>

          <div className={`nav-links${open ? ' open' : ''}`}>
            {variant === 'public' ? (
              <>
                {link('landing', 'Home')}
                <button className="nav-link" onClick={() => go('marketplace')}>Buy</button>
                <button className="nav-link" onClick={() => go('marketplace')}>Rent</button>
                <button className="nav-link" onClick={() => go('price-estimator')}>AI Price</button>
                <button className="nav-link" onClick={() => go('market-trends')}>Market</button>
              </>
            ) : (
              <>
                {link('marketplace', 'Marketplace')}
                {link('map-view', 'Map')}
                {link('price-estimator', 'AI Price')}
                {isBuyer && link('book-plot', 'Book')}
                {isBuyer && link('my-payments', 'Payments')}
                {isSociety && link('society-bookings', 'Bookings')}
                {link('compare', 'Compare', items.length || undefined)}
                {(isDealer || isSociety) && link('add-property', '＋ Add')}
                {isSociety && link('society', 'Society')}
                {isDealer && link('dealer', 'Dealer')}
                {link('inbox', 'Inbox', unread || undefined)}
                {link('documents', 'Documents')}
                {link('market-trends', 'Trends')}
                {isSociety && link('broadcast', 'Broadcast')}
                {isSuper && link('admin', 'Admin')}
                <button className="nav-link" onClick={async () => { await signOut(); go('landing'); }}>
                  Sign out
                </button>
              </>
            )}
          </div>

          <div className="nav-cta">
            {variant === 'public' ? (
              session
                ? <button className="btn pill" onClick={() => go('dashboard')}>Dashboard →</button>
                : <button className="btn pill" onClick={() => go('login')}>Sign in</button>
            ) : (
              (isDealer || isSociety) && (
                <button className="btn pill small" onClick={() => go('add-property')}>＋ List property</button>
              )
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
