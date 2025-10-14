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
  registerForEvent,
  requestWorkshopEdit,
  registerForBazaar,
  registerBooth,
  getMyEventApplications,
  // createBazaar,
  // createConference,
  //getUpcomingEvents,
} from '../controllers/eventController.js';

import {
  requireAuth,
  requireEventOfficer,
  requireProfessor,
} from '../middleware/auth.js';

const router = Router();

// Everyone logged in (any role) can view upcoming events
router.get("/upcoming", requireAuth, getUpcomingEvents);

//student/staff/events officer/TA/prof/admin can search event by name of proffessor/event or type
router.get("/search", requireAuth, searchEvents);




// Only Events Officers can create, update or delete events. Listing and viewing are public (or require auth elsewhere).
//router.post('/', requireAuth, requireEventOfficer, createEvent);
//router.get('/', getAllEvents);
//router.get('/:id', getEventById);
//router.patch('/:id', requireAuth, requireEventOfficer, updateEvent); // update route
//router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
//router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
//router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);
=======
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


router.patch("/workshop/:id/request-edit",requireAuth,requireEventOfficer,requestWorkshopEdit);

// Bazaar and Booth registration
router.post('/bazaar/:bazaarId/register', requireAuth, registerForBazaar);
router.post('/booth/:boothId/register', requireAuth, registerBooth);


// ✅ General event routes
router.get('/', getAllEvents);
router.post('/', requireAuth, requireEventOfficer, createEvent);




// 📌 General event routes
router.get('/upcoming', getUpcomingEvents);
//router.get('/', getAllEvents);

// Fetch all bazaars and booths I registered for
router.get("/my-applications", requireAuth, getMyEventApplications);

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





router.post('/', createEvent);

// ✅ Dynamic routes LAST
router.get('/:id', getEventById);

router.patch('/:id', requireAuth, requireEventOfficer, updateEvent);
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



router.delete('/:id', requireAuth, requireEventOfficer, deleteEvent);


export default router;
//event.js