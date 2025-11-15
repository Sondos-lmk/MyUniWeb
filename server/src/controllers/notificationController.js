import { EventOfficer } from "../models/Users/EventsOfficer.js";
import { Admin } from "../models/Users/Admin.js";
import { Student } from "../models/Users/Student.js";
import { Staff } from "../models/Users/Staff.js";
import { TA } from "../models/Users/TA.js";
import { Professor } from "../models/Users/Professor.js";

// ✅ Map role → model (supports Admin, Event Officer, Student, Staff, TA, Professor)
const roleModelMap = {
  admin: Admin,
  eventOfficer: EventOfficer,
  student: Student,
  staff: Staff,
  ta: TA,
  professor: Professor,
};

// ✅ Get all notifications for the logged-in user (any supported role)
export const getMyNotifications = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user._id || req.user.id;

    const Model = roleModelMap[role];
    if (!Model) {
      // vendors, etc., can be blocked or get empty
      return res
        .status(403)
        .json({ message: "Notifications are not available for this role." });
    }

    const user = await Model.findById(userId).select("notifications");
    if (!user) {
      return res.status(404).json({ message: `${role} not found.` });
    }

    const list = Array.isArray(user.notifications)
      ? user.notifications
      : [];

    return res.status(200).json({
      success: true,
      count: list.length,
      notifications: [...list].reverse(), // latest first
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching notifications." });
  }
};

// ✅ Clear notifications for the logged-in user (any supported role)
export const clearMyNotifications = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user._id || req.user.id;

    const Model = roleModelMap[role];
    if (!Model) {
      return res
        .status(403)
        .json({ message: "Notifications are not available for this role." });
    }

    await Model.findByIdAndUpdate(userId, { notifications: [] });

    return res.json({ success: true, message: "Notifications cleared." });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res
      .status(500)
      .json({ message: "Server error while clearing notifications." });
  }
};
