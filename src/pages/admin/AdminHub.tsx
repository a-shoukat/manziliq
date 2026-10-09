export default function AdminHub({ onNavigate }: { onNavigate: (p: string) => void }) {
  const cards = [
    { page: 'admin-verification', title: 'Verification Queue', desc: 'Societies & dealers (v2)' },
    { page: 'admin-bookings', title: 'Bookings', desc: 'All booking requests (v7)' },
    { page: 'admin-disputes', title: 'Dispute Management', desc: 'Flagged transactions, mediation, freeze plots' },
    { page: 'admin-templates', title: 'Legal Templates', desc: 'Allotment, sale agreement, transfer deed' },
    { page: 'admin-analytics', title: 'Platform Analytics', desc: 'GMV, users, plots, growth' },
    { page: 'broadcast', title: 'Broadcast', desc: 'Announcements (v10)' },
  ];
  return (
    <div className="container">
      <h1>Admin panel</h1>
      <p className="muted">Platform control center</p>
      <div className="hub-grid">
        {cards.map((c) => (
          <button key={c.page} className="hub-card" onClick={() => onNavigate(c.page)}>
            <strong>{c.title}</strong>
            <span className="muted small">{c.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
