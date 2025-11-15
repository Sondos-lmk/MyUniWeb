import { GymSession } from "../models/Events/GymSession.js";
import { User } from "../models/Users/User.js";
import { sendEmail } from "../utils/email.js";
import { notifyUsersOfNewEvent } from "../utils/inAppNotification.js";

// Create new gym session (Events Office only)
export const createGymSession = async (req, res) => {
  try {
    const { sessionType, date, time, duration, maxParticipants } = req.body;

    const newSession = new GymSession({
      sessionType,
      date,
      time,
      duration,
      maxParticipants,
      createdBy: req.user._id,
      status: "approved",
      type: "gym",
      // optional: if you want to use allowedRoles, uncomment:
      // allowedRoles: ["student", "staff", "ta", "professor"],
    });

    await newSession.save();

    // ✅ New: notify all relevant users about the new gym session
    try {
      await notifyUsersOfNewEvent(newSession);
    } catch (notifyErr) {
      console.error("Error sending new-event notifications for gym session:", notifyErr);
    }

    res.status(201).json({
      message: "Gym session created successfully",
      session: newSession,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// View all gym sessions (everyone)
export const getGymSchedule = async (req, res) => {
  try {
    const gymSessions = await GymSession.find().sort({ date: 1 });
    res.status(200).json(gymSessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing gym session (Events Office only)
export const updateGymSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, duration } = req.body;

    const session = await GymSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Gym session not found" });
    }

    // Prevent editing past sessions
    const now = new Date();
    const sessionDate = new Date(session.date || 0);
    if (sessionDate <= now) {
      return res.status(400).json({ message: "Cannot edit a session that has already started or passed" });
    }

    // Only allow date, time, duration edits
    if (date !== undefined) session.date = date;
    if (time !== undefined) session.time = time;
    if (duration !== undefined) session.duration = duration;

    await session.save();

    // Notify registered participants (students/staff/ta/professor)
    try {
      await notifyGymParticipants(session, "updated");
    } catch (e) {
      console.error("Failed to notify participants on update:", e?.message || e);
      // Do not fail the update on email errors
    }

    res.status(200).json({ message: "Gym session updated successfully", session });
  } catch (err) {
    console.error("Update Gym Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//  Register for a gym session (Student/Staff/TA/Professor)
export const registerForGymSession = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user._id; // comes from the token
  
      const session = await GymSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Gym session not found" });
      }
  
      //  Check if already registered
      if (session.participants && session.participants.includes(userId)) {
        return res.status(400).json({ message: "You are already registered for this session" });
      }
  
      //  Check if spots are available
      if (session.participants && session.participants.length >= session.maxParticipants) {
        return res.status(400).json({ message: "This session is full" });
      }
  
      // Add the user to participants array
      session.participants = session.participants || [];
      session.participants.push(userId);
      await session.save();
  
      res.status(200).json({
        message: "Successfully registered for the gym session",
        session,
      });
    } catch (err) {
      console.error("Register Gym Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

// Cancel a gym session (Events Office only)
export const cancelGymSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await GymSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Gym session not found" });
    }

    // Prevent cancelling past sessions
    const now = new Date();
    const sessionDate = new Date(session.date || 0);
    if (sessionDate <= now) {
      return res.status(400).json({ message: "Cannot cancel a session that has already started or passed" });
    }

    // Mark as cancelled via base Event status
    session.status = "cancelled";
    await session.save();

    // Notify registered participants
    try {
      await notifyGymParticipants(session, "cancelled");
    } catch (e) {
      console.error("Failed to notify participants on cancel:", e?.message || e);
      // Continue even if email fails
    }

    res.status(200).json({ message: "Gym session cancelled successfully", session });
  } catch (err) {
    console.error("Cancel Gym Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Helper to notify registered attendees by email
async function notifyGymParticipants(session, action) {
  if (!session?.participants?.length) return;

  const allowedRoles = new Set(["student", "staff", "ta", "professor"]);
  // Load participants' emails and roles
  const users = await User.find({ _id: { $in: session.participants } }).select("email role name").lean();
  const recipients = users.filter(u => allowedRoles.has((u.role || "").toLowerCase()));
  if (!recipients.length) return;

  const when = formatSessionWhen(session);
  const subject = action === "cancelled"
    ? `Gym Session Cancelled: ${session.sessionType} (${when})`
    : `Gym Session Updated: ${session.sessionType} (${when})`;

  const html = action === "cancelled"
    ? `
      <p>Dear attendee,</p>
      <p>The gym session you registered for has been <strong>cancelled</strong>.</p>
      <p><strong>Session:</strong> ${escapeHtml(session.sessionType)}<br/>
         <strong>When:</strong> ${escapeHtml(when)}</p>
      <p>We apologize for the inconvenience.</p>
    `
    : `
      <p>Dear attendee,</p>
      <p>The gym session you registered for has been <strong>updated</strong>.</p>
      <p><strong>Session:</strong> ${escapeHtml(session.sessionType)}<br/>
         <strong>When:</strong> ${escapeHtml(when)}<br/>
         <strong>Duration:</strong> ${escapeHtml(String(session.duration))}</p>
      <p>Please check the schedule for the latest details.</p>
    `;

  // Send emails sequentially to simplify error handling
  for (const r of recipients) {
    try {
      await sendEmail({ to: r.email, subject, html });
    } catch (e) {
      console.error(`Email to ${r.email} failed:`, e?.message || e);
    }
  }
}

function formatSessionWhen(session) {
  try {
    const date = new Date(session.date);
    const dateStr = isNaN(date.getTime()) ? String(session.date) : date.toLocaleString();
    return `${dateStr}${session.time ? ` at ${session.time}` : ""}`;
  } catch (_) {
    return `${session.date || ""}${session.time ? ` at ${session.time}` : ""}`;
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
  