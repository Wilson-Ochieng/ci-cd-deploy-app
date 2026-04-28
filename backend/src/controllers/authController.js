// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  const { phoneNumber, fullName, role, vehicleType, vehicleReg, idNumber } = req.body;
// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  const { phoneNumber, fullName, role, vehicleType, vehicleReg, idNumber } = req.body;

  try {
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
    if (existing.rows.length) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password (you need to add password field to your schema)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (phone_number, full_name, role, vehicle_type, vehicle_registration, id_number, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, phone_number, full_name, role`,
      [phoneNumber, fullName, role, vehicleType, vehicleReg, idNumber, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user: { id: user.id, phoneNumber: user.phone_number, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, phone_number, full_name, role, password_hash FROM users WHERE phone_number = $1',
      [phoneNumber]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user.id, phoneNumber: user.phone_number, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, phone_number, full_name, role, rating, total_trips FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, logout, getMe };
  try {
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
    if (existing.rows.length) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password (you need to add password field to your schema)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (phone_number, full_name, role, vehicle_type, vehicle_registration, id_number, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, phone_number, full_name, role`,
      [phoneNumber, fullName, role, vehicleType, vehicleReg, idNumber, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user: { id: user.id, phoneNumber: user.phone_number, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, phone_number, full_name, role, password_hash FROM users WHERE phone_number = $1',
      [phoneNumber]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user.id, phoneNumber: user.phone_number, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, phone_number, full_name, role, rating, total_trips FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, logout, getMe };