// backend/server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// In-memory "database" for quick testing (replace with PostgreSQL later)
const users = [];

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phoneNumber, fullName, password, role, vehicleType, vehicleReg, idNumber } = req.body;

    // Check if user already exists
    if (users.find(u => u.phoneNumber === phoneNumber)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      phoneNumber,
      fullName,
      password: hashedPassword,
      role,
      ...(role === 'transporter' && { vehicleType, vehicleReg, idNumber }),
    };
    users.push(newUser);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, phoneNumber: newUser.phoneNumber },
      process.env.JWT_SECRET || 'your_secret_key_change_this',
      { expiresIn: '7d' }
    );

    // Set HTTP‑only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // set to true if using HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return user info (without password)
    res.status(201).json({
      user: {
        id: newUser.id,
        phoneNumber: newUser.phoneNumber,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint (for completeness)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = users.find(u => u.phoneNumber === phoneNumber);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || 'your_secret_key_change_this',
      { expiresIn: '7d' }
    );
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, phoneNumber: user.phoneNumber, fullName: user.fullName, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_change_this');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ id: user.id, phoneNumber: user.phoneNumber, fullName: user.fullName, role: user.role });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});