import jwt from 'jsonwebtoken';

// Auth middleware
export function requireAuth(req, res, next) {
  console.log('🧩 requireAuth triggered');
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    console.log('✅ Auth OK for user:', payload.email);
    next();
  } catch (err) {
    console.log('❌ Invalid token:', err.message);
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
