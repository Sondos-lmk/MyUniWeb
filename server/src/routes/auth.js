// routes/auth.js
import express from 'express';
import { register, login,me, verifyEmail } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.get('/me', requireAuth, me);


export default router;
