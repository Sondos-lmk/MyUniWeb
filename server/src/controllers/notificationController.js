import { EventOfficer } from "../models/Users/EventsOfficer.js";

// ✅ Get all notifications for logged-in Event Officer
export const getMyNotifications = async (req, res) => {
  try {
    // make sure this user is actually an Event Officer
    if (req.user.role !== "eventOfficer") {
      return res.status(403).json({ message: "Access denied. Event Officers only." });
    }

    const officer = await EventOfficer.findById(req.user._id).select("notifications");
    if (!officer) {
      return res.status(404).json({ message: "Event Officer not found." });
    }

    res.status(200).json({
      success: true,
      count: officer.notifications.length,
      notifications: officer.notifications.reverse(), // latest first
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
};

// ✅ Optional: clear notifications
export const clearMyNotifications = async (req, res) => {
  try {
    if (req.user.role !== "eventOfficer") {
      return res.status(403).json({ message: "Access denied. Event Officers only." });
    }

    await EventOfficer.findByIdAndUpdate(req.user._id, { notifications: [] });
    res.json({ success: true, message: "Notifications cleared." });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ message: "Server error while clearing notifications." });
  }
};
