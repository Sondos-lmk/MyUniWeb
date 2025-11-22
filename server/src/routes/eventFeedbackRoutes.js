import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getEventFeedback } from "../controllers/eventFeedbackController.js";

const router = express.Router();

const allowed = ["student", "staff", "ta", "professor", "eventOfficer", "admin"];

router.get("/:eventId/feedback", requireAuth, (req, res, next) => {
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: "Not allowed" });
  }
  next();
}, getEventFeedback);

export default router;
