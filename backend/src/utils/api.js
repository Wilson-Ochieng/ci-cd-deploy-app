// backend/src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const loadRoutes = require('./routes/loadRoutes');
const tripRoutes = require('./routes/tripRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // or '*' for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true // allow cookies
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/trips', tripRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;