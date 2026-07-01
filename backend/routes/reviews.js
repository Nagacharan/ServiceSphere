import express from 'express';
import { authenticateToken } from './auth.js';
import { dbRun, dbGet } from '../db.js';

const router = express.Router();

// Submit a review for a completed booking
router.post('/', authenticateToken, async (req, res) => {
  const { bookingId, rating, reviewText } = req.body;
  const customerId = req.user.id;

  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can submit reviews' });
  }

  if (!bookingId || !rating) {
    return res.status(400).json({ error: 'Booking ID and rating (1-5) are required' });
  }

  const numericRating = parseInt(rating);
  if (numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if the booking exists, belongs to this customer, and is completed
    const booking = await dbGet(
      'SELECT id, provider_id, customer_id, status FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.customer_id !== customerId) {
      return res.status(403).json({ error: 'Access denied: this booking does not belong to you' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'You can only review completed services' });
    }

    // Check if a review already exists for this booking
    const existingReview = await dbGet('SELECT id FROM reviews WHERE booking_id = ?', [bookingId]);
    if (existingReview) {
      return res.status(400).json({ error: 'A review has already been submitted for this booking' });
    }

    // Insert review
    await dbRun(
      'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, review_text) VALUES (?, ?, ?, ?, ?)',
      [bookingId, customerId, booking.provider_id, numericRating, reviewText || '']
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
