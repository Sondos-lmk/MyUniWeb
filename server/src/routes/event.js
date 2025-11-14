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
  getUpcomingEvents,
  searchEvents,
  createWorkshop,
  updateWorkshop,
  getPendingWorkshops,
  getWorkshopParticipants,
  getProfessorWorkshops,
  getProfessorNotifications,
  getMyRegisteredEvents,
  createConference,
  updateConference,
  registerForEvent,
  requestWorkshopEdit,
  registerForBazaar,
  registerBooth,
  updateVendorStatus,
  getMyEventApplications,
  registerForWorkshopOrTrip,
  getMyRegisteredEventsFromUser,
  sendCertificate,
  exportEventRegistrations,
  generateVisitorQR
 
} from '../controllers/eventController.js';
import { sendCertificatesForCompletedWorkshops } from '../utils/certificateScheduler.js';

import {
  requireAuth,
  requireEventOfficer,
  requireEventOfficerOrAdmin,
  requireProfessor,
} from '../middleware/auth.js';

const router = Router();

// Everyone logged in (any role) can view upcoming events
router.get("/upcoming", requireAuth, getUpcomingEvents);

//student/staff/events officer/TA/prof/admin can search event by name of proffessor/event or type
router.get("/search", requireAuth, searchEvents);

router.post("/send-certificate", requireAuth, sendCertificate);



// Only Events Officers can create, update or delete events. Listing and viewing are public (or require auth elsewhere).
router.post('/', createEvent);
router.patch('/:id', requireAuth, requireEventOfficer, updateEvent); // update route
router.patch('/:id/approve', requireAuth, requireEventOfficer, approveEvent);
router.patch('/:id/reject', requireAuth, requireEventOfficer, rejectEvent);
router.delete('/:id', requireAuth, requireEventOfficerOrAdmin, deleteEvent);
router.patch('/:id/updateBazaar', requireAuth, requireEventOfficer, updateBazaar);
router.get('/:id/export-registrations', requireAuth, requireEventOfficer, exportEventRegistrations);



// ✅ Specific routes first


// Professor-specific routes
router.post('/professor/workshop', requireAuth, requireProfessor, createWorkshop);
router.put('/professor/workshop/:id', requireAuth, requireProfessor, updateWorkshop);
router.get('/professor/my-workshops', requireAuth, requireProfessor, getProfessorWorkshops);
router.get('/professor/workshop/:id/participants',requireAuth,requireProfessor,getWorkshopParticipants);// View participants for a workshop I created
router.get('/professor/notifications',requireAuth,requireProfessor,getProfessorNotifications);


// Pending workshops (Event Officer only)
router.get('/pending/workshops', requireAuth, requireEventOfficer, getPendingWorkshops);

// My applications / My events
router.get('/my-events', requireAuth, getMyRegisteredEvents);  // for students
router.get('/my-applications', requireAuth, getMyEventApplications);
router.post("/register/:eventId", requireAuth, registerForWorkshopOrTrip);
router.get("/my-registered", requireAuth, getMyRegisteredEventsFromUser);


router.get('/:id', getEventById);

// Workshop edit request
router.patch('/workshop/:id/request-edit', requireAuth, requireEventOfficer, requestWorkshopEdit);


 
router.patch("/workshop/:id/request-edit",requireAuth,requireEventOfficer,requestWorkshopEdit);

// Bazaar and Booth registration
router.post('/bazaar/:bazaarId/register', requireAuth, registerForBazaar);
router.post('/booth/:boothId/register', requireAuth, registerBooth);
router.patch('/:eventId/vendors/:vendorId', requireAuth, updateVendorStatus);







// 📌 General event routes
//router.get('/upcoming', getUpcomingEvents);
router.get('/', getAllEvents);

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
})

router.get('/trips', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ type: 'trip' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips', error: err.message });
  }
});


router.post('/createConference', requireAuth, requireEventOfficer,createConference);
router.patch('/:id/updateConf', requireAuth, requireEventOfficer, updateConference);

// Manual trigger for testing certificate sending
router.post('/trigger-certificates', requireAuth, async (req, res) => {
  try {
    await sendCertificatesForCompletedWorkshops();
    res.json({ message: 'Certificate scheduler triggered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error triggering certificates', error: error.message });
  }
});

router.post("/:id/generate-visitor-qr",requireAuth,requireEventOfficer,generateVisitorQR);

export default router;
