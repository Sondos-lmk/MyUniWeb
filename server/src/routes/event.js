import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  createWorkshop,
  updateWorkshop,
  getPendingWorkshops,
  getProfessorWorkshops,
  getMyRegisteredEvents,
  registerForEvent,
  requestWorkshopEdit,
  registerForBazaar,
  registerBooth,
  getMyEventApplications,
} from '../controllers/eventController.js';

import {
  requireAuth,
  requireEventOfficer,
  requireProfessor,
} from '../middleware/auth.js';

const router = Router();

// ✅ Specific routes first

// Professor-specific routes
router.post('/professor/workshop', requireAuth, requireProfessor, createWorkshop);
router.put('/professor/workshop/:id', requireAuth, requireProfessor, updateWorkshop);
router.get('/professor/my-workshops', requireAuth, requireProfessor, getProfessorWorkshops);

// Pending workshops (Event Officer only)
router.get('/pending/workshops', requireAuth, requireEventOfficer, getPendingWorkshops);

// My applications / My events
router.get('/my-events', requireAuth, getMyRegisteredEvents);
router.get('/my-applications', requireAuth, getMyEventApplications);

// Workshop edit request
router.patch('/workshop/:id/request-edit', requireAuth, requireEventOfficer, requestWorkshopEdit);

// Bazaar and Booth registration
router.post('/bazaar/:bazaarId/register', requireAuth, registerForBazaar);
router.post('/booth/:boothId/register', requireAuth, registerBooth);

// ✅ General event routes
router.get('/', getAllEvents);
router.post('/', requireAuth, requireEventOfficer, createEvent);

// ✅ Dynamic routes LAST
router.get('/:id', getEventById);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent);
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);

export default router;
//event.js