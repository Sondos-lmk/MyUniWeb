import express from "express";
import { requireAuth, requireEventOfficer } from "../middleware/auth.js";
import { createGymSession, getGymSchedule, updateGymSession, cancelGymSession } from "../controllers/gymController.js";

const router = express.Router();

//Create new gym session (only Events Office)
router.post("/", requireAuth, requireEventOfficer, createGymSession);

//View all gym sessions (any logged-in user)
router.get("/", requireAuth, getGymSchedule);

// Edit gym session (date, time, duration only) - Events Office only
router.patch("/:id", requireAuth, requireEventOfficer, updateGymSession);

// Cancel gym session - Events Office only
router.delete("/:id", requireAuth, requireEventOfficer, cancelGymSession);

export default router;
