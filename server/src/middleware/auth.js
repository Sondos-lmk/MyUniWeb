import jwt from 'jsonwebtoken';
import { User } from '../models/Users/User.js';
import { Professor } from '../models/Users/Professor.js';
import { Staff } from '../models/Users/Staff.js';
import { TA } from '../models/Users/TA.js';
import { Club } from "../models/Events/Club.js";

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
export const requireGymAttendee = (req, res, next) => {
  const allowed = ["student", "staff", "ta", "professor"];
  const role = (req.user?.role || "").toLowerCase();

  if (!req.user || !allowed.includes(role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};
// Admin-only middleware
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
  next();
}

// Under existing exports in middleware/auth.js

export function requireAcademicUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Missing authentication' });
  }

  const allowedRoles = ['student', 'staff', 'ta', 'professor'];
  if (!allowedRoles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: 'Forbidden: requires academic user (student/staff/TA/professor)' });
  }

  return next();
}


// Check if user is president OR HR of the club
// Check if user is president OR HR of the club
export async function requireClubManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Missing authentication" });
  }

  let clubId = req.params.clubId || req.body.clubId;

  // If clubId is missing (ex: reviewing an application), get it from the application
  if (!clubId && req.params.appId) {
    try {
      const application = await ClubApplication.findById(req.params.appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      clubId = application.club;
    } catch (err) {
      console.error("Error loading application:", err);
      return res.status(500).json({ message: "Server error loading application" });
    }
  }

  if (!clubId) {
    return res
      .status(400)
      .json({ message: "Missing clubId for club management" });
  }

  const club = await Club.findById(clubId);
  if (!club) {
    return res.status(404).json({ message: "Club not found" });
  }

  const userId = req.user._id.toString();
  const isPresident = club.president.toString() === userId;
  const isHr = (club.hrMembers || []).some(
    (m) => m.toString() === userId
  );

  if (!isPresident && !isHr) {
    return res.status(403).json({
      message: "Access denied — only club president or HR members can manage this club.",
    });
  }

  req.club = club; // attach the club for controller use
  next();
}


// Only president (used for managing HR team)
export async function requireClubPresident(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Missing authentication" });
  }

  const clubId = req.params.clubId || req.body.clubId;
  if (!clubId) {
    return res
      .status(400)
      .json({ message: "Missing clubId for club management" });
  }

  const club = await Club.findById(clubId);
  if (!club) {
    return res.status(404).json({ message: "Club not found" });
  }

  if (club.president.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Access denied — only the club president can do this." });
  }

  req.club = club;
  next();
}

