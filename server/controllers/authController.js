import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d'; // 7 days
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email },
      message: 'Signup successful'
    });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed: ' + err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      message: 'Login successful'
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the JWT token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed: ' + err.message });
  }
};

export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
}; 