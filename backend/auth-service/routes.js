// backend/auth-service/routes.js
const express = require('express');
const bcrypt = require('bcryptjs');            // cross-platform
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('./model');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

/* ------------ Validation Schemas ------------ */
const passwordRule = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'symbol')
  .messages({
    'string.min': 'Password must be at least 8 characters.',
    'string.pattern.name': 'Password must include {#name} characters.',
  });

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(64).required(),
  password: passwordRule.required(),
  role: Joi.string().valid('admin', 'doctor', 'nurse', 'receptionist', 'patient').required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

/* ------------ Helpers ------------ */
function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/* ------------ Routes ------------ */

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { value, error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    const { username, password, role } = value;

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: 'Username already taken' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, password: hashed, role });

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    const { username, password } = value;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/me
router.get('/me', (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization header' });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
