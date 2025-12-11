import express from 'express';
import { register, login, me, verifyEmail } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { getUserClubRoles } from "../middleware/auth.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';


const router = express.Router();


// ===== Multer setup (for vendor register uploads) =====
const uploadDir = path.join(process.cwd(), 'uploads', 'vendors');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// ===== Routes =====
router.post(
  '/register',
  upload.fields([
    { name: 'taxDocument', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  register
);

router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.get('/me', requireAuth, async (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: 'Not authenticated' });

  const clubRoles = await getUserClubRoles(req.user._id);

  const safeUser = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    clubRoles
  };

  return res.json({ user: safeUser });
});


export default router;
