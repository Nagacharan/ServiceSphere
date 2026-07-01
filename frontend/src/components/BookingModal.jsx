import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, X, ShieldAlert } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', 
  '03:00 PM', '04:00 PM', '05:00 PM'
];

export default function BookingModal({ provider, onClose, onSubmit }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return setError('Please select a date');
    if (!time) return setError('Please select a preferred time slot');
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        providerId: provider.id,
        serviceDate: date,
        serviceTime: time,
        notes
      });
    } catch (err) {
      setError(err.message || 'Failed to submit booking');
      setSubmitting(false);
    }
  };

  // Get tomorrow's date in YYYY-MM-DD format as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
        maxWidth: '500px',
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

        {/* Modal Title */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-heading)'
        }}>
          Book Appointment
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Scheduling with <strong>{provider.name}</strong> ({provider.category}) at <strong>${provider.hourly_rate}/hr</strong>
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
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Service Date */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              <span>Select Date</span>
            </label>
            <input 
              type="date" 
              min={minDate} 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="form-input" 
              required
            />
          </div>

          {/* Service Time Slot */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--secondary)' }} />
              <span>Preferred Time Slot</span>
            </label>
            <select 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              className="form-select" 
              required
            >
              <option value="">-- Choose a Slot --</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Booking Notes */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
              <span>Describe Your Requirements</span>
            </label>
            <textarea 
              rows="3" 
              placeholder="Detail the issue or request (e.g., 'Kitchen sink drain is clogged', 'Help with high school trigonometry')"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Pricing Estimation Warning */}
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--surface-hover)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--surface-border)',
            marginBottom: '1.5rem'
          }}>
            Estimates are calculated by the provider on-site based on the hourly rate of <strong>${provider.hourly_rate}/hour</strong>. No payments are charged immediately.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
