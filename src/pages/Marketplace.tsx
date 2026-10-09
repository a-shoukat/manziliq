import { useEffect, useMemo, useState } from 'react';
import { fetchProperties } from '../lib/properties';
import { useCompare } from '../lib/compare';
import type { Property } from '../types';
import PropertyCard from '../components/PropertyCard';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'size-desc';

interface Props {
  onNavigate: (p: string, arg?: string) => void;
}

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

export default function Marketplace({ onNavigate }: Props) {
  const [all, setAll] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cats, setCats] = useState<string[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>('newest');
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const { items: compareItems, toggle, has, clear } = useCompare();

  useEffect(() => {
    fetchProperties()
      .then(({ list }) => setAll(list))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const allCities = useMemo(() => [...new Set(all.map((p) => p.city))].sort(), [all]);

  const toggleArr = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filtered = all
    .filter((p) => {
      if (q && !`${p.title} ${p.area ?? ''} ${p.society_name ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cities.length && !cities.includes(p.city)) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (purposes.length && !purposes.includes(p.purpose)) return false;
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'size-desc') return b.plot_size_marla - a.plot_size_marla;
      return +new Date(b.created_at) - +new Date(a.created_at);
    });

  const clearAll = () => {
    setQ(''); setCities([]); setCats([]); setPurposes([]); setMinPrice(''); setMaxPrice('');
  };
  const activeCount = cities.length + cats.length + purposes.length + (minPrice || maxPrice ? 1 : 0) + (q ? 1 : 0);

  const toggleFav = (p: Property) =>
    setFavs((s) => { const n = new Set(s); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; });

  return (
    <div className="wrap" style={{ paddingTop: 24, paddingBottom: 56 }}>
      <div className="mp-layout">
        {/* SIDEBAR */}
        <aside className="mp-sidebar" aria-label="Filters">
          <div className="filter-card">
            <h4>🔍 Search <button aria-label="Clear search" onClick={() => setQ('')}>✕</button></h4>
            <input placeholder="Area, society, keyword…" aria-label="Search properties"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="filter-card">
            <h4>📍 Location</h4>
            {allCities.map((c) => (
              <label key={c} className="check-row">
                <input type="checkbox" checked={cities.includes(c)}
                  onChange={() => toggleArr(cities, c, setCities)} />
                {c}
              </label>
            ))}
          </div>

          <div className="filter-card">
            <h4>💰 Price range (PKR)</h4>
            <div className="price-inputs">
              <input type="number" placeholder="Min" aria-label="Minimum price"
                value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span>–</span>
              <input type="number" placeholder="Max" aria-label="Maximum price"
                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="filter-card">
            <h4>🏠 Property type</h4>
            {[['residential', 'Residential'], ['commercial', 'Commercial']].map(([v, l]) => (
              <label key={v} className="check-row">
                <input type="checkbox" checked={cats.includes(v)}
                  onChange={() => toggleArr(cats, v, setCats)} />
                {l}
              </label>
            ))}
          </div>

          <div className="filter-card">
            <h4>🎯 Purpose</h4>
            {[['sale', 'For sale'], ['rent', 'For rent']].map(([v, l]) => (
              <label key={v} className="check-row">
                <input type="checkbox" checked={purposes.includes(v)}
                  onChange={() => toggleArr(purposes, v, setPurposes)} />
                {l}
              </label>
            ))}
          </div>

          {activeCount > 0 && (
            <button className="btn outline block" onClick={clearAll}>
              Clear all ({activeCount})
            </button>
          )}
        </aside>

        {/* MAIN */}
        <div className="mp-main">
          <div className="mp-head">
            <div>
              <h1 style={{ margin: 0 }}>Marketplace</h1>
              <p className="mp-count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>
            <select className="sortsel" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort by">
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="size-desc">Largest first</option>
            </select>
          </div>

          {compareItems.length > 0 && (
            <div className="alert info" role="status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span>{compareItems.length}/3 selected for comparison</span>
              <span>
                <button className="btn small" onClick={() => onNavigate('compare')}>Compare now</button>{' '}
                <button className="btn ghost small" onClick={clear}>Clear</button>
              </span>
            </div>
          )}

          {loading ? (
            <div className="prop-grid">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : err ? (
            <div className="empty">
              <div className="ei">⚠️</div>
              <h3>Couldn't load listings</h3>
              <p>{err}</p>
              <button className="btn" onClick={() => window.location.reload()}>Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="ei">🏘️</div>
              <h3>No properties found</h3>
              <p>Try widening your price range or clearing some filters.</p>
              <button className="btn outline" onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <div className="prop-grid">
              {filtered.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onOpen={(id) => onNavigate('property', id)}
                  inCompare={has(p.id)}
                  onToggleCompare={toggle}
                  onToggleFav={toggleFav}
                  isFav={favs.has(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
