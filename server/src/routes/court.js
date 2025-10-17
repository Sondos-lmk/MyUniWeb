import { Router } from "express";
import { getAllCourts, getCourtAvailability } from "../controllers/courtController.js";
import { requireAuth } from "../middleware/auth.js"; // students must be logged in

const router = Router();

router.get("/", requireAuth, getAllCourts);
router.get("/:id/availability", requireAuth, getCourtAvailability);

export default router;
