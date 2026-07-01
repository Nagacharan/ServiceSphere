import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ setView, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }
    setError('');
    setLoading(true);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          localStorage.setItem('token', data.token);
          onLoginSuccess(data.user);
          setView('dashboard');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        setError('Connection failed. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem'
    }} className="fade-in">
      <div className="card card-glass" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2.5rem'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Sign in to manage your appointments and services
          </p>
        </div>

        {/* Error Warning */}
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
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
              <div style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ border: 'none', paddingLeft: '0.25rem' }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
              <div style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ border: 'none', paddingLeft: '0.25rem' }}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button 
            onClick={() => setView('signup')} 
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
