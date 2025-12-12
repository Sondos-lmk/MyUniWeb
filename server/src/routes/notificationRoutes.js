import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyNotifications,
  clearMyNotifications,
  addNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// ✅ Allow both Admins and Event Officers to get notifications
router.get("/", requireAuth, getMyNotifications);

// ✅ Allow both Admins and Event Officers to clear notifications
router.delete("/clear", requireAuth, clearMyNotifications);

// ✅ Add a notification for the logged-in user
router.post("/add", requireAuth, addNotification);

export default router;
