import express from 'express';
import { authenticateToken } from './auth.js';
import { dbRun, dbAll, dbGet } from '../db.js';

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  const { providerId, serviceDate, serviceTime, notes } = req.body;
  const customerId = req.user.id;

  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can book services' });
  }

  if (!providerId || !serviceDate || !serviceTime) {
    return res.status(400).json({ error: 'Provider ID, date, and time slot are required' });
  }

  try {
    // Verify provider exists
    const provider = await dbGet('SELECT user_id FROM providers WHERE user_id = ?', [providerId]);
    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Insert booking
    const result = await dbRun(
      `INSERT INTO bookings (customer_id, provider_id, service_date, service_time, status, notes)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [customerId, providerId, serviceDate, serviceTime, notes || '']
    );

    res.status(201).json({
      message: 'Booking request created successfully',
      bookingId: result.id
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Retrieve customer's bookings
router.get('/customer', authenticateToken, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied: not a customer' });
  }

  try {
    const bookings = await dbAll(`
      SELECT 
        b.id, b.service_date, b.service_time, b.status, b.notes, b.created_at,
        u.id as provider_id, u.name as provider_name, u.phone as provider_phone, u.address as provider_address,
        p.category as provider_category,
        r.rating as review_rating, r.review_text as review_text
      FROM bookings b
      JOIN users u ON b.provider_id = u.id
      JOIN providers p ON b.provider_id = p.user_id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE b.customer_id = ?
      ORDER BY b.service_date DESC, b.service_time DESC
    `, [req.user.id]);

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching customer bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Retrieve provider's bookings
router.get('/provider', authenticateToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Access denied: not a provider' });
  }

  try {
    const bookings = await dbAll(`
      SELECT 
        b.id, b.service_date, b.service_time, b.status, b.notes, b.created_at,
        u.id as customer_id, u.name as customer_name, u.phone as customer_phone, u.address as customer_address,
        r.rating as review_rating, r.review_text as review_text
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE b.provider_id = ?
      ORDER BY b.service_date DESC, b.service_time DESC
    `, [req.user.id]);

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching provider bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.put('/:id/status', authenticateToken, async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { status } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  const validStatuses = ['accepted', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status update request' });
  }

  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Authorization checks
    if (userRole === 'customer') {
      // Customer can only cancel their own booking
      if (booking.customer_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ error: 'Customers can only cancel bookings' });
      }
    } else if (userRole === 'provider') {
      // Provider can accept, complete, or cancel their own booking
      if (booking.provider_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Perform state update
    await dbRun('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);

    res.json({ message: `Booking status updated to ${status}` });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
