import { Router } from "express";
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
  generateVisitorQR,
  exportEventRegistrations,
  getAllBoothConflicts,
  addEventToFavorites,
  removeEventFromFavorites,
  getMyFavoriteEvents,
  // ⭐ newly added imports for rating & comments
  rateEvent,
  addComment,
  getAttendedEvents,
  cancelVendorApplication,
  deleteComment,
  getAllComments
 
} from '../controllers/eventController.js';

import { sendCertificatesForCompletedWorkshops } from "../utils/certificateScheduler.js";
import { sendRemindersForUpcomingEvents } from "../utils/reminderScheduler.js";


import { archivePastEvents } from "../controllers/archiveController.js";

import {
  requireAuth,
  requireEventOfficer,
  requireEventOfficerOrAdmin,
  requireProfessor,
  requireAdmin
} from "../middleware/auth.js";

const router = Router();

//get conflicted booth requests
router.get("/conflicts", requireAuth, getAllBoothConflicts);

// Everyone logged in (any role) can view upcoming events
router.get("/upcoming", requireAuth, getUpcomingEvents);
// -----------------------------------------------------
// 🔹 DEBUG ROUTE
// -----------------------------------------------------
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/events" });
});

// -----------------------------------------------------
// 🔹 ARCHIVE ROUTES (must be BEFORE any :id routes)
// -----------------------------------------------------

// Archive past events
router.patch(
  "/archive-past",
  requireAuth,
  requireEventOfficer,
  archivePastEvents
);

// Get all archived events
router.get("/archived", requireAuth, requireEventOfficer, async (req, res) => {
  try {
    const events = await Event.find(
      { isArchived: true },
      "title type desc location endDate status"
    ).sort({ endDate: -1 });

    res.status(200).json({
      message: "Archived events fetched successfully",
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Archived Events Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------------------------------
// 🔹 GENERAL EVENT ROUTES
// -----------------------------------------------------
router.get("/upcoming", requireAuth, getUpcomingEvents);
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
// Favorites
router.post("/:id/favorite", requireAuth, addEventToFavorites);
router.delete("/:id/favorite", requireAuth, removeEventFromFavorites);
router.get("/my/favorites", requireAuth, getMyFavoriteEvents);

// Main event CRUD
router.post("/", createEvent);
router.patch("/:id", requireAuth, requireEventOfficer, updateEvent);
router.patch("/:id/approve", requireAuth, requireEventOfficer, approveEvent);
router.patch("/:id/reject", requireAuth, requireEventOfficer, rejectEvent);
router.delete("/:id", requireAuth, requireEventOfficerOrAdmin, deleteEvent);

// Bazaar update
router.patch("/:id/updateBazaar", requireAuth, requireEventOfficer, updateBazaar);

// Registrations export
router.get(
  "/:id/export-registrations",
  requireAuth,
  requireEventOfficer,
  exportEventRegistrations
);

// -----------------------------------------------------
// 🔹 PROFESSOR ROUTES
// -----------------------------------------------------
router.post(
  "/professor/workshop",
  requireAuth,
  requireProfessor,
  createWorkshop
);

router.put(
  "/professor/workshop/:id",
  requireAuth,
  requireProfessor,
  updateWorkshop
);


// ✅ Specific routes first
router.get(
  "/professor/my-workshops",
  requireAuth,
  requireProfessor,
  getProfessorWorkshops
);

router.get(
  "/professor/workshop/:id/participants",
  requireAuth,
  requireProfessor,
  getWorkshopParticipants
);

router.get(
  "/professor/notifications",
  requireAuth,
  requireProfessor,
  getProfessorNotifications
);

// Pending workshops (Event Officer only)
router.get(
  "/pending/workshops",
  requireAuth,
  requireEventOfficer,
  getPendingWorkshops
);

// -----------------------------------------------------
// 🔹 WORKSHOP EDIT
// -----------------------------------------------------
router.patch(
  "/workshop/:id/request-edit",
  requireAuth,
  requireEventOfficer,
  requestWorkshopEdit
);

// -----------------------------------------------------
// 🔹 EVENT REGISTRATION ROUTES
// -----------------------------------------------------
router.get("/my-events", requireAuth, getMyRegisteredEvents);
router.get("/my-applications", requireAuth, getMyEventApplications);
router.get("/my-registered", requireAuth, getMyRegisteredEventsFromUser);
router.get("/", requireAuth, getAllEvents);
router.post("/register/:eventId", requireAuth, registerForWorkshopOrTrip);

// 🔹 Attended events (for rating/comment history)
router.get("/attended", requireAuth, getAttendedEvents);

// -----------------------------------------------------
// 🔹 BAZAAR & BOOTH ROUTES
// -----------------------------------------------------
router.post("/bazaar/:bazaarId/register", requireAuth, registerForBazaar);
router.post("/booth/:boothId/register", requireAuth, registerBooth);
router.patch("/:eventId/vendors/:vendorId", requireAuth, updateVendorStatus);

// -----------------------------------------------------
// 🔹 CONFERENCES
// -----------------------------------------------------
router.post(
  "/createConference",
  requireAuth,
  requireEventOfficer,
  createConference
);

router.patch(
  "/:id/updateConf",
  requireAuth,
  requireEventOfficer,
  updateConference
);

// -----------------------------------------------------
// 🔹 GENERATE VISITOR QR (career fair + booths)
// -----------------------------------------------------
router.post(
  "/:id/generate-visitor-qr",
  requireAuth,
  requireEventOfficer,
  generateVisitorQR
);

// -----------------------------------------------------
// 🔹 DEBUG LIST ALL EVENTS
// -----------------------------------------------------
router.get("/debug/events", async (req, res) => {
  try {
    const events = await Event.find(
      {},
      "title endDate isArchived status type"
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// 🔹 MANUAL CERTIFICATE SCHEDULER TRIGGER
// -----------------------------------------------------
router.post("/trigger-certificates", requireAuth, async (req, res) => {
  try {
    await sendCertificatesForCompletedWorkshops();
    res.json({ message: "Certificate scheduler triggered successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error triggering certificates",
      error: error.message,
    });
  }
});

// -----------------------------------------------------
// 🔹 MANUAL REMINDER SCHEDULER TRIGGER
// -----------------------------------------------------
router.post("/trigger-reminders", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "eventOfficer" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only Event Officers or Admins can trigger reminders.",
      });
    }

    const result = await sendRemindersForUpcomingEvents();
    res.json({
      message: "Reminder scheduler ran successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Error triggering reminders:", error);
    res.status(500).json({
      message: "Error triggering reminders",
      error: error.message,
    });
  }
});

// -----------------------------------------------------
// 🔹 RATING & COMMENTS ROUTES (before :id catch-all)
// -----------------------------------------------------
router.post("/:id/rate", requireAuth, rateEvent);
router.post("/:id/comment", requireAuth, addComment);
router.delete("/:eventId/comments/:commentId", requireAuth, requireAdmin, deleteComment);
router.get("/all-comments", requireAuth, requireAdmin, getAllComments);


// -----------------------------------------------------
// 🔹 GET SINGLE EVENT (MUST BE LAST)
// -----------------------------------------------------
router.get("/:id", getEventById);

router.delete(
  '/:eventId/applications/:registrationId/cancel', 
  requireAuth, 
  cancelVendorApplication
);

export default router;