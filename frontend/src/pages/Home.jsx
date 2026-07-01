import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProviderCard from '../components/ProviderCard';
import { ShieldCheck, Award, ThumbsUp, ChevronRight } from 'lucide-react';

export default function Home({ setView, onSearch, currentUserId, onBook }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured providers (highly rated)
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        // Sort by average rating and review count, select top 3
        const sorted = [...data]
          .sort((a, b) => b.average_rating - a.average_rating || b.review_count - a.review_count)
          .slice(0, 3);
        setFeatured(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading featured providers:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Header */}
      <Hero onSearch={onSearch} />

      {/* Main Home Sections */}
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '5rem', marginTop: '1rem' }}>
        
        {/* Value Propositions */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
              Why Choose ServiceSphere?
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              We build a marketplace centered on safety, high quality, and simplicity.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Feature 1 */}
            <div className="card" style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                height: 'fit-content'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fully Vetted Professionals</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Every provider on ServiceSphere is verified, background-checked, and rated by customers in your neighborhood.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{
                backgroundColor: 'var(--secondary-light)',
                color: 'var(--secondary)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                height: 'fit-content'
              }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Experienced Specialists</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  From complex rewiring jobs to advanced physics tutoring, filter providers by years of experience and hourly rates.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{
                backgroundColor: 'rgba(145, 80, 40, 0.1)',
                color: 'var(--warning)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                height: 'fit-content'
              }}>
                <ThumbsUp size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>100% Satisfaction Guarantee</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Our customer support team is available 24/7 to resolve disputes and ensure you receive the quality you paid for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: '2.5rem' 
          }}>
            <div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Top Service Providers
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Highly rated local pros with proven records of outstanding work.
              </p>
            </div>
            <button 
              onClick={() => setView('search')} 
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card skeleton" style={{ height: '300px' }} />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {featured.map((prov) => (
                <ProviderCard 
                  key={prov.id} 
                  provider={prov} 
                  onBook={onBook} 
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section style={{
          backgroundColor: 'var(--surface-hover)',
          borderRadius: 'var(--radius-lg)',
          padding: '3.5rem 2rem',
          border: '1px solid var(--surface-border)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '3rem', fontFamily: 'var(--font-heading)' }}>
            How ServiceSphere Works
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '3rem'
          }}>
            {/* Step 1 */}
            <div style={{ flex: '1 1 250px', maxWidth: '300px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '1.5rem'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Search Services</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Type your issue or pick a category. Filter by rate, ratings, and location to find matching pros.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ flex: '1 1 250px', maxWidth: '300px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '1.5rem'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Book a Time</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Pick an available date and time slot. Describe your request and confirm. No card required upfront.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ flex: '1 1 250px', maxWidth: '300px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-main)',
                color: 'var(--background)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '1.5rem'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Get it Done</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                The provider completes the service at your location. Confirm completion, pay them, and write a review.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
