import React, { useState } from 'react';
import { Star, X, MessageSquare, AlertTriangle } from 'lucide-react';

export default function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      return setError('Rating must be between 1 and 5 stars');
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        bookingId: booking.id,
        rating,
        reviewText
      });
    } catch (err) {
      setError(err.message || 'Failed to submit review');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="card fade-in" style={{
        maxWidth: '450px',
        width: '100%',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--surface-border)',
        backgroundColor: 'var(--surface)',
        padding: '2rem'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-hover)',
            color: 'var(--text-muted)'
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-heading)'
        }}>
          Leave Feedback
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Rate your experience with <strong>{booking.provider_name}</strong> for the booking on {booking.service_date}.
        </p>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'hsla(355, 85%, 55%, 0.1)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            border: '1px solid hsla(355, 85%, 55%, 0.2)'
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Selector */}
          <div className="form-group" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="form-label" style={{ marginBottom: '0.25rem' }}>Rating</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  type="button"
                  key={starValue}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    cursor: 'pointer',
                    color: starValue <= (hoverRating || rating) ? 'var(--warning)' : 'var(--surface-border)',
                    transition: 'color var(--transition-fast)'
                  }}
                >
                  <Star size={36} fill={starValue <= (hoverRating || rating) ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--text-muted)' }}>
              {rating === 5 && 'Excellent - 5 Stars'}
              {rating === 4 && 'Good - 4 Stars'}
              {rating === 3 && 'Average - 3 Stars'}
              {rating === 2 && 'Poor - 2 Stars'}
              {rating === 1 && 'Terrible - 1 Star'}
            </span>
          </div>

          {/* Feedback text */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
              <span>Review Details</span>
            </label>
            <textarea 
              rows="4" 
              placeholder="What did you like or dislike? Sharing details helps both the professional and other customers."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
