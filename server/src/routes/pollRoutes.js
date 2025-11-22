// routes/pollRoutes.js
import express from 'express';
import {
  createPoll,
  getAllPolls,
  getPollsByBooth,
  getActivePolls,
  getPollById,
  voteInPoll,
} from '../controllers/pollController.js';
import {
  requireAuth,
  requireEventOfficer,
  requireAcademicUser,
} from '../middleware/auth.js';

const router = express.Router();

// Event Officer
router.post('/', requireAuth, requireEventOfficer, createPoll);
router.get('/', requireAuth, requireEventOfficer, getAllPolls);
router.get('/by-booth/:boothId', requireAuth, requireEventOfficer, getPollsByBooth);

// Academic users
router.get('/active', requireAuth, requireAcademicUser, getActivePolls);
router.get('/:id', requireAuth, getPollById);
router.post('/:id/vote', requireAuth, requireAcademicUser, voteInPoll);

export default router;
