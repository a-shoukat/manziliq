import { useEffect, useState } from 'react';
import { fetchProperties } from '../lib/properties';
import { useCompare } from '../lib/compare';
import type { Property } from '../types';
import PropertyCard from '../components/PropertyCard';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'size-desc';

export default function Marketplace({ onNavigate }: { onNavigate: (p: string, arg?: string) => void }) {
  const [all, setAll] = useState<Property[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [purpose, setPurpose] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const { items: compareItems, toggle, has, clear } = useCompare();

  useEffect(() => {
    fetchProperties().then(({ list, demo }) => {
      setAll(list);
      setDemo(demo);
      setLoading(false);
    });
  }, []);

  const cities = [...new Set(all.map((p) => p.city))];

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

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Marketplace</h1>
          <p className="muted" style={{ margin: 0 }}>
            {filtered.length} properties
            {demo && ' · demo data — run supabase/schema.sql for live data'}
          </p>
        </div>
        <button className="btn secondary small" onClick={() => onNavigate('dashboard')}>
          Dashboard
        </button>
      </div>

      {/* WBS: search + 6 filters + sort */}
      <div className="filters">
        <input className="filter-input" placeholder="Search by area, society…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Res / Com</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">Sale / Rent</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <input className="filter-input" type="number" placeholder="Max price (PKR)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low → high</option>
          <option value="price-desc">Price: high → low</option>
          <option value="size-desc">Size: largest</option>
        </select>
      </div>

      {compareItems.length > 0 && (
        <div className="compare-bar">
          <span>{compareItems.length}/3 selected for comparison</span>
          <div className="link-row" style={{ margin: 0 }}>
            <button className="btn small" onClick={() => onNavigate('compare')}>Compare now</button>
            <button className="btn secondary small" onClick={clear}>Clear</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="muted">No properties match your filters.</p>
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
