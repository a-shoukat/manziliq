import type { Property } from '../types';
import { formatPrice } from '../lib/properties';

interface Props {
  property: Property;
  onOpen: (id: string) => void;
  inCompare: boolean;
  onToggleCompare: (p: Property) => void;
}

export default function PropertyCard({ property: p, onOpen, inCompare, onToggleCompare }: Props) {
  return (
    <div className="prop-card">
      <div className="prop-img">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} />
        ) : (
          <div className="prop-img-fallback">
            {p.category === 'commercial' ? '🏢' : '🏠'}
          </div>
        )}
        <span className={`badge ${p.status === 'available' ? 'ok' : 'warn'} prop-status`}>
          {p.status}
        </span>
      </div>
      <div className="prop-body">
        <h3 onClick={() => onOpen(p.id)} className="prop-title">
          {p.title}
        </h3>
        <p className="muted small">
          {p.city}
          {p.area ? ` · ${p.area}` : ''}
          {p.society_name ? ` · ${p.society_name}` : ''}
        </p>
        <div className="prop-meta">
          <span>{p.plot_size_marla} Marla</span>
          <span>{p.category}</span>
          <span>{p.purpose}</span>
          {p.bedrooms ? <span>{p.bedrooms} bed</span> : null}
        </div>
        <div className="prop-foot">
          <strong className="price">{formatPrice(p.price)}</strong>
          <button
            className={`btn small ${inCompare ? 'secondary' : ''}`}
            onClick={() => onToggleCompare(p)}
          >
            {inCompare ? '✓ Compare' : '+ Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
