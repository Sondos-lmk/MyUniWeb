// routes/auth.js
import express from 'express';
import { register, login, verifyEmail } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.get('/me', requireAuth, (req, res) => {
  // req.user comes from requireAuth middleware
  res.json({ user: req.user });
});

export default router;
