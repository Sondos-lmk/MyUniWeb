import { Router } from 'express';
import { getAllUsers } from '../controllers/userControllers.js';
import { getUserById } from '../controllers/userControllers.js';
import { requireAuth,requireAdmin } from '../middleware/auth.js';

const router = Router();

// [REQ 1] Admin: view list of all users
router.get('/admin/users', requireAuth, requireAdmin, getAllUsers);

// [REQ 2] Admin: view a single user by ID
router.get('/:id', getUserById);

export default router;
