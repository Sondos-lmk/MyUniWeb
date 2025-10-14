import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  getUpcomingEvents,
  searchEvents,
  createWorkshop,
  updateWorkshop,
  getPendingWorkshops,
  getProfessorWorkshops,
  getMyRegisteredEvents,
  // editBazaar,
  registerForEvent,
  requestWorkshopEdit,
  registerForBazaar,
  registerBooth,
  getMyEventApplications,
  // createBazaar,
  // createConference,
} from '../controllers/eventController.js';

import { requireAdmin, requireAuth, requireEventOfficer, requireProfessor,requireEventOfficerOrAdmin } from '../middleware/auth.js';

const router = Router();

// Everyone logged in (any role) can view upcoming events
router.get("/upcoming", requireAuth, getUpcomingEvents);

//student/staff/events officer/TA/prof/admin can search event by name of proffessor/event or type
router.get("/search", requireAuth, searchEvents);



// Only Events Officers can create, update or delete events. Listing and viewing are public (or require auth elsewhere).
router.post('/', requireAuth, requireEventOfficer, createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent); // update route
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
//router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);

// Professor-specific routes
router.post('/professor/workshop', requireAuth, requireProfessor, createWorkshop);

// Update workshop
router.put("/professor/workshop/:id",requireAuth,requireProfessor,updateWorkshop);

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

router.patch("/workshop/:id/request-edit",requireAuth,requireEventOfficer,requestWorkshopEdit);

router.get('/:id', requireAuth, getEventById);
router.post('/', requireAuth, requireEventOfficer, createEvent);


router.patch('/:id', requireAuth, requireEventOfficer, updateEvent);
router.delete('/:id', requireAuth, requireEventOfficerOrAdmin, deleteEvent);

// 📌 Approve/Reject event
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);

// 📌 Bazaar registration
router.post('/bazaar/:bazaarId/register', requireAuth, registerForBazaar);

// Booth registration
router.post("/booth/:boothId/register", requireAuth, registerBooth);



export default router;


