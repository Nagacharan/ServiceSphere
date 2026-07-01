import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookingModal from './components/BookingModal';
import ReviewModal from './components/ReviewModal';

import './App.css';

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Modal states
  const [bookingProvider, setBookingProvider] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  // Check login on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Invalid session');
        })
        .then(data => {
          setUser(data);
        })
        .catch(err => {
          console.error(err);
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  // Update theme attributes on document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('home');
  };

  const handleSearchTrigger = (params) => {
    setSearchParams(params);
    setView('search');
  };

  const handleBookTrigger = (provider) => {
    if (!user) {
      alert('Please sign in to book an appointment.');
      setView('login');
      return;
    }
    if (user.role !== 'customer') {
      alert('Only customers can book service providers.');
      return;
    }
    setBookingProvider(provider);
  };

  const handleBookingSubmit = async (payload) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit booking request');
    }

    alert('Your booking request was submitted successfully! Redirecting to your bookings list.');
    setBookingProvider(null);
    setView('dashboard');
  };

  const handleReviewSubmit = async (payload) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit review');
    }

    alert('Thank you! Your review has been submitted successfully.');
    setReviewBooking(null);
    
    // Refresh user state or let Dashboard refetch bookings
    // Trigger user updates if needed
    if (user) {
      setUser({ ...user }); // trigger state reload
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        setView={setView} 
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
        {view === 'home' && (
          <Home 
            setView={setView} 
            onSearch={handleSearchTrigger} 
            currentUserId={user?.id}
            onBook={handleBookTrigger}
          />
        )}
        {view === 'search' && (
          <Search 
            searchParams={searchParams} 
            currentUserId={user?.id}
            onBook={handleBookTrigger}
          />
        )}
        {view === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            onUpdateUser={(updated) => setUser(updated)}
            onReviewClick={(booking) => setReviewBooking(booking)}
          />
        )}
        {view === 'login' && (
          <Login 
            setView={setView} 
            onLoginSuccess={(userData) => setUser(userData)}
          />
        )}
        {view === 'signup' && (
          <Signup 
            setView={setView} 
            onSignupSuccess={(userData) => setUser(userData)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        borderTop: '1px solid var(--surface-border)',
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--surface)',
        transition: 'all var(--transition-normal)'
      }}>
        <div className="container">
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>ServiceSphere Hyperlocal Service Marketplace</p>
          <p>&copy; {new Date().getFullYear()} ServiceSphere Inc. All rights reserved. Vetted local services at your doorstep.</p>
        </div>
      </footer>

      {/* Booking Modal */}
      {bookingProvider && (
        <BookingModal 
          provider={bookingProvider} 
          onClose={() => setBookingProvider(null)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal 
          booking={reviewBooking} 
          onClose={() => setReviewBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
