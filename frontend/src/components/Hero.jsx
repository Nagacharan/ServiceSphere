import React, { useState } from 'react';
import { Search, Zap, Droplets, BookOpen, Wrench, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { name: 'Electrician', icon: Zap, color: 'var(--primary)' },
  { name: 'Plumber', icon: Droplets, color: 'var(--secondary)' },
  { name: 'Tutor', icon: BookOpen, color: 'hsl(38, 95%, 50%)' },
  { name: 'Mechanic', icon: Wrench, color: 'hsl(355, 85%, 55%)' },
  { name: 'Cleaner', icon: Sparkles, color: 'hsl(145, 80%, 40%)' }
];

export default function Hero({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: query });
  };

  return (
    <section className="fade-in" style={{
      padding: '4rem 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      background: 'radial-gradient(circle at top, hsl(var(--primary-h), var(--primary-s), 95%), transparent 60%)',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      marginBottom: '3rem',
      transition: 'background var(--transition-normal)'
    }}>
      <div style={{ maxWidth: '800px', padding: '0 1.5rem' }}>
        {/* Badge */}
        <span className="badge badge-primary" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>
          Hyperlocal Service Marketplace
        </span>

        {/* Heading */}
        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          marginBottom: '1rem',
          fontFamily: 'var(--font-heading)'
        }}>
          Your House, Sorted. <br />
          Find Trusted <span style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Local Professionals</span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          marginBottom: '2.5rem',
          maxWidth: '600px',
          margin: '0 auto 2.5rem auto'
        }}>
          Connect instantly with vetted electricians, plumbers, tutors, mechanics, and cleaners in your neighborhood. Real-time availability. Transparent reviews.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '0.75rem',
          background: 'var(--surface)',
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--surface-border)',
          maxWidth: '650px',
          width: '100%',
          margin: '0 auto 3rem auto',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, paddingLeft: '1rem' }}>
            <Search size={20} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="What service do you need today? e.g. fix leakage, electrician..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0',
                border: 'none',
                background: 'none',
                outline: 'none',
                color: 'var(--text-main)'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Search
          </button>
        </form>

        {/* Category Shortcuts */}
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Popular Categories
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSearch({ category: cat.name })}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--surface-border)',
                    background: 'var(--surface)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    borderRadius: '25%',
                    backgroundColor: `rgba(110, 68, 255, 0.08)`,
                    color: cat.color
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
