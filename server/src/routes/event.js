import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  updateBazaar,
  deleteEvent,
  approveEvent,
  rejectEvent,
  createProfessorWorkshop,
  createBazaar,
  getPendingWorkshops,
  getProfessorWorkshops,
  getMyRegisteredEvents,
  createConference,
  updateConference,
  // editBazaar,
  registerForEvent,
  registerForBazaar,
  registerBooth,
  getMyEventApplications,
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
router.get('/', getAllEvents);
// Fetch all bazaars and booths I registered for
router.get("/my-applications", requireAuth, getMyEventApplications);

router.get('/:id', requireAuth, getEventById);
router.post('/', createEvent);
router.post('/createBazaar', requireAuth, requireEventOfficer,createBazaar);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent);
router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);

router.post('/createConference', requireAuth, requireEventOfficer,createConference);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent);
router.patch('/:id/updateConf', requireAuth, requireEventOfficer, updateConference);

// 📌 Approve/Reject event/update
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
router.patch('/:id/updateBazaar', requireAuth, requireEventOfficer, updateBazaar);
// 📌 Bazaar registration
router.post('/bazaar/:bazaarId/register', requireAuth, registerForBazaar);

// Booth registration
router.post("/booth/:boothId/register", requireAuth, registerBooth);



export default router;


