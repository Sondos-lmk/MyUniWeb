// controllers/clubController.js
import { Club } from "../models/Events/Club.js";
import { ClubApplication } from "../models/Events/ClubApplications.js";
import { ClubCreationRequest } from "../models/Events/ClubCreationRequests.js";

// Helper: recruitment window (Feb, Sep)
function isInRecruitmentWindow(date = new Date()) {
  const month = date.getMonth(); // 0-based: 0=Jan
  return month === 1 || month === 8; // Feb (1), Sep (8)
}

// ---------- STUDENT SIDE ----------

// GET /api/clubs
export async function listClubs(req, res) {
  try {
    const clubs = await Club.find({})
      .populate("president", "name email")
      .populate("hrMembers", "name email")
      .sort({ createdAt: -1 });

    return res.json({ clubs });
  } catch (err) {
    console.error("Error listing clubs:", err);
    return res.status(500).json({ message: "Failed to fetch clubs" });
  }
}

// POST /api/clubs/:clubId/apply
export async function applyToClub(req, res) {
  try {
    const { clubId } = req.params;
    const { name, gucId, phone, email, major, motivation  } = req.body;
    const studentId = req.user._id;

    if (!email || !major) {
    return res.status(400).json({
      message: "Email and major are required.",
    });
  }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Find latest application for this club & student
    const lastApp = await ClubApplication.findOne({
      club: clubId,
      student: studentId,
    }).sort({ createdAt: -1 });

    if (lastApp && lastApp.status === "pending") {
      return res
        .status(400)
        .json({ message: "You already have a pending application for this club." });
    }

    if (lastApp && lastApp.status === "accepted") {
      return res.status(400).json({
        message: "You are already accepted into this club.",
      });
    }

    const application = await ClubApplication.create({
      club: clubId,
      student: studentId,
      name,
      gucId,
      phone,
      email,
      major,
      motivation,
    });

    const inWindow = isInRecruitmentWindow();

    // TODO: integrate notification to club president / HR

    return res.status(201).json({
      application,
      inRecruitmentWindow: inWindow,
      infoMessage: inWindow
        ? "Your application has been submitted. The club HR will review it soon."
        : "Your application has been submitted. It will be reviewed in the next recruitment cycle (February or September).",
    });
  } catch (err) {
    console.error("Error applying to club:", err);
    return res.status(500).json({ message: "Failed to apply to club" });
  }
}

// GET /api/clubs/my/applications
export async function getMyApplications(req, res) {
  try {
    const apps = await ClubApplication.find({ student: req.user._id })
      .populate("club", "name")
      .sort({ createdAt: -1 });

    return res.json({ applications: apps });
  } catch (err) {
    console.error("Error fetching my applications:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch your club applications" });
  }
}

// POST /api/clubs/requests  (new club request)
export async function requestNewClub(req, res) {
  try {
    const { name, desc, reason } = req.body;

    if (!name || !desc || !reason) {
      return res
        .status(400)
        .json({ message: "Name, description, and reason are required." });
    }

    let logoPath = null;
    if (req.file) {
      // we’ll serve this as /uploads/clubs/filename
      logoPath = `/uploads/clubs/${req.file.filename}`;
    }

    // Optional: prevent duplicate pending requests with same name
    const existing = await ClubCreationRequest.findOne({
      name,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({
        message: "A club creation request with this name is already pending.",
      });
    }

    const request = await ClubCreationRequest.create({
      name,
      desc,
      reason,
      student: req.user._id,
      logo: logoPath,
    });

    // TODO: notify event officers

    return res
      .status(201)
      .json({ request, message: "Club request submitted successfully." });
  } catch (err) {
    console.error("Error requesting new club:", err);
    return res.status(500).json({ message: "Failed to submit club request" });
  }
}

// GET /api/clubs/my/requests
export async function getMyClubRequests(req, res) {
  try {
    const requests = await ClubCreationRequest.find({ student: req.user._id })
      .sort({ createdAt: -1 });

    return res.json({ requests });
  } catch (err) {
    console.error("Error fetching my club requests:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch your club requests" });
  }
}

// ---------- EVENT OFFICER SIDE ----------

// GET /api/clubs/admin/creation-requests
export async function getAllClubCreationRequests(req, res) {
  try {
    const requests = await ClubCreationRequest.find({})
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.json({ requests });
  } catch (err) {
    console.error("Error fetching club creation requests:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch club creation requests" });
  }
}

