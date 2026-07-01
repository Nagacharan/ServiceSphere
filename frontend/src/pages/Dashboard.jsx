import React, { useEffect, useState } from 'react';
import { Calendar, Clock, DollarSign, Briefcase, FileText, CheckCircle2, XCircle, User, Star, Plus } from 'lucide-react';

export default function Dashboard({ user, onUpdateUser, onReviewClick }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'profile'

  // Provider profile states
  const [profileName, setProfileName] = useState(user.name || '');
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileAddress, setProfileAddress] = useState(user.address || '');
  const [category, setCategory] = useState(user.providerDetails?.category || '');
  const [bio, setBio] = useState(user.providerDetails?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(user.providerDetails?.hourly_rate || 0);
  const [experienceYears, setExperienceYears] = useState(user.providerDetails?.experience_years || 0);
  const [availability, setAvailability] = useState(user.providerDetails?.availability || []);

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const fetchBookings = () => {
    setLoading(true);
    const endpoint = user.role === 'provider' ? '/api/bookings/provider' : '/api/bookings/customer';
    
    fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Handle booking status updates (Accept, Complete, Cancel)
  const handleUpdateStatus = (bookingId, newStatus) => {
    fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          // Refetch bookings to refresh dashboard
          fetchBookings();
        }
      })
      .catch(err => console.error('Error updating status:', err));
  };

  // Availability checkbox handler
  const handleDayToggle = (day) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter(d => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  // Submit profile details update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage('');

    const payload = {
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      category,
      bio,
      hourlyRate,
      experienceYears,
      availability
    };

    fetch('/api/auth/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setUpdatingProfile(false);
        if (data.error) {
          setProfileMessage(`Error: ${data.error}`);
        } else {
          setProfileMessage('Profile updated successfully!');
          onUpdateUser(data.user);
        }
      })
      .catch(err => {
        console.error('Profile update error:', err);
        setUpdatingProfile(false);
        setProfileMessage('Failed to update profile.');
      });
  };

  // Provider statistics calculations
  const calculateStats = () => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const active = bookings.filter(b => b.status === 'accepted').length;

    // Estimate: assume average 3 hours per completed booking
    const rate = user.providerDetails?.hourly_rate || 50;
    const estimatedEarnings = completed * rate * 3;

    return { total, completed, pending, active, estimatedEarnings };
  };

  const stats = user.role === 'provider' ? calculateStats() : null;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
            {user.role === 'provider' ? 'Provider Dashboard' : 'Customer Area'}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Welcome back, {user.name}
          </h1>
        </div>

        {/* Tab Selector Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--surface-hover)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
          <button 
            onClick={() => setActiveTab('bookings')} 
            className="btn btn-text"
            style={{ 
              fontSize: '0.9rem', 
              padding: '0.5rem 1rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'bookings' ? 'var(--surface)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              boxShadow: activeTab === 'bookings' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            My Bookings
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className="btn btn-text"
            style={{ 
              fontSize: '0.9rem', 
              padding: '0.5rem 1rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'profile' ? 'var(--surface)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Settings & Profile
          </button>
        </div>
      </div>

      {/* Provider Quick Stats Banner */}
      {user.role === 'provider' && activeTab === 'bookings' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Card 1: Completed */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--success)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Completed Jobs</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.completed}</span>
            </div>
          </div>
          {/* Card 2: Active / Pending */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Active / Pending</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.active + stats.pending}</span>
            </div>
          </div>
          {/* Card 3: Est. Earnings */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Earnings</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>${stats.estimatedEarnings}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Panel Content */}
      <div className="fade-in">
        {activeTab === 'bookings' ? (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Your Appointments</h2>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2].map(i => <div key={i} className="card skeleton" style={{ height: '120px' }} />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--surface-border)' }}>
                <Calendar size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Bookings Yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {user.role === 'provider' 
                    ? "You haven't received any booking requests yet. Make sure your profile details are updated!" 
                    : "You haven't booked any service providers yet. Browse local listings to get started!"}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {bookings.map((booking) => (
                  <div key={booking.id} className="card" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.5rem',
                    borderLeft: `4px solid ${
                      booking.status === 'completed' ? 'var(--success)' :
                      booking.status === 'accepted' ? 'var(--primary)' :
                      booking.status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                    }`
                  }}>
                    {/* Booking core details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 350px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                          {user.role === 'provider' ? booking.customer_name : booking.provider_name}
                        </span>
                        {user.role === 'customer' && (
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                            {booking.provider_category}
                          </span>
                        )}
                        <span className={`badge ${
                          booking.status === 'completed' ? 'badge-success' :
                          booking.status === 'accepted' ? 'badge-primary' :
                          booking.status === 'pending' ? 'badge-warning' : 'badge-danger'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {booking.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} />
                          <span>{booking.service_date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={14} />
                          <span>{booking.service_time}</span>
                        </div>
                        <span style={{ borderLeft: '1px solid var(--surface-border)', paddingLeft: '0.5rem' }}>
                          Phone: {user.role === 'provider' ? booking.customer_phone : booking.provider_phone}
                        </span>
                      </div>

                      {booking.notes && (
                        <p style={{ fontSize: '0.85rem', background: 'var(--surface-hover)', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '2px solid var(--text-muted)' }}>
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}

                      {/* Display review details if left */}
                      {booking.review_rating && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.75rem',
                          backgroundColor: 'var(--primary-light)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', marginBottom: '0.25rem' }}>
                            <Star size={14} fill="currentColor" />
                            <strong style={{ color: 'var(--text-main)' }}>{booking.review_rating} Stars Given</strong>
                          </div>
                          <p style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>"{booking.review_text}"</p>
                        </div>
                      )}
                    </div>

                    {/* Booking actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {/* Provider Actions */}
                      {user.role === 'provider' && booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'accepted')} 
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')} 
                            className="btn btn-outline btn-danger"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: '1px solid var(--danger)', background: 'none' }}
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {user.role === 'provider' && booking.status === 'accepted' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'completed')} 
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            Complete Job
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')} 
                            className="btn btn-text btn-danger"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Customer Actions */}
                      {user.role === 'customer' && booking.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')} 
                          className="btn btn-outline btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: '1px solid var(--danger)', background: 'none' }}
                        >
                          Cancel Booking
                        </button>
                      )}

                      {user.role === 'customer' && booking.status === 'completed' && !booking.review_rating && (
                        <button 
                          onClick={() => onReviewClick(booking)} 
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          Leave a Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Profile / Settings Tab */
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }} className="card">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} style={{ color: 'var(--primary)' }} />
                <span>Account Information</span>
              </h2>

              {profileMessage && (
                <div className={`badge ${profileMessage.startsWith('Error') ? 'badge-danger' : 'badge-success'}`} style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', display: 'block' }}>
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      className="form-input" 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)} 
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    value={profileAddress} 
                    onChange={(e) => setProfileAddress(e.target.value)} 
                    className="form-input"
                  />
                </div>

                {/* Additional Provider details if logged in as provider */}
                {user.role === 'provider' && (
                  <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Briefcase size={18} style={{ color: 'var(--secondary)' }} />
                      <span>Professional Listing Configuration</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Service Category</label>
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
                            value={hourlyRate} 
                            onChange={(e) => setHourlyRate(e.target.value)} 
                            className="form-input" 
                            required 
                            min="1"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Experience (Years)</label>
                          <input 
                            type="number" 
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
                      <label className="form-label">Biography / Description</label>
                      <textarea 
                        rows="4" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        className="form-textarea"
                        placeholder="Describe your credentials, services offered, and specialized skills..."
                      />
                    </div>

                    {/* Availability selector */}
                    <div className="form-group">
                      <label className="form-label">Weekly Availability (Days)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const isChecked = availability.includes(day);
                          return (
                            <button
                              type="button"
                              key={day}
                              onClick={() => handleDayToggle(day)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                backgroundColor: isChecked ? 'var(--primary)' : 'var(--surface-hover)',
                                color: isChecked ? 'white' : 'var(--text-main)',
                                border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--surface-border)'}`
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
