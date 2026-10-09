import { useAuth } from '../../lib/auth';

export default function DealerHub({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile } = useAuth();
  void profile;
  const cards = [
    { page: 'dealer-discover', title: 'Discover Societies', desc: 'Browse societies, view lots, send join requests' },
    { page: 'dealer-lots', title: 'My Lots & Plots', desc: 'Assigned plots, mark showing to client, plot map' },
    { page: 'dealer-leads', title: 'Leads & Pipeline', desc: 'Customer leads, call/visit log, 6-stage deal pipeline' },
    { page: 'dealer-create-booking', title: 'Create Booking', desc: 'Book a plot for a customer' },
    { page: 'dealer-transfer-requests', title: 'Transfer Requests', desc: 'Request plot transfers for buyers' },
    { page: 'dealer-verify-payments', title: 'Verify Payments', desc: 'Review customer receipts, approve or reject' },
  ];
  return (
    <div className="container">
      <h1>Dealer portal</h1>
      <p className="muted">Societies, lots, leads and deals</p>
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
