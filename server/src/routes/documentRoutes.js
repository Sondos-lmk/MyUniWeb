import express from "express";
import { requireAuth, requireEventOfficerOrAdmin } from "../middleware/auth.js";
import { getVendorDocumentsForEvent } from "../controllers/documentController.js";

const router = express.Router();

router.get(
  "/event/:eventId/vendor/:vendorId",
  requireAuth,
  requireEventOfficerOrAdmin,
  getVendorDocumentsForEvent
);

export default router;
