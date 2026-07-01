import express from 'express';
import { dbAll, dbGet } from '../db.js';

const router = express.Router();

// Get list of all providers with optional search/filtering
router.get('/', async (req, res) => {
  const { category, search, maxRate, minRating } = req.query;

  let query = `
    SELECT 
      u.id, u.name, u.email, u.phone, u.address,
      p.category, p.bio, p.hourly_rate, p.experience_years, p.availability,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(r.id) AS review_count
    FROM users u
    JOIN providers p ON u.id = p.user_id
    LEFT JOIN reviews r ON u.id = r.provider_id
  `;

  const whereClauses = [];
  const params = [];

  if (category) {
    whereClauses.push('p.category = ?');
    params.push(category);
  }

  if (maxRate) {
    whereClauses.push('p.hourly_rate <= ?');
    params.push(parseFloat(maxRate));
  }

  if (search) {
    whereClauses.push('(u.name LIKE ? OR p.bio LIKE ? OR p.category LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ' GROUP BY u.id';

  if (minRating) {
    query += ' HAVING average_rating >= ?';
    params.push(parseFloat(minRating));
  }

  try {
    const rawProviders = await dbAll(query, params);
    
    // Parse availability JSON string
    const providers = rawProviders.map((prov) => ({
      ...prov,
      availability: JSON.parse(prov.availability || '[]'),
      average_rating: parseFloat(prov.average_rating.toFixed(1))
    }));

    res.json(providers);
  } catch (err) {
    console.error('Error fetching providers:', err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get unique categories list
router.get('/categories', async (req, res) => {
  try {
    const rows = await dbAll('SELECT DISTINCT category FROM providers ORDER BY category ASC');
    const categories = rows.map(r => r.category);
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single provider details by user_id, including reviews
router.get('/:id', async (req, res) => {
  const providerId = parseInt(req.params.id);

  try {
    // Fetch provider user details & sub-profile
    const provider = await dbGet(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address,
        p.category, p.bio, p.hourly_rate, p.experience_years, p.availability,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS review_count
      FROM users u
      JOIN providers p ON u.id = p.user_id
      LEFT JOIN reviews r ON u.id = r.provider_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [providerId]);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    provider.availability = JSON.parse(provider.availability || '[]');
    provider.average_rating = parseFloat(provider.average_rating.toFixed(1));

    // Fetch reviews for this provider
    const reviews = await dbAll(`
      SELECT r.id, r.rating, r.review_text, r.created_at, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.provider_id = ?
      ORDER BY r.created_at DESC
    `, [providerId]);

    res.json({
      ...provider,
      reviews
    });
  } catch (err) {
    console.error('Error fetching provider detail:', err);
    res.status(500).json({ error: 'Failed to fetch provider details' });
  }
});

export default router;
