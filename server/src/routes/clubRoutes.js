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
  getClubMembers,
} from "../controllers/clubController.js";

import {
  requireAuth,
  requireAcademicUser,
  requireEventOfficer,
  requireClubManager,
  requireClubPresident,
} from "../middleware/auth.js";

import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const clubUploadDir = path.join(process.cwd(), "uploads", "clubs");
fs.mkdirSync(clubUploadDir, { recursive: true });

const clubStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, clubUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const uploadClubLogo = multer({ storage: clubStorage });


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
  uploadClubLogo.single("logo"),  // ⬅️ NEW
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

router.get(
  "/:clubId/members",
  requireAuth,
  requireClubPresident,
  getClubMembers
);


export default router;
