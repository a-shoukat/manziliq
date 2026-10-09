import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import { fetchProperties, formatPrice } from '../lib/properties';
import type { Property } from '../types';

interface Props {
  onNavigate: (p: string, arg?: string) => void;
}

const TYPES = [
  { icon: '🏢', label: 'Apartments', count: '1,248 listings' },
  { icon: '🏠', label: 'Houses', count: '2,345 listings' },
  { icon: '🏡', label: 'Villas', count: '856 listings' },
  { icon: '🏙️', label: 'Condos', count: '1,032 listings' },
  { icon: '🏘️', label: 'Townhouses', count: '645 listings' },
  { icon: '📐', label: 'Plots', count: '3,321 listings' },
];

const WHY = [
  { icon: '🛡️', title: 'Verified listings', text: 'Every society and property is document-verified before it goes live.' },
  { icon: '💰', title: 'Best price', text: 'AI price estimates keep you from overpaying — transparent, data-backed.' },
  { icon: '🎧', title: 'Expert agents', text: 'Verified dealers guide you from first visit to final transfer.' },
  { icon: '📄', title: 'Easy process', text: 'Book, pay, and transfer — simple paperwork, start to finish.' },
];

const TESTIS = [
  { q: 'ManzilIQ made finding our plot so easy. The team was professional, helpful, and always available!', n: 'Ahmed Raza', c: 'DHA Lahore', i: 'AR' },
  { q: 'The best property experience I have ever had. Highly recommend ManzilIQ to anyone looking to buy.', n: 'Fatima Khan', c: 'Bahria Town', i: 'FK' },
  { q: 'I booked my plot in record time. Their verification and support were outstanding!', n: 'Usman Tariq', c: 'Lake City', i: 'UT' },
];

