import { Router } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { getAllUsers } from '../controllers/userControllers.js';
import { getUserById } from '../controllers/userControllers.js';
import { submitWorkers } from '../controllers/userControllers.js';
import { requireAuth,requireAdmin } from '../middleware/auth.js';
import { getVendorProfile, editVendorProfile } from '../controllers/userControllers.js';
import { getWorkers } from '../controllers/userControllers.js';

const router = Router();

// [REQ 1] Admin: view list of all users
router.get('/admin/users', requireAuth, requireAdmin, getAllUsers);


// [REQ 2] Admin: view a single user by ID
router.get('/:id', requireAuth, getUserById);


// Multer setup for vendor uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'vendors');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

// Get vendor profile
router.get('/vendor/profile', requireAuth, getVendorProfile);



// Edit vendor profile (logo)
router.put('/vendor/profile', requireAuth, upload.single('logo'), editVendorProfile);

const uploadDir1 = 'uploads/workers';
if (!fs.existsSync(uploadDir1)) {
  fs.mkdirSync(uploadDir1, { recursive: true });
}

// Configure storage for worker ID pictures
const workerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir1);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `worker-id-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for worker IDs'));
  }
};

// Multer upload configuration for workers
export const uploadWorkerIDs = multer({
  storage: workerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: imageFilter
}).fields([
  { name: 'workers', maxCount: 20 } // Allow up to 20 workers
]);


router.post('/vendor/:id/submit-workers',requireAuth, uploadWorkerIDs,submitWorkers);

router.get('/vendor/:id/workers', requireAuth, getWorkers);





export default router;
