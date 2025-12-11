// routes/clubRoutes.js
import express from "express";
import {
  listClubs,
  applyToClub,
  getMyApplications,
  requestNewClub,
  getMyClubRequests,
  getAllClubCreationRequests,
  approveClubRequest,
  rejectClubRequest,
  getClubApplications,
  acceptClubApplication,
  rejectClubApplication,
  updateClubHrMembers,
} from "../controllers/clubController.js";

import {
  requireAuth,
  requireAcademicUser,
  requireEventOfficer,
  requireClubManager,
  requireClubPresident,
} from "../middleware/auth.js";

const router = express.Router();

// ---------- STUDENT ROUTES ----------
router.get("/", requireAuth, requireAcademicUser, listClubs);

router.post(
  "/:clubId/apply",
  requireAuth,
  requireAcademicUser,
  applyToClub
);

router.get(
  "/my/applications",
  requireAuth,
  requireAcademicUser,
  getMyApplications
);

router.post(
  "/requests",
  requireAuth,
  requireAcademicUser,
  requestNewClub
);

router.get(
  "/my/requests",
  requireAuth,
  requireAcademicUser,
  getMyClubRequests
);

// ---------- EVENT OFFICER ROUTES ----------
router.get(
  "/admin/creation-requests",
  requireAuth,
  requireEventOfficer,
  getAllClubCreationRequests
);

router.patch(
  "/admin/creation-requests/:id/approve",
  requireAuth,
  requireEventOfficer,
  approveClubRequest
);

router.patch(
  "/admin/creation-requests/:id/reject",
  requireAuth,
  requireEventOfficer,
  rejectClubRequest
);

// ---------- CLUB PRESIDENT / HR ROUTES ----------
router.get(
  "/:clubId/applications",
  requireAuth,
  requireClubManager,
  getClubApplications
);

router.patch(
  "/applications/:appId/accept",
  requireAuth,
  acceptClubApplication
);

router.patch(
  "/applications/:appId/reject",
  requireAuth,
  rejectClubApplication
);

// President-only: manage HR members
router.patch(
  "/:clubId/hr",
  requireAuth,
  requireClubPresident,
  updateClubHrMembers
);

export default router;