export default function Landing({ onNavigate }: Props) {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [q, setQ] = useState('');
  const [ptype, setPtype] = useState('');
  const [budget, setBudget] = useState('');
  const [newsEmail, setNewsEmail] = useState('');
  const [newsDone, setNewsDone] = useState(false);

  useEffect(() => {
    fetchProperties().then(({ list }) => setFeatured(list.slice(0, 4))).catch(() => {});
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('marketplace');
  };

  return (
    <>
      <Navbar page="landing" onNavigate={onNavigate} variant="public" />

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div>
            <span className="hero-kicker">★ Pakistan’s verified property platform</span>
            <h1>Find Your Dream Home.<br /><span className="green">Live Your Best Life.</span></h1>
            <p className="lede">
              Explore thousands of verified properties and find a place you’ll love to call home —
              from DHA to Bahria Town and beyond.
            </p>
            <div className="hero-ctas">
              <button className="btn pill" onClick={() => onNavigate('marketplace')}>
                Explore properties →
              </button>
              <button className="btn outline pill" onClick={() => onNavigate('price-estimator')}>
                ▶ How it works
              </button>
            </div>
            <div className="hero-proof">
              <div className="avatars" aria-hidden="true">
                <span className="av" style={{ background: '#189a4c' }}>AR</span>
                <span className="av" style={{ background: '#2e90fa' }}>FK</span>
                <span className="av" style={{ background: '#f5a623' }}>UT</span>
                <span className="av" style={{ background: '#101828' }}>+</span>
              </div>
              <div className="t">
                <span className="stars" aria-label="5 star rating">★★★★★</span>
                <strong>Trusted by 10,000+ happy clients</strong>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-img">
              <div className="ph">🏡</div>
            </div>
            <div className="float-card fc1">
              <span className="fc-ic">🏠</span>
              <span><span className="fc-t">Featured villa</span><br /><span className="fc-v">DHA Phase 6</span></span>
            </div>
            <div className="float-card fc2">
              <span className="fc-ic">💰</span>
              <span><span className="fc-t">Starting from</span><br /><span className="fc-v">{formatPrice(8500000)}</span></span>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="wrap">
          <form className="search-card" onSubmit={search} role="search" aria-label="Property search">
            <div className="sfield">
              <label htmlFor="s-loc">Location</label>
              <input id="s-loc" placeholder="Enter location" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="sfield">
              <label htmlFor="s-type">Property type</label>
              <select id="s-type" value={ptype} onChange={(e) => setPtype(e.target.value)}>
                <option value="">Any type</option>
                <option value="house">House</option>
                <option value="plot">Plot</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="sfield">
              <label htmlFor="s-budget">Price range</label>
              <select id="s-budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="">Any price</option>
                <option value="50">Under 50 Lakh</option>
                <option value="100">50L – 1 Cr</option>
                <option value="500">1 – 5 Cr</option>
                <option value="9999">5 Cr+</option>
              </select>
            </div>
            <div className="sfield">
              <label htmlFor="s-beds">Beds</label>
              <select id="s-beds"><option>Any</option><option>1+</option><option>3+</option><option>5+</option></select>
            </div>
            <div className="sfield">
              <label htmlFor="s-baths">Baths</label>
              <select id="s-baths"><option>Any</option><option>1+</option><option>2+</option><option>4+</option></select>
            </div>
            <button className="btn" type="submit" style={{ minHeight: 52 }}>🔍 Search</button>
          </form>
        </div>
      </header>

      {/* TYPES */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div><h2>Explore property types</h2><p>Browse by what fits your life</p></div>
            <button className="link" onClick={() => onNavigate('marketplace')}>View all →</button>
          </div>
          <div className="type-grid">
            {TYPES.map((t) => (
              <button key={t.label} className="type-card" onClick={() => onNavigate('marketplace')}>
                <div className="ti">{t.icon}</div>
                <strong>{t.label}</strong>
                <span>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section section-soft">
        <div className="wrap">
          <div className="sec-head">
            <div><h2>Featured properties</h2><p>Hand-picked verified listings</p></div>
            <button className="link" onClick={() => onNavigate('marketplace')}>View all properties →</button>
          </div>
          <div className="prop-grid">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} onOpen={(id) => onNavigate('property', id)} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head"><div><h2>Why choose ManzilIQ?</h2></div></div>
          <div className="why-grid">
            {WHY.map((w) => (
              <div key={w.title} className="why-card">
                <div className="wi">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-soft">
        <div className="wrap">
          <div className="sec-head"><div><h2>What our clients say</h2></div></div>
          <div className="testi-grid">
            {TESTIS.map((t) => (
              <div key={t.n} className="testi">
                <div className="q">“</div>
                <p>{t.q}</p>
                <div className="stars">★★★★★</div>
                <div className="testi-who">
                  <span className="av">{t.i}</span>
                  <span><strong>{t.n}</strong><span>{t.c}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section">
        <div className="wrap">
          <div className="newsletter">
            <div>
              <h2>Get exclusive property updates</h2>
              <p>Subscribe to our newsletter and be the first to know about new listings and special offers.</p>
            </div>
            <div>
              {newsDone ? (
                <div className="alert ok" style={{ margin: 0 }}>✓ You’re subscribed! Watch your inbox.</div>
              ) : (
                <form className="news-form" onSubmit={(e) => { e.preventDefault(); setNewsDone(true); }}>
                  <input type="email" required placeholder="Enter your email address" aria-label="Email address"
                    value={newsEmail} onChange={(e) => setNewsEmail(e.target.value)} />
                  <button className="btn pill" type="submit">Subscribe</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <img src="/manziliq-logo.png" alt="ManzilIQ" style={{ height: 44, marginBottom: 12, filter: 'brightness(0) invert(1)' }} />
              <p>A unified property & discovery platform. Your trusted partner in finding the perfect property.</p>
            </div>
            <div>
              <h4>Quick links</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('marketplace'); }}>Buy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('marketplace'); }}>Rent</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('price-estimator'); }}>AI Price</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('market-trends'); }}>Market trends</a>
            </div>
            <div>
              <h4>Property types</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('marketplace'); }}>Houses</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('marketplace'); }}>Plots</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('marketplace'); }}>Apartments</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('marketplace'); }}>Commercial</a>
            </div>
            <div>
              <h4>Contact us</h4>
              <p style={{ margin: 0 }}>📍 Lahore, Pakistan<br />📞 +92 300 000 0000<br />✉️ info@manziliq.pk</p>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 ManzilIQ. All rights reserved.</span>
            <span>Made with ♥ for your dream home</span>
          </div>
        </div>
      </footer>
    </>
  );
}
