// import express from "express";
// import { requireAuth, requireEventOfficer, requireGymAttendee } from "../middleware/auth.js";
// import {
//   createGymSession,
//   getGymSchedule,
//   registerForGymSession,   // ⬅ ADD THIS
// } from "../controllers/gymController.js";

// const router = express.Router();

// //Create new gym session (only Events Office)
// router.post("/", requireAuth, requireEventOfficer, createGymSession);

// //View all gym sessions (any logged-in user)
// router.get("/", requireAuth, getGymSchedule);
// // Register for a specific gym session (Student/Staff/TA/Professor)
// router.post(
//   "/:sessionId/register",
//   requireAuth,
//   requireGymAttendee,
//   registerForGymSession
// );
// router.get("/my-sessions", authMiddleware, getMyRegisteredSessions);


// export default router;
import express from "express";
import {
  requireAuth,
  requireEventOfficer,
  requireGymAttendee,
} from "../middleware/auth.js";
import {
  createGymSession,
  getGymSchedule,
  registerForGymSession,
  getMyRegisteredSessions,   // ⬅ ADD THIS
} from "../controllers/gymController.js";

const router = express.Router();

// Create new gym session (only Events Office)
router.post("/", requireAuth, requireEventOfficer, createGymSession);

// View all gym sessions (any logged-in user)
router.get("/", requireAuth, getGymSchedule);

// Register for a specific gym session (Student/Staff/TA/Professor)
router.post(
  "/:sessionId/register",
  requireAuth,
  requireGymAttendee,
  registerForGymSession
);

// Get sessions the logged-in user is registered in
router.get("/my-sessions", requireAuth, getMyRegisteredSessions);

export default router;
