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
} from "../controllers/gymController.js";

const router = express.Router();

// Create gym session
router.post("/", requireAuth, requireEventOfficer, createGymSession);

// View gym sessions
router.get("/", requireAuth, getGymSchedule);

// Register for gym session
router.post("/:sessionId/register", requireAuth, requireGymAttendee, registerForGymSession);

export default router;