import express from "express";
import { requireAuth, requireEventOfficer } from "../middleware/auth.js";
import { createGymSession, getGymSchedule } from "../controllers/gymController.js";

const router = express.Router();

//Create new gym session (only Events Office)
router.post("/", requireAuth, requireEventOfficer, createGymSession);

//View all gym sessions (any logged-in user)
router.get("/", requireAuth, getGymSchedule);

export default router;
