import express from "express";
import { requireAuth, requireEventOfficer } from "../middleware/auth.js";
import {
  getMyNotifications,
  clearMyNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// ✅ Get all notifications for logged-in Event Officer
router.get("/", requireAuth, requireEventOfficer, getMyNotifications);

// ✅ Optional: clear all notifications
router.delete("/clear", requireAuth, requireEventOfficer, clearMyNotifications);

export default router;
