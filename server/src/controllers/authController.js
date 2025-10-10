import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { User } from '../models/Users/User.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'staff', 'professor', 'vendor', 'admin', 'eventOfficer').default('student')
});

export async function register(req, res, next) {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const existing = await User.findOne({ email: value.email });
    if (existing) return res.status(409).json({ message: 'Email already used' });

    const passwordHash = await bcrypt.hash(value.password, 10);
    // Use the role from request body, default to 'student' if not provided
    const user = await User.create({ 
      name: value.name, 
      email: value.email, 
      passwordHash, 
      role: value.role || 'student' 
    });
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    // Always return JSON error
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
}

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export async function login(req, res, next) {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const existing = await User.findOne({ email: value.email });
    if (!existing) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(value.password, existing.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(existing);
    res.json({ token, user: publicUser(existing) });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).lean();
    res.json({ user: user && publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch user' });
  }
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  const payload = { id: user._id.toString(), name: user.name, role: user.role || 'user' };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function publicUser(u) {
  return { id: u._id?.toString() || u.id, name: u.name, email: u.email, role: u.role || 'user' };
}