// PATCH /api/clubs/admin/creation-requests/:id/approve
export async function approveClubRequest(req, res) {
  try {
    const { id } = req.params;

    const request = await ClubCreationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Club request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed." });
    }

    // ✅ Create club AND add president as a member
    const club = await Club.create({
      name: request.name,
      desc: request.desc,
      logo: request.logo,
      president: request.student,
      members: [request.student],   // ⭐ IMPORTANT
      hrMembers: [],
    });

    request.status = "accepted";
    request.rejectionReason = undefined;
    await request.save();

    return res.json({
      message: "Club request approved and club created.",
      club,
      request,
    });
  } catch (err) {
    console.error("Error approving club request:", err);
    return res.status(500).json({ message: "Failed to approve club request" });
  }
}


// PATCH /api/clubs/admin/creation-requests/:id/reject
export async function rejectClubRequest(req, res) {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required." });
    }

    const request = await ClubCreationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Club request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed." });
    }

    request.status = "rejected";
    request.rejectionReason = rejectionReason;
    await request.save();

    // TODO: send notification to request.student

    return res.json({
      message: "Club request rejected.",
      request,
    });
  } catch (err) {
    console.error("Error rejecting club request:", err);
    return res.status(500).json({ message: "Failed to reject club request" });
  }
}

// ---------- CLUB PRESIDENT / HR SIDE ----------

// GET /api/clubs/:clubId/applications
export async function getClubApplications(req, res) {
  try {
    const { clubId } = req.params;

    const applications = await ClubApplication.find({
      club: clubId,
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.json({ applications });
  } catch (err) {
    console.error("Error fetching club applications:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch club applications" });
  }
}

// PATCH /api/clubs/applications/:appId/accept
export async function acceptClubApplication(req, res) {
  try {
    const { appId } = req.params;
    const reviewerId = req.user._id;

    const app = await ClubApplication.findById(appId).populate("club");
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Ensure reviewer is president or HR for that club
    const club = await Club.findById(app.club._id);
    const uid = reviewerId.toString();
    const isPresident = club.president.toString() === uid;
    const isHr = (club.hrMembers || []).some((m) => m.toString() === uid);

    if (!isPresident && !isHr) {
      return res
        .status(403)
        .json({ message: "You are not allowed to review this application." });
    }

    if (app.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This application has already been processed." });
    }

    app.status = "accepted";
    app.reviewedBy = reviewerId;
    app.reviewedAt = new Date();
    app.reviewMessage = req.body.reviewMessage || "";
    await app.save();

    // ⭐ Add student to club members
    if (!club.members.includes(app.student)) {
      club.members.push(app.student);
      await club.save();
    }

    // TODO: notification to app.student

    return res.json({ message: "Application accepted.", application: app });
  } catch (err) {
    console.error("Error accepting application:", err);
    return res
      .status(500)
      .json({ message: "Failed to accept club application" });
  }
}

// PATCH /api/clubs/applications/:appId/reject
export async function rejectClubApplication(req, res) {
  try {
    const { appId } = req.params;
    const { reviewMessage } = req.body;
    const reviewerId = req.user._id;

    if (!reviewMessage) {
      return res
        .status(400)
        .json({ message: "Rejection message is required." });
    }

    const app = await ClubApplication.findById(appId).populate("club");
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    const club = await Club.findById(app.club._id);
    const uid = reviewerId.toString();
    const isPresident = club.president.toString() === uid;
    const isHr = (club.hrMembers || []).some((m) => m.toString() === uid);

    if (!isPresident && !isHr) {
      return res
        .status(403)
        .json({ message: "You are not allowed to review this application." });
    }

    if (app.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This application has already been processed." });
    }

    app.status = "rejected";
    app.reviewedBy = reviewerId;
    app.reviewedAt = new Date();
    app.reviewMessage = reviewMessage;
    await app.save();

    // TODO: notification to app.student

    return res.json({ message: "Application rejected.", application: app });
  } catch (err) {
    console.error("Error rejecting application:", err);
    return res
      .status(500)
      .json({ message: "Failed to reject club application" });
  }
}

// PATCH /api/clubs/:clubId/hr  (president only)
export async function updateClubHrMembers(req, res) {
  try {
    const { clubId } = req.params;
    const { hrMemberIds } = req.body;

    if (!Array.isArray(hrMemberIds)) {
      return res
        .status(400)
        .json({ message: "hrMemberIds must be an array of user IDs." });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.president.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the president can update HR members." });
    }

    club.hrMembers = hrMemberIds;
    await club.save();

    return res.json({
      message: "HR members updated successfully.",
      club,
    });
  } catch (err) {
    console.error("Error updating HR members:", err);
    return res.status(500).json({ message: "Failed to update HR members" });
  }
}

export async function getClubMembers(req, res) {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId).populate(
      "members",
      "name email"
    );

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const membersWithRoles = club.members.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      isHr: club.hrMembers.some((hrId) => hrId.equals(u._id)),
    }));

    return res.json({ members: membersWithRoles });
  } catch (err) {
    console.error("Error fetching club members:", err);
    return res.status(500).json({ message: "Failed to fetch members" });
  }
}



