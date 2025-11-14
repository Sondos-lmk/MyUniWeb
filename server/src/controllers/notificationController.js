import { EventOfficer } from "../models/Users/EventsOfficer.js";
import { Admin } from "../models/Users/Admin.js";

import {Student} from "../models/Users/Student.js";
import {Staff} from "../models/Users/Staff.js";
import {TA }from "../models/Users/TA.js";
import {Professor} from "../models/Users/Professor.js";

// Mapping for new roles
const userModelMap = {
  student: Student,
  staff: Staff,
  ta: TA,
  professor: Professor,
};

// ⭐ UPDATED: Get notifications for ANY allowed role
export const getMyNotifications = async (req, res) => {
  try {
    const { role, _id } = req.user;

    // ⭐ EXISTING LOGIC (Admin + Event Officer)
    if (role === "admin" || role === "eventOfficer") {
      const Model = role === "admin" ? Admin : EventOfficer;
      const user = await Model.findById(_id).select("notifications");

      if (!user) {
        return res.status(404).json({ message: `${role} not found.` });
      }

      return res.status(200).json({
        success: true,
        count: user.notifications.length,
        notifications: user.notifications.reverse(),
      });
    }

    // ⭐ NEW LOGIC (Student, Staff, TA, Professor)
    if (userModelMap[role]) {
      const Model = userModelMap[role];
      const user = await Model.findById(_id).select("notifications");

      if (!user) {
        return res.status(404).json({ message: `${role} not found.` });
      }

      return res.status(200).json({
        success: true,
        count: user.notifications.length,
        notifications: user.notifications.reverse(),
      });
    }

    // ❌ Role not supported
    return res.status(403).json({ message: "Role not allowed to access notifications." });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
};

// ⭐ UPDATED: Clear notifications for ALL allowed roles
export const clearMyNotifications = async (req, res) => {
  try {
    const { role, _id } = req.user;

    // ⭐ EXISTING LOGIC
    if (role === "admin" || role === "eventOfficer") {
      const Model = role === "admin" ? Admin : EventOfficer;
      await Model.findByIdAndUpdate(_id, { notifications: [] });

      return res.json({ success: true, message: "Notifications cleared." });
    }

    // ⭐ NEW LOGIC
    if (userModelMap[role]) {
      const Model = userModelMap[role];
      await Model.findByIdAndUpdate(_id, { notifications: [] });

      return res.json({ success: true, message: "Notifications cleared." });
    }

    return res.status(403).json({ message: "Role not allowed." });

  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ message: "Server error while clearing notifications." });
  }
};
