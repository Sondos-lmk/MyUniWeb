import { Router } from 'express';
import { getAllUsers } from '../controllers/userControllers.js';

const router = Router();

// [REQ 1] Admin: view list of all users
router.get('/admin/users', getAllUsers);

export default router;
