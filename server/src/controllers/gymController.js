import { GymSession } from "../models/Events/GymSession.js";

// Create new gym session (Events Office only)
export const createGymSession = async (req, res) => {
  try {
    const { date, time, duration, maxParticipants } = req.body;

    // Create the session using discriminator (Event-based)
    const newSession = new GymSession({
      date,
      time,
      duration,
      maxParticipants,
      createdBy: req.user._id, // same pattern as events
      status: "pending", 
      type: "gym",
    });

    await newSession.save();
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
  