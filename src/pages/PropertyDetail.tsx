import { useEffect, useState } from 'react';
import { fetchProperty, formatPrice } from '../lib/properties';
import { useCompare } from '../lib/compare';
import type { Property } from '../types';

export default function PropertyDetail({
  id,
  onNavigate,
}: {
  id: string;
  onNavigate: (p: string, arg?: string) => void;
}) {
  const [p, setP] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggle, has } = useCompare();

  useEffect(() => {
    fetchProperty(id).then((prop) => {
      setP(prop);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="container">
        <p className="muted">Property not found.</p>
        <button className="btn secondary small" onClick={() => onNavigate('marketplace')}>
          Back to marketplace
        </button>
      </div>
    );
  }

  const rows: [string, string][] = [
    ['City', p.city],
    ['Area', p.area ?? '—'],
    ['Society', p.society_name ?? '—'],
    ['Block', p.block ?? '—'],
    ['Plot size', `${p.plot_size_marla} Marla`],
    ['Category', p.category],
    ['Purpose', p.purpose],
    ['Bedrooms', p.bedrooms != null ? String(p.bedrooms) : '—'],
    ['Bathrooms', p.bathrooms != null ? String(p.bathrooms) : '—'],
    ['Status', p.status],
  ];

  return (
    <div className="container">
      <button className="btn secondary small" onClick={() => onNavigate('marketplace')}>
        ← Back
      </button>
      <div className="detail-hero">
        <div className="prop-img large">
          {p.image_url ? (
            <img src={p.image_url} alt={p.title} />
          ) : (
            <div className="prop-img-fallback">{p.category === 'commercial' ? '🏢' : '🏠'}</div>
          )}
        </div>
        <div>
          <h1>{p.title}</h1>
          <p className="muted">
            {p.city}
            {p.area ? ` · ${p.area}` : ''}
          </p>
          <p className="price big">{formatPrice(p.price)}</p>
          <div className="link-row">
            <button className={`btn small ${has(p.id) ? 'secondary' : ''}`} onClick={() => toggle(p)}>
              {has(p.id) ? '✓ In comparison' : '+ Add to compare'}
            </button>
          </div>
        </div>
      </div>
      {p.description && <p className="desc">{p.description}</p>}
      <div className="spec-table">
        {rows.map(([k, v]) => (
          <div key={k} className="spec-row">
            <span className="detail-key">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
