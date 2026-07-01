import React from 'react';
import { Sun, Moon, LogOut, User, Calendar, Briefcase } from 'lucide-react';

export default function Navbar({ user, onLogout, setView, theme, toggleTheme }) {
  return (
    <nav className="card card-glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none'
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setView('home')} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          cursor: 'pointer',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '1.5rem',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>S</span>erviceSphere
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={() => setView('home')} 
          className="btn btn-text"
          style={{ fontWeight: 500 }}
        >
          Home
        </button>
        <button 
          onClick={() => setView('search')} 
          className="btn btn-text"
          style={{ fontWeight: 500 }}
        >
          Find Services
        </button>

        {user ? (
          <>
            <button 
              onClick={() => setView('dashboard')} 
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {user.role === 'provider' ? (
                <>
                  <Briefcase size={16} />
                  <span>Provider Panel</span>
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  <span>My Bookings</span>
                </>
              )}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</span>
                <span className={`badge ${user.role === 'provider' ? 'badge-secondary' : 'badge-primary'}`} style={{ fontSize: '0.65rem', padding: '0.05rem 0.4rem' }}>
                  {user.role}
                </span>
              </div>
              <button 
                onClick={onLogout} 
                className="btn btn-text btn-danger"
                style={{ padding: '0.5rem', borderRadius: '50%' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--surface-border)' }}>
            <button onClick={() => setView('login')} className="btn btn-text" style={{ fontWeight: 600 }}>
              Sign In
            </button>
            <button onClick={() => setView('signup')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Sign Up
            </button>
          </div>
        )}

        {/* Theme Switcher */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-text" 
          style={{ 
            padding: '0.5rem', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface-hover)',
            color: 'var(--text-main)',
            border: '1px solid var(--surface-border)'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}
