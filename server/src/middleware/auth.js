import jwt from 'jsonwebtoken';
import { User } from '../models/Users/User.js';
import { Professor } from '../models/Users/Professor.js';
import { Staff } from '../models/Users/Staff.js';
import { TA } from '../models/Users/TA.js';

// Auth middleware
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

   const userId = payload.id || payload.userId; // ✅ Support both possible token formats

  const user =
    (await User.findById(userId)) ||
    (await Professor.findById(userId)) ||
    (await Staff.findById(userId)) ||
    (await TA.findById(userId));


    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // ✅ Attach full Mongoose user object
    next();
  } catch (err) {
    console.error('Auth error:', err);
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

// Allow only Student, Staff, TA, Professor to register for gym sessions
// Allow only Student, Staff, TA, Professor to register for gym sessions
export const requireGymAttendee = (req, res, next) => {
  // Debug: see what the user object actually looks like
  console.log("GYM REGISTER ATTEMPT user =", req.user);

  // Try different possible fields (role, userType, type, etc.)
  const rawRole = req.user?.role || req.user?.userType || req.user?.type;

  if (!rawRole) {
    return res.status(403).json({ message: "Access denied" });
  }

  const role = String(rawRole).toLowerCase(); // normalize

  const allowedRoles = ["student", "staff", "ta", "professor"];

  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};



export const requireEventOfficerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'eventOfficer' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied — requires Event Officer or Admin role.' });
  }
};


// Ensure the authenticated user is a Professor
export function requireProfessor(req, res, next) {
  // requireAuth should run before this so req.user exists; otherwise block
  if (!req.user) return res.status(401).json({ message: 'Missing authentication' });

  // role stored in token payload should match the user model enum ("professor")
  if (req.user.role !== 'professor') {
    return res.status(403).json({ message: 'Forbidden: requires Professor role' });
  }

  return next();
}

// Admin-only middleware
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
  next();
}
