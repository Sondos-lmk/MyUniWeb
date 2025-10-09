import jwt from 'jsonwebtoken';
import { User } from '../models/Users/User.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' '); // "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Ensure the authenticated user is an Events Officer
export function requireEventOfficer(req, res, next) {
  // requireAuth should run before this so req.user exists; otherwise block
  if (!req.user) return res.status(401).json({ message: 'Missing authentication' });

  // role stored in token payload should match the user model enum ("eventOfficer")
  if (req.user.role !== 'eventOfficer') {
    return res.status(403).json({ message: 'Forbidden: requires Events Officer role' });
  }

  return next();
}


