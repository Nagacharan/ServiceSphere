import React from 'react';
import { Star, Shield, Award, Clock } from 'lucide-react';

export default function ProviderCard({ provider, onBook, currentUserId }) {
  const isSelf = currentUserId === provider.id;

  return (
    <div className="card card-hover fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div>
        {/* Header: Name and Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{provider.name}</h3>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              {provider.category}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${provider.hourly_rate}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              per hour
            </span>
          </div>
        </div>

        {/* Rating and Reviews */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--warning)', gap: '0.1rem' }}>
            <Star size={16} fill="currentColor" />
            <span style={{ fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.15rem' }}>
              {provider.average_rating > 0 ? provider.average_rating : 'New'}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>
            ({provider.review_count} {provider.review_count === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Bio */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {provider.bio || 'No biography details provided.'}
        </p>

        {/* Details: Experience and Availability */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.75rem',
          background: 'var(--surface-hover)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={16} style={{ color: 'var(--secondary)' }} />
            <span><strong>{provider.experience_years} Years</strong> Experience</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--primary)', marginTop: '0.1rem' }} />
            <div>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>Available Days:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {provider.availability && provider.availability.length > 0 ? (
                  provider.availability.map(day => (
                    <span 
                      key={day} 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.1rem 0.4rem', 
                        background: 'var(--surface)', 
                        border: '1px solid var(--surface-border)',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}
                    >
                      {day}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Contact for availability</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        {isSelf ? (
          <button 
            disabled 
            className="btn btn-outline" 
            style={{ width: '100%', cursor: 'not-allowed', opacity: 0.6 }}
          >
            Your Profile
          </button>
        ) : (
          <button 
            onClick={() => onBook(provider)} 
            className="btn btn-primary" 
            style={{ width: '100%' }}
          >
            Book Appointment
          </button>
        )}
      </div>
    </div>
  );
}
