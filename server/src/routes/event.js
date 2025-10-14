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


// Only Events Officers can create, update or delete events. Listing and viewing are public (or require auth elsewhere).
//router.post('/', requireAuth, requireEventOfficer, createEvent);
//router.get('/', getAllEvents);
//router.get('/:id', getEventById);
//router.patch('/:id', requireAuth, requireEventOfficer, updateEvent); // update route
//router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
//router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
router.patch("/workshop/:id/request-edit",requireAuth,requireEventOfficer,requestWorkshopEdit);

router.get('/:id', requireAuth, getEventById);
router.post('/', requireAuth, requireEventOfficer, createEvent);


=======
// 📌 General event routes
router.get('/', getAllEvents);

// ✅ Add these new routes before the ":id" route
router.get('/workshops', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'workshop' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workshops', error: err.message });
  }
});

router.get('/trips', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'trip' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips', error: err.message });
  }
});

router.get('/my-applications', requireAuth, getMyEventApplications);
router.get('/:id', requireAuth, getEventById);
=======
// 📌 General event routes
router.get('/', getAllEvents);

// ✅ Add these new routes before the ":id" route
router.get('/workshops', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'workshop' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workshops', error: err.message });
  }
});

router.get('/trips', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'trip' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips', error: err.message });
  }
});

router.get('/my-applications', requireAuth, getMyEventApplications);
router.get('/:id', requireAuth, getEventById);
>>>>>>> Stashed changes
=======
// 📌 General event routes
router.get('/', getAllEvents);

// ✅ Add these new routes before the ":id" route
router.get('/workshops', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'workshop' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workshops', error: err.message });
  }
});

router.get('/trips', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'trip' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips', error: err.message });
  }
});

router.get('/my-applications', requireAuth, getMyEventApplications);
router.get('/:id', requireAuth, getEventById);
>>>>>>> Stashed changes
=======
// 📌 General event routes
router.get('/', getAllEvents);

// ✅ Add these new routes before the ":id" route
router.get('/workshops', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'workshop' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workshops', error: err.message });
  }
});

router.get('/trips', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'trip' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips', error: err.message });
  }
});

router.get('/my-applications', requireAuth, getMyEventApplications);
router.get('/:id', requireAuth, getEventById);
>>>>>>> Stashed changes




router.post('/', createEvent);
>>>>>>> Stashed changes
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent);
router.delete('/:id', requireAuth, requireEventOfficerOrAdmin, deleteEvent);

// 📌 Approve/Reject event
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);

// 📌 Bazaar registration
router.post('/bazaar/:bazaarId/register', requireAuth, registerForBazaar);

// Booth registration
router.post("/booth/:boothId/register", requireAuth, registerBooth);

// Only Events Officers can create, update or delete events. Listing and viewing are public (or require auth elsewhere).
router.post('/', requireAuth, requireEventOfficer, createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent); // update route
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
//router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);



export default router;


