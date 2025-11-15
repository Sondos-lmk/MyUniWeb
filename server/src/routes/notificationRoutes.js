import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyNotifications,
  clearMyNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// ✅ Allow both Admins and Event Officers to get notifications
router.get("/", requireAuth, getMyNotifications);

// ✅ Allow both Admins and Event Officers to clear notifications
router.delete("/clear", requireAuth, clearMyNotifications);

export default router;
