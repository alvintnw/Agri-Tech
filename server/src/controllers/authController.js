const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/schemas');

function tokenFor(user) {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'development-secret')) {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  return jwt.sign({ id: String(user._id || user.id), name: user.name, role: user.role }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' });
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email is already registered.' });
    const user = await User.create({ name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role: role === 'admin' ? 'farmer' : (role || 'farmer') });
    res.status(201).json({ user, token: tokenFor(user) });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOneRaw({ email: String(email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ user: { id: String(user._id || user.id), name: user.name, email: user.email, role: user.role }, token: tokenFor(user) });
  } catch (error) { next(error); }
}

module.exports = { register, login };
