import { EventOfficer } from "../models/Users/EventsOfficer.js";
import { Admin } from "../models/Users/Admin.js";

// ✅ Get all notifications for logged-in Event Officer or Admin
export const getMyNotifications = async (req, res) => {
  try {
    const { role, _id } = req.user;

    if (role !== "eventOfficer" && role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins or Event Officers only." });
    }

    const Model = role === "admin" ? Admin : EventOfficer;
    const user = await Model.findById(_id).select("notifications");

    if (!user) {
      return res.status(404).json({ message: `${role} not found.` });
    }

    res.status(200).json({
      success: true,
      count: user.notifications.length,
      notifications: user.notifications.reverse(),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
};

// ✅ Clear notifications for logged-in Admin or Event Officer
export const clearMyNotifications = async (req, res) => {
  try {
    const { role, _id } = req.user;

    if (role !== "eventOfficer" && role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins or Event Officers only." });
    }

    const Model = role === "admin" ? Admin : EventOfficer;
    await Model.findByIdAndUpdate(_id, { notifications: [] });

    res.json({ success: true, message: "Notifications cleared." });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ message: "Server error while clearing notifications." });
  }
};
