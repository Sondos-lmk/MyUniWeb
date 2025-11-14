import { Event } from "../models/Events/Event.js";

export const archivePastEvents = async (req, res) => {
  try {
    const now = new Date();

    // 🧩 1️⃣ Find all events that should be archived
    const pastEvents = await Event.find({
      endDate: { $lt: now },
      isArchived: false
    }).select("title endDate status isArchived");

    if (pastEvents.length === 0) {
      return res.status(200).json({
        message: "No past events found to archive.",
        archivedEvents: []
      });
    }

    // 🧩 2️⃣ Update them all
    const result = await Event.updateMany(
      { endDate: { $lt: now }, isArchived: false },
      { $set: { isArchived: true, status: "completed" } }
    );

    // 🧩 3️⃣ Respond with details (for easy visual check)
    res.status(200).json({
      message: "Archived past events successfully.",
      matched: result.matchedCount ?? result.nMatched,
      modified: result.modifiedCount ?? result.nModified,
      archivedEvents: pastEvents.map(e => ({
        title: e.title,
        endDate: e.endDate,
        previousStatus: e.status
      }))
    });
  } catch (err) {
    console.error("Error archiving events:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
