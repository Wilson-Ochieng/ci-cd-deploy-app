// backend/server.js (PostgreSQL version)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'supersecretkey123';

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// ========== AUTH ==========
app.post('/api/auth/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { phoneNumber, fullName, password, role, vehicleType, vehicleReg, idNumber, adminSecret } = req.body;
    const existing = await client.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
    if (existing.rows.length) return res.status(400).json({ message: 'User already exists' });

    let finalRole = role;
    if (role === 'admin' && adminSecret !== ADMIN_SECRET) return res.status(403).json({ message: 'Invalid admin secret' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (phone_number, full_name, role, password_hash, vehicle_type, vehicle_registration, id_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, phone_number, full_name, role`,
      [phoneNumber, fullName, finalRole, hashedPassword, vehicleType || null, vehicleReg || null, idNumber || null]
    );
    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id, role: newUser.role, phoneNumber: newUser.phone_number }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user: { id: newUser.id, phoneNumber: newUser.phone_number, fullName: newUser.full_name, role: newUser.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally { client.release(); }
});

app.post('/api/auth/login', async (req, res) => {
  const client = await pool.connect();
  try {
    const { phoneNumber, password } = req.body;
    const result = await client.query('SELECT id, phone_number, full_name, role, password_hash FROM users WHERE phone_number = $1', [phoneNumber]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, phoneNumber: user.phone_number }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, phoneNumber: user.phone_number, fullName: user.full_name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally { client.release(); }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, phone_number, full_name, role FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(401).json({ message: 'User not found' });
    const u = result.rows[0];
    res.json({ id: u.id, phoneNumber: u.phone_number, fullName: u.full_name, role: u.role });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
  finally { client.release(); }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// ========== ADMIN ==========
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, phone_number, full_name, role, verified FROM users');
    const users = result.rows.map(u => ({ id: u.id, phoneNumber: u.phone_number, fullName: u.full_name, role: u.role, verified: u.verified }));
    res.json(users);
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.get('/api/admin/loads', requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM loads');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.get('/api/admin/trips', requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM trips');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.post('/api/admin/verify-transporter/:userId', requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = parseInt(req.params.userId);
    const result = await client.query('UPDATE users SET verified = true WHERE id = $1 AND role = $2 RETURNING id', [userId, 'transporter']);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Transporter not found' });
    res.json({ message: 'Transporter verified' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const totalUsers = (await client.query('SELECT COUNT(*) FROM users')).rows[0].count;
    const totalShippers = (await client.query("SELECT COUNT(*) FROM users WHERE role = 'shipper'")).rows[0].count;
    const totalTransporters = (await client.query("SELECT COUNT(*) FROM users WHERE role = 'transporter'")).rows[0].count;
    const totalLoads = (await client.query('SELECT COUNT(*) FROM loads')).rows[0].count;
    const totalTrips = (await client.query('SELECT COUNT(*) FROM trips')).rows[0].count;
    res.json({ totalUsers: parseInt(totalUsers), totalShippers: parseInt(totalShippers), totalTransporters: parseInt(totalTransporters), totalLoads: parseInt(totalLoads), totalTrips: parseInt(totalTrips) });
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

// ========== SHIPPER & TRANSPORTER ==========
app.post('/api/loads', requireAuth, async (req, res) => {
  if (req.user.role !== 'shipper') return res.status(403).json({ message: 'Only shippers can post loads' });
  const client = await pool.connect();
  try {
    const { pickup_location, dropoff_location, weight_kg, description, offered_price } = req.body;
    const result = await client.query(
      `INSERT INTO loads (shipper_id, pickup_location, dropoff_location, weight_kg, description, offered_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [req.user.id, pickup_location, dropoff_location, weight_kg, description, offered_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.get('/api/loads/my', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM loads WHERE shipper_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.get('/api/loads/available', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM loads WHERE status = 'pending'");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.post('/api/trips/accept/:loadId', requireAuth, async (req, res) => {
  if (req.user.role !== 'transporter') return res.status(403).json({ message: 'Only transporters can accept loads' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const loadId = parseInt(req.params.loadId);
    const loadResult = await client.query('SELECT * FROM loads WHERE id = $1 AND status = $2 FOR UPDATE', [loadId, 'pending']);
    if (loadResult.rowCount === 0) throw new Error('Load not available');
    const load = loadResult.rows[0];
    await client.query('UPDATE loads SET status = $1 WHERE id = $2', ['accepted', loadId]);
    const tripResult = await client.query(
      `INSERT INTO trips (load_id, transporter_id, shipper_id, agreed_price, status)
       VALUES ($1, $2, $3, $4, 'accepted') RETURNING *`,
      [loadId, req.user.id, load.shipper_id, load.offered_price]
    );
    await client.query('COMMIT');
    res.status(201).json(tripResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally { client.release(); }
});

app.get('/api/trips/my', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM trips WHERE transporter_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); } finally { client.release(); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));