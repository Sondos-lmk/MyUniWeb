import express from "express";
import { getAllCourts, getCourtAvailability, bookCourt } from "../controllers/courtController.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getAllCourts);
router.get("/:id/availability", requireAuth, getCourtAvailability);
router.post("/:id/book", requireAuth, bookCourt);

export default router;
