import { useEffect, useState } from 'react';
import { fetchProperties } from '../lib/properties';
import { useCompare } from '../lib/compare';
import type { Property } from '../types';
import PropertyCard from '../components/PropertyCard';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'size-desc';

const SKELETONS = 8;

function SkeletonCard() {
  return (
    <div className="prop-card" aria-hidden="true">
      <div className="prop-img"><div className="skel" style={{ width: '100%', height: '100%', borderRadius: 0 }} /></div>
      <div className="prop-body">
        <div className="skel" style={{ height: 20, width: '80%' }} />
        <div className="skel" style={{ height: 14, width: '60%' }} />
        <div className="skel" style={{ height: 32, width: '40%' }} />
      </div>
    </div>
  );
}

interface Props {
  onNavigate: (p: string, arg?: string) => void;
}

export default function Marketplace({ onNavigate }: Props) {
  const [all, setAll] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [purpose, setPurpose] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const { items: compareItems, toggle, has, clear } = useCompare();

  const load = () => {
    setLoading(true);
    setLoadError(null);
    fetchProperties()
      .then(({ list }) => setAll(list))
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Could not load properties'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cities = [...new Set(all.map((p) => p.city))].sort();

  const filtered = all
    .filter((p) => {
      if (q && !`${p.title} ${p.area ?? ''} ${p.society_name ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (city && p.city !== city) return false;
      if (category && p.category !== category) return false;
      if (purpose && p.purpose !== purpose) return false;
      if (status && p.status !== status) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'size-desc') return b.plot_size_marla - a.plot_size_marla;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const hasFilters = q || city || category || purpose || status || maxPrice;

  const resetFilters = () => {
    setQ(''); setCity(''); setCategory(''); setPurpose(''); setStatus(''); setMaxPrice('');
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Find your next property</h1>
          <p className="sub muted">
            {loading ? 'Searching listings…' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} available`}
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="filters" role="search" aria-label="Property filters">
        <input
          className="filter-input"
          placeholder="Search area, society, or keyword…"
          aria-label="Search properties"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} aria-label="Filter by purpose">
          <option value="">Buy or rent</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">Any status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <input
          className="filter-input"
          type="number"
          min={0}
          placeholder="Max budget (PKR)"
          aria-label="Maximum price in PKR"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort properties">
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="size-desc">Largest plots first</option>
        </select>
      </div>

      {compareItems.length > 0 && (
        <div className="compare-bar" role="status">
          <span>{compareItems.length} of 3 selected for comparison</span>
          <div className="link-row" style={{ margin: 0 }}>
            <button className="btn small" onClick={() => onNavigate('compare')}>Compare now</button>
            <button className="btn ghost small" onClick={clear}>Clear</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="prop-grid" aria-label="Loading properties">
          {Array.from({ length: SKELETONS }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : loadError ? (
        <div className="empty">
          <div className="empty-icon" aria-hidden="true">⚠️</div>
          <h3>Couldn't load listings</h3>
          <p className="muted small">{loadError}. Check your connection and try again.</p>
          <button className="btn" onClick={load}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" aria-hidden="true">🏘️</div>
          <h3>No properties found</h3>
          <p className="muted small">
            {hasFilters
              ? 'Nothing matches those filters. Try widening your budget or clearing a filter.'
              : 'No listings yet — check back soon.'}
          </p>
          {hasFilters && <button className="btn secondary" onClick={resetFilters}>Clear all filters</button>}
        </div>
      ) : (
        <div className="prop-grid">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} onOpen={(id) => onNavigate('property', id)} inCompare={has(p.id)} onToggleCompare={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}
