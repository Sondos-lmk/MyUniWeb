import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  createProfessorWorkshop,
  getPendingWorkshops,
  getProfessorWorkshops,
} from '../controllers/eventController.js';
import { requireAuth, requireEventOfficer, requireProfessor } from '../middleware/auth.js';

const router = Router();

// Only Events Officers can create, update or delete events. Listing and viewing are public (or require auth elsewhere).
router.post('/', requireAuth, requireEventOfficer, createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent); // update route
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);

// Professor-specific routes
router.post('/professor/workshop', requireAuth, requireProfessor, createProfessorWorkshop);
router.get('/professor/my-workshops', requireAuth, requireProfessor, getProfessorWorkshops);

// Events Officer routes for managing professor workshops
router.get('/pending/workshops', requireAuth, requireEventOfficer, getPendingWorkshops);

export default router;
