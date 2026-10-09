import type { Property } from '../types';
import { formatPrice } from '../lib/properties';

interface Props {
  property: Property;
  onOpen: (id: string) => void;
  inCompare?: boolean;
  onToggleCompare?: (p: Property) => void;
  onToggleFav?: (p: Property) => void;
  isFav?: boolean;
}

export default function PropertyCard({ property: p, onOpen, inCompare, onToggleCompare, onToggleFav, isFav }: Props) {
  const location = [p.area, p.city].filter(Boolean).join(', ');
  const forRent = p.purpose === 'rent';

  return (
    <article className="prop-card">
      <div className="prop-img">
        {p.image_url ? (
          <img src={p.image_url} alt={`${p.title} in ${location}`} loading="lazy" onClick={() => onOpen(p.id)} style={{ cursor: 'pointer' }} />
        ) : (
          <div className="ph" aria-hidden="true">{p.category === 'commercial' ? '🏢' : '🏡'}</div>
        )}
        <div className="prop-badges">
          <span className={`badge ${forRent ? 'rent' : 'sale'}`}>{forRent ? 'For Rent' : 'For Sale'}</span>
          {p.is_featured ? <span className="badge gold">★ Featured</span> : null}
        </div>
        {onToggleFav && (
          <button
            className="prop-fav"
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
            aria-pressed={!!isFav}
            onClick={() => onToggleFav(p)}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="prop-body">
        <h3 className="prop-title" onClick={() => onOpen(p.id)}>{p.title}</h3>
        <p className="prop-loc">📍 {location}{p.society_name ? ` · ${p.society_name}` : ''}</p>
        <p className="prop-specs">
          <span>📐 {p.plot_size_marla} Marla</span>
          {p.bedrooms ? <span>🛏 {p.bedrooms} Beds</span> : null}
          {p.bathrooms ? <span>🛁 {p.bathrooms} Baths</span> : null}
        </p>
        <div className="prop-foot">
          <span className="price">{formatPrice(p.price)}{forRent ? <small> /mo</small> : null}</span>
          {onToggleCompare && (
            <button
              className={`btn small ${inCompare ? '' : 'outline'}`}
              aria-pressed={!!inCompare}
              onClick={() => onToggleCompare(p)}
            >
              {inCompare ? '✓ Added' : '＋ Compare'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
