import { GymSession } from "../models/Events/GymSession.js";
import { User } from "../models/Users/User.js";
import { sendEmail } from "../utils/email.js";
import { notifyUsersOfNewEvent } from "../utils/inAppNotification.js";

// ==============================================
// CREATE GYM SESSION (Events Office only)
// ==============================================
export const createGymSession = async (req, res) => {
  try {
    const { title, sessionType, date, time, duration, maxParticipants } = req.body;

    const newSession = new GymSession({
      title: title || `${sessionType} Session`,
      sessionType,
      date,
      time,
      duration,
      maxParticipants,
      createdBy: req.user._id,
      status: "approved",
      type: "gym",
      // optional: allowed roles
      // allowedRoles: ["student", "staff", "ta", "professor"],
    });

    await newSession.save();

    // ⭐ ADDED FROM FIRST CODE — Notify users of new gym session
    try {
      await notifyUsersOfNewEvent(newSession);
    } catch (notifyErr) {
      console.error(
        "Error sending new-event notifications for gym session:",
        notifyErr
      );
    }

    res.status(201).json({
      message: "Gym session created successfully",
      session: newSession,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================================
// VIEW ALL GYM SESSIONS
// ==============================================
export const getGymSchedule = async (req, res) => {
  try {
    // Get start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    // Only show gym sessions from today onwards
    const gymSessions = await GymSession.find({ date: { $gte: startOfToday } })
      .populate('participants', '_id')
      .sort({ date: 1, time: 1 });
    res.status(200).json(gymSessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================================
// UPDATE GYM SESSION (Events Office)
// ==============================================
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
      return res
        .status(400)
        .json({
          message:
            "Cannot edit a session that has already started or passed",
        });
    }

    // Only allow date, time, duration edits
    if (date !== undefined) session.date = date;
    if (time !== undefined) session.time = time;
    if (duration !== undefined) session.duration = duration;

    await session.save();

    // Notify registered users
    try {
      // Populate participants to get user data for emails
      await session.populate('participants');
      await notifyGymParticipants(session, "updated");
    } catch (e) {
      console.error("Failed to notify participants on update:", e?.message || e);
    }

    res
      .status(200)
      .json({ message: "Gym session updated successfully", session });
  } catch (err) {
    console.error("Update Gym Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================================
// REGISTER FOR GYM SESSION
// ==============================================
export const registerForGymSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await GymSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Gym session not found" });
    }

    // ⭐ UPDATED FROM FIRST CODE — safer duplicate check
    if (
      session.participants &&
      session.participants.some((id) => String(id) === String(userId))
    ) {
      return res
        .status(400)
        .json({ message: "You are already registered for this session" });
    }

    // Check if spots available
    if (
      session.participants &&
      session.participants.length >= session.maxParticipants
    ) {
      return res.status(400).json({ message: "This session is full" });
    }

    // Add user to participants
    session.participants = session.participants || [];
    session.participants.push(userId);
    await session.save();

    // Add gym session to user's registeredEvents (for allowed roles)
    try {
      const role = req.user.role?.toLowerCase();
      console.log("🔍 Adding gym session to user's registeredEvents. Role:", role, "UserId:", userId);
      
      const models = {
        student: (await import("../models/Users/Student.js")).Student,
        staff: (await import("../models/Users/Staff.js")).Staff,
        ta: (await import("../models/Users/TA.js")).TA,
        professor: (await import("../models/Users/Professor.js")).Professor,
      };

      const UserModel = models[role];
      if (UserModel) {
        const user = await UserModel.findById(userId);
        if (user) {
          console.log("✅ Found user, current registeredEvents:", user.registeredEvents?.length || 0);
          user.registeredEvents = user.registeredEvents || [];
          user.registeredEvents.push({
            event: sessionId,
            paymentStatus: 'paid', // Gym sessions are free, so mark as paid
            priceAtRegistration: 0,
            registeredAt: new Date()
          });
          await user.save();
          console.log("✅ Successfully added gym session to user's registeredEvents. New count:", user.registeredEvents.length);
        } else {
          console.log("❌ User not found with UserModel");
        }
      } else {
        console.log("❌ No UserModel found for role:", role);
      }
    } catch (userErr) {
      console.error("❌ Error adding to user's registeredEvents:", userErr);
      // Don't fail the whole registration if this fails
    }

    res.status(200).json({
      message: "Successfully registered for the gym session",
      session,
    });
  } catch (err) {
    console.error("Register Gym Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================================
// CANCEL GYM SESSION (Events Office)
// ==============================================
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
      return res
        .status(400)
        .json({
          message:
            "Cannot cancel a session that has already started or passed",
        });
    }

    // Mark session as cancelled
    session.status = "cancelled";
    await session.save();

    // Notify attendees
    try {
      // Populate participants to get user data for emails
      await session.populate('participants');
      await notifyGymParticipants(session, "cancelled");
    } catch (e) {
      console.error("Failed to notify participants on cancel:", e?.message || e);
    }

    res
      .status(200)
      .json({ message: "Gym session cancelled successfully", session });
  } catch (err) {
    console.error("Cancel Gym Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================================
// GET MY REGISTERED SESSIONS (From First Code)
// ==============================================
export const getMyRegisteredSessions = async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await GymSession.find({
      participants: userId,
    }).sort({ date: 1, time: 1 });

    res.status(200).json({
      message: "My registered gym sessions fetched successfully",
      count: sessions.length,
      sessions,
    });
  } catch (err) {
    console.error("Get My Gym Sessions Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================================
// EMAIL NOTIFICATION HELPERS
// ==============================================
async function notifyGymParticipants(session, action) {
  if (!session?.participants?.length) return;

  const allowedRoles = new Set(["student", "staff", "ta", "professor"]);

  const users = await User.find({
    _id: { $in: session.participants },
  })
    .select("email role name")
    .lean();

  const recipients = users.filter((u) =>
    allowedRoles.has((u.role || "").toLowerCase())
  );
  if (!recipients.length) return;

  const when = formatSessionWhen(session);
  const subject =
    action === "cancelled"
      ? `Gym Session Cancelled: ${session.sessionType} (${when})`
      : `Gym Session Updated: ${session.sessionType} (${when})`;

  const html =
    action === "cancelled"
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
    if (isNaN(date.getTime())) {
      return `${session.date || ""}${session.time ? ` at ${session.time}` : ""}`;
    }
    
    // Format date as readable string (e.g., "April 30, 2026")
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
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
