import React, { useState } from 'react';
import { User, Briefcase, Mail, Lock, ShieldAlert, Award, FileText } from 'lucide-react';

export default function Signup({ setView, onSignupSuccess }) {
  const [role, setRole] = useState('customer'); // 'customer' or 'provider'
  
  // Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Provider Specific Info
  const [category, setCategory] = useState('Electrician');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDayToggle = (day) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter(d => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Name, email, and password are required.');
    }
    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role,
      phone,
      address,
      ...(role === 'provider' && {
        category,
        hourlyRate: parseFloat(hourlyRate) || 0,
        experienceYears: parseInt(experienceYears) || 0,
        bio,
        availability
      })
    };

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          localStorage.setItem('token', data.token);
          onSignupSuccess(data.user);
          setView('dashboard');
        }
      })
      .catch(err => {
        console.error('Registration error:', err);
        setError('Connection failed. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem'
    }} className="fade-in">
      <div className="card card-glass" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2.5rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Join ServiceSphere today to book or offer local services
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          backgroundColor: 'var(--surface-hover)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setRole('customer')}
            style={{
              padding: '0.6rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition-fast)',
              border: 'none',
              backgroundColor: role === 'customer' ? 'var(--surface)' : 'transparent',
              color: role === 'customer' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'customer' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <User size={16} />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            style={{
              padding: '0.6rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition-fast)',
              border: 'none',
              backgroundColor: role === 'provider' ? 'var(--surface)' : 'transparent',
              color: role === 'provider' ? 'var(--secondary)' : 'var(--text-muted)',
              boxShadow: role === 'provider' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Briefcase size={16} />
            <span>Service Provider</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'hsla(355, 85%, 55%, 0.1)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            border: '1px solid hsla(355, 85%, 55%, 0.2)',
            marginBottom: '1.25rem'
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main User Fields */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="form-input" 
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="form-input" 
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                placeholder="Min 6 characters" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="form-input" 
                required
                minLength={6}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                placeholder="555-0100" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address / Neighborhood</label>
              <input 
                type="text" 
                placeholder="e.g. Metro Heights" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="form-input"
              />
            </div>
          </div>

          {/* Provider Specific Section */}
          {role === 'provider' && (
            <div style={{
              borderTop: '1px solid var(--surface-border)',
              paddingTop: '1.5rem',
              marginTop: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }} className="fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)' }}>
                Professional Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Specialty Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="form-select"
                    required
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hourly Rate ($)</label>
                    <input 
                      type="number" 
                      placeholder="50" 
                      value={hourlyRate} 
                      onChange={(e) => setHourlyRate(e.target.value)} 
                      className="form-input" 
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience (Yrs)</label>
                    <input 
                      type="number" 
                      placeholder="4" 
                      value={experienceYears} 
                      onChange={(e) => setExperienceYears(e.target.value)} 
                      className="form-input" 
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Introduce yourself and details of your services..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weekly Availability Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const isChecked = availability.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        style={{
                          padding: '0.35rem 0.7rem',
                          fontSize: '0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: isChecked ? 'var(--secondary)' : 'var(--surface-hover)',
                          color: isChecked ? 'white' : 'var(--text-main)',
                          border: `1px solid ${isChecked ? 'var(--secondary)' : 'var(--surface-border)'}`
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', backgroundColor: role === 'provider' ? 'var(--secondary)' : 'var(--primary)' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button 
            onClick={() => setView('login')} 
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
