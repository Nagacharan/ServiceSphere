import React, { useEffect, useState } from 'react';
import ProviderCard from '../components/ProviderCard';
import { Search as SearchIcon, Filter, SlidersHorizontal, RefreshCcw, Star } from 'lucide-react';

export default function Search({ searchParams, onBook, currentUserId }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState(searchParams?.category || '');
  const [search, setSearch] = useState(searchParams?.search || '');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');

  // Categories list from DB
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    // Fetch categories list
    fetch('/api/providers/categories')
      .then(res => res.json())
      .then(data => setCategoriesList(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Update component state if props change (e.g., from home page redirects)
  useEffect(() => {
    if (searchParams) {
      if (searchParams.category !== undefined) setCategory(searchParams.category);
      if (searchParams.search !== undefined) setSearch(searchParams.search);
    }
  }, [searchParams]);

  // Fetch filtered providers
  const fetchProviders = () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    if (maxRate) queryParams.append('maxRate', maxRate);
    if (minRating) queryParams.append('minRating', minRating);

    fetch(`/api/providers?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProviders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching providers:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProviders();
  }, [category, maxRate, minRating]); // Refetch automatically on dropdown/input changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleReset = () => {
    setCategory('');
    setSearch('');
    setMaxRate('');
    setMinRating('');
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Left Side: Filter Sidebar */}
        <aside style={{
          flex: '1 1 280px',
          maxWidth: '320px',
          height: 'fit-content'
        }} className="card card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Filters</h3>
            </div>
            <button 
              onClick={handleReset} 
              className="btn btn-text"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RefreshCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Keywords Search */}
            <div className="form-group">
              <label className="form-label">Search Keywords</label>
              <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                <input 
                  type="text" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="e.g. plumber, Dave, repair" 
                  style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', border: 'none', background: 'none' }}
                />
                <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-hover)' }}>
                  <SearchIcon size={16} />
                </button>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Max Hourly Rate */}
            <div className="form-group">
              <label className="form-label">Max Price: {maxRate ? `$${maxRate}/hr` : 'Any'}</label>
              <input 
                type="range" 
                min="10" 
                max="120" 
                step="5"
                value={maxRate || '120'} 
                onChange={(e) => setMaxRate(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>$10/hr</span>
                <span>$120/hr</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="form-group">
              <label className="form-label">Minimum Rating</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { label: 'Any Rating', value: '' },
                  { label: '4.5+ Stars', value: '4.5' },
                  { label: '4.0+ Stars', value: '4.0' },
                  { label: '3.5+ Stars', value: '3.5' }
                ].map((opt) => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="minRating" 
                      value={opt.value} 
                      checked={minRating === opt.value} 
                      onChange={() => setMinRating(opt.value)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </aside>

        {/* Right Side: Main Listing Grid */}
        <main style={{ flex: '1 1 500px' }}>
          {/* Header summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {loading ? 'Finding service providers...' : `${providers.length} matching specialists`}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <SlidersHorizontal size={14} />
              <span>Sorted by Rating</span>
            </div>
          </div>

          {/* Grid list */}
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card skeleton" style={{ height: '280px' }} />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="card" style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              border: '1px dashed var(--surface-border)',
              backgroundColor: 'var(--surface-hover)'
            }}>
              <Star size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Professionals Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                Try relaxing your search terms or expanding your filter categories to find more results in your area.
              </p>
              <button onClick={handleReset} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {providers.map((prov) => (
                <ProviderCard 
                  key={prov.id} 
                  provider={prov} 
                  onBook={onBook} 
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
