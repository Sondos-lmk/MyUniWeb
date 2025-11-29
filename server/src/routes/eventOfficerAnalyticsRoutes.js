// server/src/routes/eventOfficerAnalyticsRoutes.js
import express from "express";
import { requireAuth, requireEventOfficer } from "../middleware/auth.js";
import { getEventOfficerAnalytics } from "../controllers/eventOfficeAnalyticsController.js";

const router = express.Router();

// Only Event Officers can access analytics
router.get("/", requireAuth, requireEventOfficer, getEventOfficerAnalytics);

export default router;
