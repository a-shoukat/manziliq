import { useAuth } from '../lib/auth';
import { useCompare } from '../lib/compare';

export default function Navbar({
  page,
  onNavigate,
}: {
  page: string;
  onNavigate: (p: string, arg?: string) => void;
}) {
  const { profile, signOut } = useAuth();
  const { items } = useCompare();

  const link = (key: string, label: string, badge?: number) => (
    <button
      key={key}
      className={`nav-link${page === key ? ' active' : ''}`}
      onClick={() => onNavigate(key)}
    >
      {label}
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </button>
  );

  const canAdd =
    profile?.role === 'dealer' ||
    profile?.role === 'society_admin' ||
    profile?.role === 'super_admin';

  const isSociety =
    profile?.role === 'society_admin' || profile?.role === 'super_admin';

  const isDealer =
    profile?.role === 'dealer' || profile?.role === 'super_admin';

  return (
    <nav className="navbar">
      <button className="nav-brand" onClick={() => onNavigate('dashboard')}>
        ManzilIQ
      </button>
      <div className="nav-links">
        {link('marketplace', 'Marketplace')}
        {link('map-view', 'Map')}
        {link('price-estimator', 'AI Price')}
        {profile?.role === 'buyer' && link('book-plot', 'Book')}
        {profile?.role === 'buyer' && link('my-payments', 'Payments')}
        {(profile?.role === 'society_admin' || profile?.role === 'super_admin') &&
          link('society-bookings', 'Bookings')}
        {link('compare', 'Compare', items.length || undefined)}
        {canAdd && link('add-property', '+ Add')}
        {isSociety && link('society', 'Society')}
        {isDealer && link('dealer', 'Dealer')}
        {profile?.role === 'super_admin' &&
          link('admin-verification', 'Verification')}
        <button
          className="nav-link"
          onClick={async () => {
            await signOut();
            onNavigate('login');
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
