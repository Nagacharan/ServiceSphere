import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbRun, dbGet } from '../db.js';

const router = express.Router();
const JWT_SECRET = 'servicesphere_super_secret_key_2026';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbGet('SELECT id, name, email, role, phone, address FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Register endpoint
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, address, category, bio, hourlyRate, experienceYears, availability } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  if (role !== 'customer' && role !== 'provider') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await dbRun(
      'INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, phone || '', address || '']
    );
    const userId = userResult.id;

    // If provider, create the provider sub-profile
    if (role === 'provider') {
      await dbRun(
        'INSERT INTO providers (user_id, category, bio, hourly_rate, experience_years, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userId,
          category || 'General',
          bio || '',
          hourlyRate ? parseFloat(hourlyRate) : 0,
          experienceYears ? parseInt(experienceYears) : 0,
          JSON.stringify(availability || [])
        ]
      );
    }

    // Generate JWT token
    const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { id: userId, name, email, role, phone, address }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Database error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error during login' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let profileData = { ...req.user };

    if (req.user.role === 'provider') {
      const providerInfo = await dbGet('SELECT * FROM providers WHERE user_id = ?', [req.user.id]);
      if (providerInfo) {
        profileData.providerDetails = {
          ...providerInfo,
          availability: JSON.parse(providerInfo.availability || '[]')
        };
      }
    }

    res.json(profileData);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Update profile endpoint
router.put('/profile/update', authenticateToken, async (req, res) => {
  const { name, phone, address, category, bio, hourlyRate, experienceYears, availability } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Update main user details
    await dbRun(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || '', address || '', req.user.id]
    );

    // If provider, update provider details
    if (req.user.role === 'provider') {
      await dbRun(
        `UPDATE providers 
         SET category = ?, bio = ?, hourly_rate = ?, experience_years = ?, availability = ? 
         WHERE user_id = ?`,
        [
          category || 'General',
          bio || '',
          hourlyRate ? parseFloat(hourlyRate) : 0,
          experienceYears ? parseInt(experienceYears) : 0,
          JSON.stringify(availability || []),
          req.user.id
        ]
      );
    }

    // Retrieve updated profile
    const updatedUser = await dbGet('SELECT id, name, email, role, phone, address FROM users WHERE id = ?', [req.user.id]);
    let responseData = { ...updatedUser };

    if (req.user.role === 'provider') {
      const providerInfo = await dbGet('SELECT * FROM providers WHERE user_id = ?', [req.user.id]);
      if (providerInfo) {
        responseData.providerDetails = {
          ...providerInfo,
          availability: JSON.parse(providerInfo.availability || '[]')
        };
      }
    }

    res.json({ message: 'Profile updated successfully', user: responseData });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
