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
  exportEventRegistrations
} from "../controllers/eventController.js";

import { Event } from "../models/Events/Event.js";
import { archivePastEvents } from "../controllers/archiveController.js";

import {
  requireAuth,
  requireEventOfficer,
  requireEventOfficerOrAdmin,
  requireProfessor,
} from "../middleware/auth.js";

const router = Router();

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

// Main event CRUD
router.post("/", createEvent);
router.patch("/:id", requireAuth, requireEventOfficer, updateEvent);
router.patch("/:id/approve", requireAuth, requireEventOfficer, approveEvent);
router.patch("/:id/reject", requireAuth, requireEventOfficer, rejectEvent);
router.delete("/:id", requireAuth, requireEventOfficerOrAdmin, deleteEvent);

// Bazaar update
router.patch("/:id/updateBazaar", requireAuth, requireEventOfficer, updateBazaar);

// Registrations export
router.get("/:id/export-registrations", requireAuth, requireEventOfficer, exportEventRegistrations);

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

router.post("/register/:eventId", requireAuth, registerForWorkshopOrTrip);

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
// 🔹 GET SINGLE EVENT (MUST BE LAST)
// -----------------------------------------------------
router.get("/:id", getEventById);

export default router;
