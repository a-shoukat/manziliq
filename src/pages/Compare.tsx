import { useCompare } from '../lib/compare';
import { formatPrice } from '../lib/properties';

/** WBS: Customer Portal — Plot Comparison (5 features) */
export default function Compare({ onNavigate }: { onNavigate: (p: string, arg?: string) => void }) {
  const { items, clear, toggle } = useCompare();

  const rows: { label: string; get: (p: (typeof items)[number]) => string }[] = [
    { label: 'Price', get: (p) => formatPrice(p.price) },
    { label: 'Size', get: (p) => `${p.plot_size_marla} Marla` },
    { label: 'Location', get: (p) => `${p.city}${p.area ? ', ' + p.area : ''}` },
    { label: 'Society', get: (p) => p.society_name ?? '—' },
    { label: 'Category', get: (p) => p.category },
    { label: 'Purpose', get: (p) => p.purpose },
    { label: 'Bedrooms', get: (p) => (p.bedrooms != null ? String(p.bedrooms) : '—') },
    { label: 'Bathrooms', get: (p) => (p.bathrooms != null ? String(p.bathrooms) : '—') },
    { label: 'Status', get: (p) => p.status },
    { label: 'Payment plan', get: (p) => (p.purpose === 'rent' ? 'Monthly rent' : 'Full payment / installments (v8)') },
  ];

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Compare plots</h1>
          <p className="muted" style={{ margin: 0 }}>
            Side-by-side comparison · saved on this device
          </p>
        </div>
        <div className="link-row" style={{ margin: 0 }}>
          <button className="btn secondary small" onClick={() => onNavigate('marketplace')}>
            Marketplace
          </button>
          {items.length > 0 && (
            <button className="btn secondary small" onClick={clear}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <p className="muted">
            No plots selected. Go to the marketplace and tap <strong>+ Compare</strong> on up
            to 3 plots.
          </p>
          <button className="btn small" onClick={() => onNavigate('marketplace')}>
            Browse properties
          </button>
        </div>
      ) : (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                {items.map((p) => (
                  <th key={p.id}>
                    {p.title}
                    <button className="link inline" onClick={() => toggle(p)}>
                      {' '}✕ remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="row-label">{r.label}</td>
                  {items.map((p) => (
                    <td key={p.id}>{r.get(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
