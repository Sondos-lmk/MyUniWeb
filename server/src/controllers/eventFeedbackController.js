import { Event }from "../models/Events/Event.js";
import { User } from "../models/Users/User.js";

export const getEventFeedback = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId)
      .populate("ratings.user", "name email")
      .populate("comments.user", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Feedback fetched successfully",
      ratings: event.ratings || [],
      comments: event.comments || []
    });

  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};
