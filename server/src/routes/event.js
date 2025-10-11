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
  getMyRegisteredEvents,
  // editBazaar,
  registerForEvent,
  // createBazaar,
  // createConference,
} from '../controllers/eventController.js';

import { requireAuth, requireEventOfficer, requireProfessor } from '../middleware/auth.js';

const router = Router();

// 📌 Professor-specific first (avoid route conflicts)
router.post('/professor/workshop', requireAuth, requireProfessor, createProfessorWorkshop);
router.get('/professor/my-workshops', requireAuth, requireProfessor, getProfessorWorkshops);
router.get('/pending/workshops', requireAuth, requireEventOfficer, getPendingWorkshops);

// 📌 Additional features
router.get('/my-events', requireAuth, getMyRegisteredEvents);
// router.put('/bazaar/:id', requireAuth, requireEventOfficer, editBazaar);
router.post('/register', requireAuth, registerForEvent);
// router.post('/bazaar', requireAuth, requireEventOfficer, createBazaar);
// router.post('/conference', requireAuth, requireEventOfficer, createConference);

// 📌 General event routes
router.get('/', requireAuth, getAllEvents);
router.get('/:id', requireAuth, getEventById);
router.post('/', createEvent);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent);
router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);

// 📌 Approve/Reject event
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);

export default router;
