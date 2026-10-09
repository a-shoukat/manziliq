import type { Property } from '../types';
import { formatPrice } from '../lib/properties';

interface Props {
  property: Property;
  onOpen: (id: string) => void;
  inCompare: boolean;
  onToggleCompare: (p: Property) => void;
}

/** Human-readable meta chips for a property card */
function metaChips(p: Property): string[] {
  const chips: string[] = [];
  if (p.plot_size_marla) chips.push(`${p.plot_size_marla} Marla`);
  if (p.category) chips.push(p.category === 'residential' ? 'Residential' : 'Commercial');
  if (p.purpose) chips.push(p.purpose === 'rent' ? 'For rent' : 'For sale');
  if (p.bedrooms) chips.push(`${p.bedrooms} bed`);
  return chips;
}

const statusTone = (status?: string) =>
  status === 'available' ? 'ok' : status === 'sold' ? 'warn' : 'info';

export default function PropertyCard({ property: p, onOpen, inCompare, onToggleCompare }: Props) {
  const location = [p.city, p.area, p.society_name].filter(Boolean).join(' · ');

  return (
    <article className="prop-card">
      <div className="prop-img">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={`${p.title} — ${location}`}
            loading="lazy"
            onClick={() => onOpen(p.id)}
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <div className="prop-img-fallback" aria-hidden="true">
            {p.category === 'commercial' ? '🏢' : '🏠'}
          </div>
        )}
        <span className={`badge ${statusTone(p.status)} prop-status`}>
          {p.status === 'available' ? 'Available' : p.status}
        </span>
        {p.is_featured && <span className="badge gold prop-status" style={{ top: 40 }}>Featured</span>}
      </div>

      <div className="prop-body">
        <h3 className="prop-title" onClick={() => onOpen(p.id)} title={p.title}>
          {p.title}
        </h3>
        <p className="prop-loc muted small">{location}</p>

        <div className="prop-meta" aria-label="Property details">
          {metaChips(p).map((c) => (
            <span key={c} className="badge neutral">{c}</span>
          ))}
        </div>

        <div className="prop-foot">
          <strong className="price" aria-label={`Price ${formatPrice(p.price)}`}>
            {formatPrice(p.price)}
          </strong>
          <button
            type="button"
            className={`btn small ${inCompare ? 'secondary' : 'ghost'}`}
            aria-pressed={inCompare}
            onClick={() => onToggleCompare(p)}
          >
            {inCompare ? '✓ Comparing' : '＋ Compare'}
          </button>
        </div>
      </div>
    </article>
  );
}
