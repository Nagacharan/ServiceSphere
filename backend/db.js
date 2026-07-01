import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database in persistent path if it exists (/data on Render/Railway), otherwise locally
let dbPath = path.resolve(__dirname, 'servicesphere.db');
if (process.env.DATABASE_PATH) {
  dbPath = process.env.DATABASE_PATH;
} else if (fs.existsSync('/data')) {
  dbPath = '/data/servicesphere.db';
}

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Helper functions for async/await
export const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize schema and seed data
export const initDb = async () => {
  // Create tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('customer', 'provider')),
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS providers (
      user_id INTEGER PRIMARY KEY,
      category TEXT NOT NULL,
      bio TEXT,
      hourly_rate REAL NOT NULL,
      experience_years INTEGER NOT NULL,
      availability TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      service_date TEXT NOT NULL,
      service_time TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'completed', 'cancelled')) DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (provider_id) REFERENCES users(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (provider_id) REFERENCES users(id)
    )
  `);

  // Check if seeding is needed
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding database with initial data...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    // Seed Customers
    const customer1 = await dbRun(
      'INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      ['Alice Smith', 'alice@example.com', defaultPasswordHash, 'customer', '555-0101', '123 Maple St, Metro Heights']
    );
    const customer2 = await dbRun(
      'INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      ['Bob Jones', 'bob@example.com', defaultPasswordHash, 'customer', '555-0102', '456 Oak Rd, Pine Hill']
    );

    // Seed Providers
    const providersData = [
      {
        name: 'Dave Miller',
        email: 'dave@example.com',
        role: 'provider',
        phone: '555-0201',
        address: '789 Pine Ave, Metro Heights',
        category: 'Electrician',
        bio: 'Licensed electrician with 8 years of experience. Specializing in residential repairs, rewiring, smart home installations, and safety inspections. Quick and tidy work guaranteed.',
        hourly_rate: 65.0,
        experience_years: 8,
        availability: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
      },
      {
        name: 'Eva Green',
        email: 'eva@example.com',
        role: 'provider',
        phone: '555-0202',
        address: '101 Cedar Ln, Green Valley',
        category: 'Plumber',
        bio: 'Emergency plumbing repairs, drain cleaning, pipe replacements, and water heater servicing. Available for urgent calls on weekends too. Over 6 years serving the local community.',
        hourly_rate: 75.0,
        experience_years: 6,
        availability: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
      },
      {
        name: 'Frank Wright',
        email: 'frank@example.com',
        role: 'provider',
        phone: '555-0203',
        address: '202 Elm Blvd, University District',
        category: 'Tutor',
        bio: 'High school math and physics tutor. Helping students master Calculus, Algebra, and mechanics concepts. Customized lesson plans and friendly environment.',
        hourly_rate: 40.0,
        experience_years: 4,
        availability: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun'])
      },
      {
        name: 'Grace Davis',
        email: 'grace@example.com',
        role: 'provider',
        phone: '555-0204',
        address: '303 Birch Dr, Auto Row',
        category: 'Mechanic',
        bio: 'Mobile mechanic providing basic diagnostics, brake replacements, oil changes, and minor repairs at your doorstep. Certifications in engine performance and brake systems.',
        hourly_rate: 80.0,
        experience_years: 10,
        availability: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
      },
      {
        name: 'Henry Taylor',
        email: 'henry@example.com',
        role: 'provider',
        phone: '555-0205',
        address: '404 Walnut Way, Downtown',
        category: 'Cleaner',
        bio: 'Professional eco-friendly deep cleaning for apartments and commercial spaces. Flexible schedules, fully insured, and standard cleaning equipment provided.',
        hourly_rate: 30.0,
        experience_years: 3,
        availability: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
      }
    ];

    for (const prov of providersData) {
      const result = await dbRun(
        'INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
        [prov.name, prov.email, defaultPasswordHash, prov.role, prov.phone, prov.address]
      );
      await dbRun(
        'INSERT INTO providers (user_id, category, bio, hourly_rate, experience_years, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [result.id, prov.category, prov.bio, prov.hourly_rate, prov.experience_years, prov.availability]
      );
    }

    // Seed Bookings and Reviews
    // Alice booked Dave (Electrician) in the past, completed, and reviewed
    const booking1 = await dbRun(
      `INSERT INTO bookings (customer_id, provider_id, service_date, service_time, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-5 days'))`,
      [customer1.id, 3, '2026-06-25', '10:00 AM', 'completed', 'Fix flickering lights in the kitchen']
    );
    await dbRun(
      'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, review_text) VALUES (?, ?, ?, ?, ?)',
      [booking1.id, customer1.id, 3, 5, 'Dave was prompt, professional, and fixed the issue quickly! Highly recommended.']
    );

    // Bob booked Eva (Plumber) in the past, completed, and reviewed
    const booking2 = await dbRun(
      `INSERT INTO bookings (customer_id, provider_id, service_date, service_time, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-3 days'))`,
      [customer2.id, 4, '2026-06-27', '02:00 PM', 'completed', 'Clogged sink drain']
    );
    await dbRun(
      'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, review_text) VALUES (?, ?, ?, ?, ?)',
      [booking2.id, customer2.id, 4, 4, 'Eva got the drain cleared. Fair price, solid service.']
    );

    // Alice has a pending booking with Frank (Tutor) in the future
    await dbRun(
      `INSERT INTO bookings (customer_id, provider_id, service_date, service_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer1.id, 5, '2026-07-05', '04:00 PM', 'pending', 'Need tutoring for upcoming Physics exam']
    );

    // Bob has an accepted booking with Grace (Mechanic) in the future
    await dbRun(
      `INSERT INTO bookings (customer_id, provider_id, service_date, service_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer2.id, 6, '2026-07-02', '11:00 AM', 'accepted', 'Change front brake pads']
    );

    console.log('Database seeded successfully.');
  }
};

export default db;
