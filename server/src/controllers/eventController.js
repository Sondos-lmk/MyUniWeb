import Joi from 'joi';
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { Event, ratingSummary } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { Conference } from '../models/Events/Conference.js';
import { GymSession } from '../models/Events/GymSession.js';
import { Trip } from '../models/Events/Trip.js';
import { Workshop } from '../models/Events/Workshop.js';
import { User } from "../models/Users/User.js";
import { Student } from "../models/Users/Student.js";
import { Staff } from "../models/Users/Staff.js";
import { Professor } from "../models/Users/Professor.js";
import { TA } from "../models/Users/TA.js";
import { EventOfficer } from "../models/Users/EventsOfficer.js";
import { sendEmail } from "../utils/email.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import { Favorite } from "../models/Favorite.js";
import path from "path";
import XLSX from "xlsx";
import mongoose from "mongoose";
import { notifyUsersOfNewEvent } from "../utils/inAppNotification.js";

// --------------------------------------
// JOI VALIDATION SCHEMAS
// --------------------------------------
const baseEventSchema = Joi.object({
  type: Joi.string().valid('bazaar', 'booth', 'conference', 'trip', 'workshop', 'gym').required(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'completed'),
  createdBy: Joi.string().optional(),
  organizerId: Joi.string().optional(),
  allowedRoles: Joi.array().items(Joi.string().valid("student", "staff", "ta", "professor")),

});

const bazaarSchema = baseEventSchema.keys({

  title: Joi.string().required(),
  desc: Joi.string().allow(''),
  location: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date().required(),
  // Registered vendors with their reps and booth size
  registeredVendors: Joi.array().items(
  Joi.object({
    vendor: Joi.string(), // just the user ID
    status: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
    reps: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      })
    ).max(5).required(),
    boothSize: Joi.string().valid('2x2', '4x4').required()
  })
)
});

const boothSchema = baseEventSchema.keys({
  title: Joi.string().required(),
  reps: Joi.array().items(
    Joi.object({ name: Joi.string().required(), email: Joi.string().email().required() })
  ),
  locationInPlatform: Joi.string().required(),
  registeredVendors: Joi.array().items(
    Joi.object({
      vendor: Joi.string(),
      status: Joi.string().valid('pending','approved','rejected').default('approved'),
      reps: Joi.array().items(
        Joi.object({ name: Joi.string().required(), email: Joi.string().email().required() })
      ).max(5).required(),
      boothSize: Joi.string().valid('2x2','4x4').required() // keep only here
    })
  ),
});


const conferenceSchema = baseEventSchema.keys({
  title: Joi.string().required(),
  desc: Joi.string().allow(''),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date(),
  fullAgenda: Joi.string().allow(''),
  websiteLink: Joi.string().uri().required().messages({
    'string.uri': 'Link format is incorrect. Please enter a valid URL (e.g., https://example.com)',
    'any.required': 'Website link is required'
  }),
  requiredBudget: Joi.number(),
  fundraisingSource: Joi.string().valid('GUC', 'External'),
  extraRequiredResource: Joi.string().allow(''),
});

const tripSchema = baseEventSchema.keys({
  title: Joi.string().required(),
  desc: Joi.string().allow(''),
  location: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date().required(),
  price: Joi.number().required(),
  capacity: Joi.number().integer().min(1).required(),
});

const workshopSchema = baseEventSchema.keys({
  title: Joi.string().required(),
  desc: Joi.string().allow(''),
  location: Joi.string().valid('GUC Cairo', 'GUC Berlin').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date().required(),
  requiredBudget: Joi.number().required(),
  fundraisingSource: Joi.string().valid('GUC', 'External').required(),
  fullAgenda: Joi.string().allow(''),
  responsibleFaculty: Joi.string().valid(
    'MET',
    'IET',
    'EMS',
    'Pharma',
    'Business Informatics',
    'Management',
    'Applied Arts',
    'Architecture'
  ),
  professorsParticipating: Joi.array().items(Joi.string()),
  professorNames: Joi.array().items(Joi.string()),
  extraRequiredResource: Joi.string().allow(''),
  capacity: Joi.number().required(),
});

const gymSchema = baseEventSchema.keys({
  date: Joi.date().required(),
  time: Joi.string().required(),
  duration: Joi.number().required(),
  maxParticipants: Joi.number().required(),
});

// Utility: choose schema/model dynamically
const getValidationSchema = (type) => {
  switch (type) {
    case 'bazaar': return bazaarSchema;
    case 'booth': return boothSchema;
    case 'conference': return conferenceSchema;
    case 'trip': return tripSchema;
    case 'workshop': return workshopSchema;
    case 'gym': return gymSchema;
    default: return baseEventSchema;
  }
};

const getEventModel = (type) => {
  switch (type) {
    case 'bazaar': return Bazaar;
    case 'booth': return Booth;
    case 'conference': return Conference;
    case 'trip': return Trip;
    case 'workshop': return Workshop;
    case 'gym': return GymSession;
    default: return Event;
  }
};

// Helper: determine if event is finished (for comments, attended events, etc.)
const isEventFinished = (e) => {
  if (!e) return false;
  const end = e.endDate || e.date || e.updatedAt;
  return (
    e.status === 'completed' ||
    (end && new Date(end) < new Date())
  );
};

// --------------------------------------
// CONTROLLERS
// --------------------------------------

// Get all events (optionally filter by type)
export const getAllEvents = async (req, res) => {
  try {
    const { type, title, location, date } = req.query;

    // Pick correct model
    const Model = type ? getEventModel(type) : Event;

    // Build query
    const query = {};

    // If user selected a type, we filter by it
    if (type) {
      query.type = type;
    } else {
      // Otherwise EXCLUDE only booths (include gym sessions)
      query.type = { $nin: ["booth"] };
    }

    // ✅ Only show approved or completed events (exclude pending/rejected)
    query.status = { $in: ["approved", "completed"] };

    if (title) query.title = { $regex: title, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };

    if (date) {
      const targetDate = new Date(date);
      query.$or = [
        { startDate: { $lte: targetDate }, endDate: { $gte: targetDate } },
        { date: targetDate }
      ];
    }

    let sortOrder = req.query.sort === "desc" ? -1 : 1;

    const events = await Model.find(query)
      .populate('ratings.user', 'name')
      .populate('comments.user', 'name')
      .sort({ startDate: sortOrder });

    res.status(200).json({
      message: "Filtered events fetched successfully",
      count: events.length,
      events,
    });

  } catch (err) {
    console.error("Error filtering events:", err);
    res.status(500).json({ error: err.message });
  }
};




export const getEventById = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Populate professors and creator details for workshops so names are available in request-edit view
    if (event.type === 'workshop') {
      event = await event.populate([
        { path: 'createdBy', select: 'name email role' },
        { path: 'professorsParticipating', select: 'name email role' },
      ]);
    }

    // Populate vendor details for bazaar events
    if (event.type === 'bazaar' && event.registeredVendors && event.registeredVendors.length > 0) {
      event = await event.populate({
        path: 'registeredVendors.vendor',
        select: 'companyName email'
      });
    }

    // Attach derived rating using helper (number or 'unrated')
    const rating = ratingSummary(event);
    const eventObj = event.toObject ? event.toObject() : event;
    eventObj.rating = rating;

    res.status(200).json(eventObj);
  } catch (err) {
    console.error('Error in getEventById:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL UPCOMING EVENTS (For All Roles)
export const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();
    console.log("🔍 Fetching upcoming events, current time:", now);

    // Helper function to format each event consistently
    const formatEvent = (event, type) => {
      const baseEvent = {
        id: event._id,
        type,
        title: event.title,
        description: event.desc || "",
        location: event.location || event.locationInPlatform || "N/A",
        startDate: event.startDate,
        endDate: event.endDate,
        registrationDeadline: event.registrationDeadline,
        vendors:
          type === "bazaar" || type === "booth"
            ? event.registeredVendors || []
            : [],
      };

      // Only include status for workshops and booths (which require approval)
      if (type === "workshop" || type === "booth") {
        baseEvent.status = event.status || "N/A";
      }

      return baseEvent;
    };

    // Fetch approved upcoming events from all collections in parallel
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const [workshops, trips, bazaars, booths, conferences, gymSessions] = await Promise.all([
      Workshop.find({ startDate: { $gt: now }, status: "approved" }),
      Trip.find({ startDate: { $gt: now }, status: "approved" }),
      Bazaar.find({ startDate: { $gt: now }, status: "approved" }).populate(
        "registeredVendors.vendor",
        "name email"
      ),
      Booth.find({ status: "approved" }).populate(
        "registeredVendors.vendor",
        "name email"
      ),
      Conference.find({ startDate: { $gt: now }, status: "approved" }),
      GymSession.find({ date: { $gte: startOfToday }, status: "approved" }).select('+title'),
    ]);

    // Combine all events into a single list
    const allUpcoming = [
      ...workshops.map((e) => formatEvent(e, "workshop")),
      ...trips.map((e) => formatEvent(e, "trip")),
      ...bazaars.map((e) => formatEvent(e, "bazaar")),
     // ...booths.map((e) => formatEvent(e, "booth")),
      ...conferences.map((e) => formatEvent(e, "conference")),
     /* ...gymSessions.map((e) => ({
        id: e._id,
        type: "gym",
        title: e.title,
        sessionType: e.sessionType,
        date: e.date,
        time: e.time,
        duration: e.duration,
        maxParticipants: e.maxParticipants,
        participants: e.participants?.length || 0,
      })),*/
    ];

    // Sort by startDate (earliest first)
    allUpcoming.sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate) : a.date ? new Date(a.date) : 0;
      const bDate = b.startDate ? new Date(b.startDate) : b.date ? new Date(b.date) : 0;
      return aDate - bDate;
    });

    res.status(200).json({
      message: "Approved upcoming events fetched successfully",
      count: allUpcoming.length,
      events: allUpcoming,
    });
  } catch (err) {
    console.error("Error fetching approved upcoming events:", err);
    res.status(500).json({ error: err.message });
  }
};

// SEARCH EVENTS BY NAME OF EVENT/PROFFESSOR OR TYPE
export const searchEvents = async (req, res) => {
  try {
    const { name, type } = req.query;
    const searchRegex = name ? new RegExp(name, "i") : null; // Case-insensitive search

    // Common filters: only approved events
    const baseFilter = { status: "approved" };

    // Helper: formats all events consistently
    const formatEvent = (event, type) => {
      const baseEvent = {
        id: event._id,
        type,
        title: event.title,
        description: event.desc || "",
        location: event.location || event.locationInPlatform || "N/A",
        startDate: event.startDate,
        endDate: event.endDate,
      };

      // Only include status for workshops and booths (which require approval)
      if (type === "workshop" || type === "booth") {
        baseEvent.status = event.status;
      }

      return baseEvent;
    };

    // Build a list of promises depending on requested type
    const promises = [];

    const include = (wanted) =>
      !type || type.toLowerCase() === wanted; // if no type filter, include all

    if (include("workshop")) {
      promises.push(
        Workshop.find({
          ...baseFilter,
          ...(searchRegex ? { $or: [{ title: searchRegex }, { desc: searchRegex }] } : {}),
        }).populate("professorsParticipating", "name email")
      );
    }

    if (include("trip")) {
      promises.push(
        Trip.find({
          ...baseFilter,
          ...(searchRegex ? { $or: [{ title: searchRegex }, { desc: searchRegex }] } : {}),
        })
      );
    }

    if (include("bazaar")) {
      promises.push(
        Bazaar.find({
          ...baseFilter,
          ...(searchRegex ? { $or: [{ title: searchRegex }, { desc: searchRegex }] } : {}),
        }).populate("registeredVendors.vendor", "name email")
      );
    }

    if (include("booth")) {
      promises.push(
        Booth.find({
          ...baseFilter,
          ...(searchRegex ? { $or: [{ title: searchRegex }] } : {}),
        }).populate("registeredVendors.vendor", "name email")
      );
    }

    if (include("conference")) {
      promises.push(
        Conference.find({
          ...baseFilter,
          ...(searchRegex ? { $or: [{ title: searchRegex }, { desc: searchRegex }] } : {}),
        })
      );
    }

    if (include("gym")) {
      promises.push(
        GymSession.find({
          ...baseFilter,
        })
      );
    }

    // Run all applicable searches in parallel
    const results = await Promise.all(promises);

    // Flatten and label results
    const allResults = [];

    if (include("workshop"))
      allResults.push(...results.shift().map((e) => formatEvent(e, "workshop")));
    if (include("trip"))
      allResults.push(...results.shift().map((e) => formatEvent(e, "trip")));
    if (include("bazaar"))
      allResults.push(...results.shift().map((e) => formatEvent(e, "bazaar")));
    if (include("booth"))
      allResults.push(...results.shift().map((e) => formatEvent(e, "booth")));
    if (include("conference"))
      allResults.push(...results.shift().map((e) => formatEvent(e, "conference")));
    if (include("gym"))
      allResults.push(...results.shift().map((e) => ({
        id: e._id,
        type: "gym",
        title: e.title,
        sessionType: e.sessionType,
        date: e.date,
        time: e.time,
        duration: e.duration,
        maxParticipants: e.maxParticipants,
        participants: e.participants?.length || 0,
      })));

    // If searching by professor name, refine workshops
    let finalResults = allResults;
    if (name) {
      finalResults = allResults.filter((ev) => {
        if (ev.type === "workshop" && ev.professorsParticipating) {
          return ev.professorsParticipating.some((p) =>
            p.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        return (
          ev.title.toLowerCase().includes(name.toLowerCase()) ||
          ev.description.toLowerCase().includes(name.toLowerCase())
        );
      });
    }

    if (finalResults.length === 0) {
      return res.status(404).json({ message: "No events found matching your search." });
    }

    res.status(200).json({
      message: "Search results fetched successfully",
      count: finalResults.length,
      events: finalResults,
    });
  } catch (err) {
    console.error("Error searching events:", err);
    res.status(500).json({ error: err.message });
  }
};

// ROLES allowed to favorite events
const FAVORITE_ALLOWED = ["student", "staff", "ta", "professor"];

// POST /api/events/:id/favorite
export const addEventToFavorites = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = (req.user.role || "").toLowerCase();
    const eventId = req.params.id;

    if (!FAVORITE_ALLOWED.includes(role)) {
      return res.status(403).json({ message: "Only students, staff, TAs, and professors can favorite events." });
    }

    // Ensure the event exists
    const exists = await Event.exists({ _id: eventId });
    if (!exists) return res.status(404).json({ message: "Event not found" });

    // Upsert & add once
    const fav = await Favorite.findOneAndUpdate(
      { user: userId },
      { $addToSet: { events: eventId } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "Event added to favorites", favoritesCount: fav.events.length });
  } catch (err) {
    console.error("addEventToFavorites error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/events/:id/favorite
export const removeEventFromFavorites = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = (req.user.role || "").toLowerCase();
    const eventId = req.params.id;

    if (!FAVORITE_ALLOWED.includes(role)) {
      return res.status(403).json({ message: "Only students, staff, TAs, and professors can unfavorite events." });
    }

    const fav = await Favorite.findOneAndUpdate(
      { user: userId },
      { $pull: { events: eventId } },
      { new: true }
    );

    // If user has no favorites doc yet, just succeed silently
    const count = fav?.events?.length || 0;
    return res.status(200).json({ message: "Event removed from favorites", favoritesCount: count });
  } catch (err) {
    console.error("removeEventFromFavorites error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/events/my/favorites
export const getMyFavoriteEvents = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = (req.user.role || "").toLowerCase();

    if (!FAVORITE_ALLOWED.includes(role)) {
      return res.status(403).json({ message: "Only students, staff, TAs, and professors can view favorites." });
    }

    const fav = await Favorite.findOne({ user: userId })
      .populate("events", "title type startDate endDate location desc status createdAt date time duration sessionType maxParticipants");

    return res.status(200).json({
      message: "Favorites fetched successfully",
      count: fav?.events?.length || 0,
      events: fav?.events || [],
    });
  } catch (err) {
    console.error("getMyFavoriteEvents error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ⭐ RATE EVENT
export const rateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const userId = req.user._id || req.user.id;

    // validate rating range
    if (![1, 2, 3, 4, 5].includes(Number(value))) {
      return res.status(400).json({ message: "Rating must be 1–5" });
    }

    // find event
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // allowed roles
    const allowed = ["student", "staff", "ta", "professor"];
    if (!allowed.includes((req.user.role || "").toLowerCase()))
      return res.status(403).json({ message: "Not allowed" });

    // must be registered (either registeredUsers, registeredStudents, or participants for gym)
    const userIdStr = String(userId);
    const inRegisteredUsers = Array.isArray(event.registeredUsers) &&
      event.registeredUsers.some((u) => String(u) === userIdStr);
    const inRegisteredStudents = Array.isArray(event.registeredStudents) &&
      event.registeredStudents.some((u) => String(u) === userIdStr);
    const inParticipants = Array.isArray(event.participants) &&
      event.participants.some((u) => String(u) === userIdStr);

    if (!inRegisteredUsers && !inRegisteredStudents && !inParticipants) {
      return res.status(403).json({ message: "You did not attend this event" });
    }

    // prevent rating before start date
    const start = event.startDate || event.date;
    const now = new Date();
    const isUpcoming = start && new Date(start) > now;
    if (isUpcoming) {
      return res.status(400).json({ message: "Event has not started yet" });
    }

    // prevent rating multiple times
    event.ratings = event.ratings || [];
    const alreadyRated = event.ratings.some(
      (r) => String(r.user) === userIdStr
    );
    if (alreadyRated) {
      return res.status(403).json({ message: "You have already rated this event" });
    }

    // save rating
    event.ratings.push({ user: userId, value: Number(value) });
    await event.save();

    // calculate average (1 decimal)
    const sum = event.ratings.reduce((a, r) => a + Number(r.value || 0), 0);
    const avg = event.ratings.length ? sum / event.ratings.length : 0;
    const roundedAvg = Math.round(avg * 10) / 10;

    return res.status(200).json({
      message: "Rating submitted successfully",
      average: roundedAvg,
      ratingsCount: event.ratings.length,
    });
  } catch (err) {
    console.error("Rate Event Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// 💬 ADD COMMENT
// POST /api/events/:id/comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const allowed = ["student", "staff", "ta", "professor"];
    if (!allowed.includes((req.user.role || "").toLowerCase())) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // must be registered (either registeredUsers, registeredStudents, or participants for gym)
    const userIdStr = String(userId);
    const inRegisteredUsers = Array.isArray(event.registeredUsers) &&
      event.registeredUsers.some((u) => String(u) === userIdStr);
    const inRegisteredStudents = Array.isArray(event.registeredStudents) &&
      event.registeredStudents.some((u) => String(u) === userIdStr);
    const inParticipants = Array.isArray(event.participants) &&
      event.participants.some((u) => String(u) === userIdStr);

    if (!inRegisteredUsers && !inRegisteredStudents && !inParticipants) {
      return res.status(403).json({ message: "You did not attend this event" });
    }

    // must be finished
    if (!isEventFinished(event)) {
      return res
        .status(400)
        .json({ message: "You can comment only after the event is finished" });
    }

    // one comment per user (block duplicates)
    event.comments = event.comments || [];
    const alreadyCommented = event.comments.some(
      (c) => String(c.user) === userIdStr
    );
    if (alreadyCommented) {
      return res
        .status(409)
        .json({ message: "You have already commented on this event" });
    }

    event.comments.push({
      user: userId,
      text: String(text).trim(),
      createdAt: new Date(),
    });

    await event.save();

    // return only safe fields
    const last = event.comments[event.comments.length - 1];
    return res.status(201).json({
      message: "Comment added",
      comment: {
        _id: last._id,
        user: last.user,
        text: last.text,
        createdAt: last.createdAt,
      },
      commentsCount: event.comments.length,
    });
  } catch (err) {
    console.error("Add Comment Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
    console.log("🧾 Received body:", req.body);
    const { type } = req.body;
    const schema = getValidationSchema(type);

    // validate only what the user sends
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // build payload after validation
    const payload = { ...value };

    // attach the logged-in user as organizer / creator
    const authUserId = req.user?.id || req.user?._id;
    if (authUserId) {
      payload.organizerId = authUserId;
      payload.createdBy = authUserId;
    }

    // ✅ Optional roles allowed to register for the event
    payload.allowedRoles = req.body.allowedRoles || ["student", "staff", "ta", "professor"];

    // Auto-approve trips, bazaars, and conferences
    if (type === "trip" || type === "bazaar" || type === "conference") {
      payload.status = "approved";
    }

    const Model = getEventModel(type);
    const newEvent = new Model(payload);
    await newEvent.save();

    // ✅ New: in-system notification for newly added event
    try {
      await notifyUsersOfNewEvent(newEvent);
    } catch (notifyErr) {
      console.error("Error sending new-event notifications:", notifyErr);
    }

    res.status(201).json({
      message: `${type} created successfully`,
      event: newEvent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // find the existing event (Trip, Bazaar, etc.)
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // only event officers can update trips, so we already checked via middleware
    if (event.type === 'trip') {
      const now = new Date();
      const startDate = new Date(event.startDate);

      if (startDate <= now) {
        return res
          .status(400)
          .json({ message: 'Cannot edit a trip that has already started' });
      }
    }

    // ✅ allow partial update: only apply fields that were provided
    Object.keys(updates).forEach((key) => {
      event[key] = updates[key];
    });

    await event.save();

    res.status(200).json({
      message: 'Trip updated successfully',
      event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Delete event
// ✅ Requirement 4: Delete event only if no one registered yet
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find event by ID
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event has any registered users or vendors
    const hasRegistrations =
      (event.registeredUsers && event.registeredUsers.length > 0) ||
      (event.registeredVendors && event.registeredVendors.length > 0);

    if (hasRegistrations) {
      return res.status(400).json({
        message: "Cannot delete event — users or vendors are already registered.",
      });
    }

    // Allow admin or event officer only
    if (!["admin", "eventOfficer"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Admin or Event Officer only" });
    }

    // Delete event
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    console.error("Delete Event Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Approve / Reject event
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only approve if it's still pending
    if (event.status !== "pending") {
      return res.status(400).json({ message: "Only pending events can be approved" });
    }

    event.status = "approved";
    await event.save();

    // 🔹 NEW: notify professor if this is a workshop
    try {
      if (event.type === "workshop" && event.createdBy) {
        const professor = await Professor.findById(event.createdBy);
        if (professor) {
          const msg = `✅ Your workshop "${event.title}" has been approved by the Events Office.`;
          professor.notifications = professor.notifications || [];
          professor.notifications.push(msg);
          await professor.save();
        }
      }
    } catch (notifyErr) {
      console.error("Error sending approval notification to professor:", notifyErr);
      // Don't block main response if notification fails
    }

    res.status(200).json({
      message: "Event approved successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Approve Event Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



//  Reject event
export const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status !== "pending") {
      return res.status(400).json({ message: "Only pending events can be rejected" });
    }

    event.status = "rejected";
    await event.save();

    // 🔹 NEW: notify professor if this is a workshop
    try {
      if (event.type === "workshop" && event.createdBy) {
        const professor = await Professor.findById(event.createdBy);
        if (professor) {
          const msg = `❌ Your workshop "${event.title}" has been rejected by the Events Office.`;
          professor.notifications = professor.notifications || [];
          professor.notifications.push(msg);
          await professor.save();
        }
      }
    } catch (notifyErr) {
      console.error("Error sending rejection notification to professor:", notifyErr);
      // Don't block main response if notification fails
    }

    res.status(200).json({
      message: "Event rejected successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Reject Event Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const registerForWorkshopOrTrip = async (req, res) => {
  // 1. Start a Mongoose session
  const session = await mongoose.startSession();
  
  try {
    // 2. Start the transaction
    session.startTransaction();

    const { eventId } = req.params;
    const userId = req.user._id || req.user.id;

    // 3. Find event *using the session*
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw new Error("Event not found");
    }

    // ✅  NEW: Role restriction check (this is the important part)
    const userRole = req.user.role?.toLowerCase();
    if (event.allowedRoles && !event.allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Registration not allowed for ${userRole}s for this event.`,
      });
    }

    // 2️⃣ Allow only workshops and trips
    // 4. Validate event type
    if (event.type !== "workshop" && event.type !== "trip") {
      throw new Error("You can only register for workshops or trips");
    }

    // 5. Validate user role
    const allowedRoles = ["student", "staff", "ta", "professor"];
    if (!allowedRoles.includes(req.user.role)) {
      throw new Error("This role is not allowed to register for events");
    }

    // 6. Get the price
    let priceToSave;
    if (event.type === 'trip') {
      priceToSave = event.price;
    } else if (event.type === 'workshop') {
      priceToSave = event.requiredBudget;
    }

    // 7. Validate the price
    if (priceToSave === null || priceToSave === undefined) {
      throw new Error(`Event ${eventId} is missing its price/budget field.`);
    }

    // 8. Find the user *using the session*
    const roleModelMap = {
      student: Student,
      staff: Staff,
      ta: TA,
      professor: Professor,
    };
    const UserModel = roleModelMap[req.user.role];
    const user = await UserModel.findById(userId).session(session);

    if (!user) {
      throw new Error("User not found.");
    }

    // 9. Check for duplicates and clean up invalid registrations

    event.registeredUsers = event.registeredUsers || [];
    user.registeredEvents = user.registeredEvents || [];
    
    // Clean up any invalid registrations (missing event or price)
    user.registeredEvents = user.registeredEvents.filter((reg) => {
      return reg && reg.event && reg.priceAtRegistration != null;
    });
    
    if (event.registeredUsers.includes(userId)) {
      throw new Error("Already registered (in event list)");
    }
    // Safe check: handle both ObjectId and plain ID strings
    if (user.registeredEvents.some((reg) => {
      if (!reg || !reg.event) return false;
      return reg.event.equals ? reg.event.equals(eventId) : reg.event.toString() === eventId.toString();
    })) {
      throw new Error("Already registered (in user list)");
    }

    // 10. Update both documents
    event.registeredUsers.push(userId);
    user.registeredEvents.push({ 
      event: eventId,
      priceAtRegistration: priceToSave 
    });

    // 11. Save both documents *using the session*
    await event.save({ session });
    await user.save({ session });

    // 12. Commit the transaction if both saves worked
    await session.commitTransaction();

    res.status(200).json({ message: "Successfully registered for the event" });

  } catch (err) {
    // 13. If anything failed, abort the transaction
    await session.abortTransaction();
    
    console.error("Error registering for event (transaction aborted):", err);
    // Send the error message from the 'throw new Error'
    res.status(500).json({ error: err.message || "Server error" });
  } finally {
    // 14. Always end the session
    session.endSession();
  }
};


export const getMyRegisteredEventsFromUser = async (req, res) => {
  try {
    // 1️⃣ Get user ID from the JWT (set by requireAuth)
    const userId = req.user.id || req.user._id;

    // 2️⃣ Determine which user model to use (based on role)
    const role = req.user.role?.toLowerCase();
    const models = {
      student: (await import("../models/Users/Student.js")).Student,
      staff: (await import("../models/Users/Staff.js")).Staff,
      ta: (await import("../models/Users/TA.js")).TA,
      professor: (await import("../models/Users/Professor.js")).Professor,
    };

    const Model = models[role];
    if (!Model)
      return res
        .status(403)
        .json({ message: "This role cannot register for events" });

    // 3️⃣ Find the user and populate their registered events
    const user = await Model.findById(userId).populate(
      "registeredEvents.event",
      "title type startDate endDate registrationDeadline location description sessionType time duration date"
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // 4️⃣ Filter out any registrations where the event was deleted
    const validRegistrations = (user.registeredEvents || []).filter(
      (reg) => reg.event != null
    );

    res.status(200).json(validRegistrations);

  } catch (err) {
    console.error("❌ Error in getMyRegisteredEventsFromUser:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const exportEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Ensure only Event Officers can access
    if (req.user.role !== "eventOfficer") {
      return res.status(403).json({ message: "Access denied. Event Officers only." });
    }

    // ✅ Fetch event
    const event = await Event.findById(id).populate("registeredUsers", "name email idNumber role");
    if (!event) return res.status(404).json({ message: "Event not found." });

    // ✅ Skip conferences
    if (event.type === "conference") {
      return res.status(400).json({ message: "Cannot export conference participants." });
    }

    // ✅ Check if anyone is registered
    if (!event.registeredUsers || event.registeredUsers.length === 0) {
      return res.status(400).json({ message: "No registered users for this event." });
    }

    // ✅ Prepare data for Excel
    const data = event.registeredUsers.map((user) => ({
      Name: user.name || "N/A",
      Email: user.email || "N/A",
      ID: user.idNumber || "N/A",
      Role: user.role || "N/A",
    }));

    // ✅ Convert to worksheet and buffer
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // ✅ Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${event.title}_registrations.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(buffer);
  } catch (error) {
    console.error("Error exporting registrations:", error);
    res.status(500).json({ message: "Server error while exporting registrations." });
  }
};


// ----------------------
// CREATE WORKSHOP BY PROFESSOR
// ----------------------
export const createWorkshop = async (req, res) => {
  try {
    // ✅ Ensure only professors can create workshops
    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Access denied. Professors only." });
    }

    // ✅ Use the workshop validation schema
    const { type = "workshop" } = req.body;
    req.body.organizerId = req.user._id.toString();
    const schema = getValidationSchema(type);

    // ✅ Validate user input
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // ✅ Add system-controlled fields AFTER validation
    value.organizerId = req.user._id;
    value.createdBy = req.user._id;
    value.status = "pending";

    // ✅ Normalize any free-text professor names if provided
    if (req.body.professorNames && Array.isArray(req.body.professorNames)) {
      value.professorNames = req.body.professorNames
        .map((n) => String(n).trim())
        .filter(Boolean);
    }

    // ✅ Automatically include the creating professor
    value.professorsParticipating = [req.user._id];

    // ✅ Save the workshop
    const newWorkshop = new Workshop(value);
    await newWorkshop.save();

    // Notify all Event Officers about this new pending workshop
    const eventOfficers = await EventOfficer.find();
    const notificationMessage = `📢 New workshop request from Professor ${
      req.user.name || "Unknown"
    }: "${newWorkshop.title}"`;

    await Promise.all(
      eventOfficers.map(async (officer) => {
        officer.notifications.push(notificationMessage);
        await officer.save();
      })
    );

    // ✅ New: general "new event" notification for all allowed roles
    try {
      await notifyUsersOfNewEvent(newWorkshop);
    } catch (notifyErr) {
      console.error("Error sending new-event notifications for workshop:", notifyErr);
    }

    res.status(201).json({
      message: "Workshop created successfully and is pending approval.",
      workshop: newWorkshop,
    });
  } catch (error) {
    console.error("Error creating workshop:", error);
    res.status(500).json({
      message: "Server error while creating workshop.",
      error: error.message,
    });
  }
};



// ----------------------
// UPDATE WORKSHOP BY PROFESSOR
// ----------------------
export const updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the workshop
    const workshop = await Workshop.findById(id);
    if (!workshop)
      return res.status(404).json({ message: "Workshop not found." });

    // Ensure only the creator can edit
    if (workshop.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You can only edit your own workshops." });
    }

    // Apply updates
    Object.assign(workshop, req.body);

    // When a professor edits, reset status to pending approval
    workshop.status = "pending";

    await workshop.save();

    res.status(200).json({
      message: "Workshop updated successfully and is pending approval.",
      workshop,
    });
  } catch (error) {
    console.error("Error updating workshop:", error);
    res.status(500).json({
      message: "Server error while updating workshop.",
      error: error.message,
    });
  }
};
// ----------------------
// PROFESSOR: GET MY NOTIFICATIONS
// ----------------------
export const getProfessorNotifications = async (req, res) => {
  try {
    const professorId = req.user._id || req.user.id;

    const professor = await Professor.findById(professorId).select("notifications name");
    if (!professor) {
      return res.status(404).json({ message: "Professor not found." });
    }

    res.status(200).json({
      message: "Notifications fetched successfully.",
      professorName: professor.name,
      notifications: professor.notifications || [],
    });
  } catch (error) {
    console.error("Error fetching professor notifications:", error);
    res.status(500).json({
      message: "Server error while fetching notifications.",
      error: error.message,
    });
  }
};

// EventsOffice request edits in workshops
export const requestWorkshopEdit = async (req, res) => {
  try {
    // ✅ Ensure only Event Officers can perform this action
    if (req.user.role !== "eventOfficer") {
      return res.status(403).json({ message: "Access denied. Event Officers only." });
    }

    const { id } = req.params;
    const { editRequest } = req.body;

    // ✅ Find the workshop
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ message: "Workshop not found." });

    // ✅ Save the edit request
    workshop.editRequest = editRequest;
    workshop.status = "needs revision"; // optional: add this status in schema if not present
    await workshop.save();

    res.status(200).json({
      message: "Edit request saved successfully.",
      workshop
    });
  } catch (error) {
    console.error("Error requesting workshop edit:", error);
    res.status(500).json({ message: "Server error while requesting workshop edit.", error: error.message });
  }
};

// Register for a trip
export const registerForTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { studentId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    if (new Date() > new Date(trip.registrationDeadline))
      return res.status(400).json({ error: 'Registration deadline passed' });

    if (trip.registeredStudents.includes(studentId))
      return res.status(400).json({ error: 'Already registered' });

    if (trip.registeredStudents.length >= trip.capacity)
      return res.status(400).json({ error: 'Trip full' });

    trip.registeredStudents.push(studentId);
    if (trip.registeredStudents.length >= trip.capacity) trip.status = 'Closed';
    await trip.save();

    res.status(200).json({ message: 'Registration successful', trip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getPendingWorkshops = async (req, res) => {
  try {
    // ✅ Fetch from Event collection, not Workshop
    const workshops = await Event.find({ type: "workshop", status: "pending" })
      .populate("createdBy", "name email role") // assuming workshops are created by professors
      .populate("professorsParticipating", "name email");

    if (!workshops || workshops.length === 0) {
      return res.status(200).json({
        message: "No pending workshops found.",
        workshops: [],
      });
    }

    res.status(200).json({
      message: "Pending workshops fetched successfully.",
      workshops,
    });
  } catch (err) {
    console.error("Error fetching pending workshops:", err);
    res.status(500).json({
      message: "Failed to fetch pending workshops.",
      error: err.message,
    });
  }
};
// ----------------------
// PROFESSOR: VIEW WORKSHOP PARTICIPANTS
// ----------------------
export const getWorkshopParticipants = async (req, res) => {
  try {
    const { id } = req.params; // workshop id from URL
    const professorId = req.user._id || req.user.id;

    // ✅ Find workshop created by this professor
    const workshop = await Workshop.findOne({
      _id: id,
      createdBy: professorId,
    }).populate("registeredUsers", "name email idNumber role");

    if (!workshop) {
      return res.status(404).json({
        message: "Workshop not found or you are not the creator of this workshop.",
      });
    }

    // ✅ Calculate counts
    const capacity = workshop.capacity || 0;
    const registeredCount = (workshop.registeredUsers || []).length;
    const remainingSpots = Math.max(0, capacity - registeredCount);

    // ✅ Shape response
    const participants = (workshop.registeredUsers || []).map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      idNumber: u.idNumber,
      role: u.role,
    }));

    return res.status(200).json({
      workshopId: workshop._id,
      title: workshop.title,
      capacity,
      registeredCount,
      remainingSpots,
      participants,
    });
  } catch (error) {
    console.error("Error fetching workshop participants:", error);
    return res.status(500).json({
      message: "Server error while fetching workshop participants.",
      error: error.message,
    });
  }
};

export const sendCertificate = async (req, res) => {
  try {
    const { studentName, studentEmail, workshopTitle, date } = req.body;

    // Generate PDF
    const filePath = await generateCertificate(studentName, workshopTitle, date);

    // Send email with attachment
    await sendEmail({
      to: studentEmail,
      subject: `Certificate of Attendance - ${workshopTitle}`,
      html: `
        <p>Dear ${studentName},</p>
        <p>Congratulations! 🎓 You have successfully attended <strong>${workshopTitle}</strong>.</p>
        <p>Your certificate of attendance is attached below.</p>
        <p>Best regards,<br/>GUC Events Team</p>
      `,
      attachments: [
        {
          filename: path.basename(filePath),
          path: filePath,
        },
      ],
    });

    res.status(200).json({ message: "Certificate sent successfully!" });
  } catch (err) {
    console.error("Certificate Error:", err);
    res.status(500).json({ message: "Failed to send certificate." });
  }
};

export const getProfessorWorkshops = async (req, res) => {
  try {
    // ✅ Convert professor ID to ObjectId to match database type
    const professorId = new mongoose.Types.ObjectId(req.user._id);

    // ✅ Find workshops created by this professor
    const workshops = await Workshop.find({ createdBy: professorId })
      .populate("professorsParticipating", "name email");

    // ✅ If no workshops found, return an empty array message
    if (!workshops || workshops.length === 0) {
      return res.status(200).json({
        message: "No workshops found for this professor.",
        workshops: [],
      });
    }

    // ✅ Otherwise return all workshops
    res.status(200).json({
      message: "Workshops fetched successfully.",
      workshops,
    });
  } catch (error) {
    console.error("Error fetching professor workshops:", error);
    res.status(500).json({
      message: "Server error while fetching workshops.",
      error: error.message,
    });
  }
};

// ✅ Get attended events (for rating & comments list)
export const getAttendedEvents = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const now = new Date();

    // Get the user with their registeredEvents to check payment status
    const user = await req.user.constructor.findById(userId);
    
    if (!user || !user.registeredEvents) {
      return res.status(200).json({ events: [] });
    }

    // Get event IDs where user has paid
    const paidEventIds = user.registeredEvents
      .filter(reg => reg.paymentStatus === 'paid')
      .map(reg => reg.event);

    if (paidEventIds.length === 0) {
      return res.status(200).json({ events: [] });
    }

    // Find events that user paid for AND have ended
    const events = await Event.find({
      _id: { $in: paidEventIds },
      $or: [
        { endDate: { $lt: now } },
        { date: { $lt: now } },
      ],
      status: { $in: ["approved", "completed"] },
    })
    .populate('ratings.user', 'name')
    .populate('comments.user', 'name')
    .sort({ endDate: -1, date: -1 });

    const withRatings = events.map((e) => {
      const avgOrUnrated = ratingSummary(e);
      const isUnrated = avgOrUnrated === 'unrated';

      return {
        ...e.toObject(),
        averageRating: isUnrated ? null : avgOrUnrated,
        rating: avgOrUnrated,
      };
    });

    return res.status(200).json({ events: withRatings });
  } catch (err) {
    console.error("getAttendedEvents error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get attendees report (total attendees per event) with optional filters
export const getAttendeesReport = async (req, res) => {
  try {
    const { name, type, startDate, endDate } = req.query;

    // Build query for workshops, trips, and gym sessions
    const conditions = [];
    
    // If user selected specific type, filter by it; otherwise show workshop, trip, and gym
    if (type) {
      conditions.push({ type: type });
    } else {
      conditions.push({ type: { $in: ['workshop', 'trip', 'gym'] } });
    }
    
    if (name) {
      const regex = new RegExp(name, 'i');
      conditions.push({
        $or: [
          { title: regex },
          { desc: regex },
          { location: regex },
          { locationInPlatform: regex }
        ]
      });
    }

    if (startDate || endDate) {
      const range = {};
      if (startDate) range.$gte = new Date(startDate);
      if (endDate) range.$lte = new Date(endDate);

      conditions.push({
        $or: [
          { startDate: range },
          { date: range }
        ]
      });
    }

    const query = { $and: conditions };

    // Find workshops, trips, and gym sessions matching filters
    const events = await Event.find(query).populate('participants').lean();

    // For each event, count only PAID attendees from user collections (or participants for gym)
    const report = await Promise.all(events.map(async (ev) => {
      const eventId = ev._id;
      
      // For gym sessions, count participants array
      if (ev.type === 'gym') {
        const participantsCount = ev.participants?.length || 0;
        
        return {
          id: ev._id,
          title: ev.title || 'Gym Session',
          type: ev.sessionType || 'gym',
          startDate: ev.date || ev.startDate || null,
          endDate: ev.endDate || null,
          attendees: participantsCount,
          breakdown: { gym: participantsCount }
        };
      }
      
      // Import user models for workshops/trips
      const { Student } = await import('../models/Users/Student.js');
      const { Staff } = await import('../models/Users/Staff.js');
      const { TA } = await import('../models/Users/TA.js');
      const { Professor } = await import('../models/Users/Professor.js');

      // Count users who have this event with paymentStatus === 'paid'
      const [students, staff, ta, professors] = await Promise.all([
        Student.countDocuments({ 
          registeredEvents: { 
            $elemMatch: { 
              event: eventId, 
              paymentStatus: 'paid' 
            } 
          } 
        }),
        Staff.countDocuments({ 
          registeredEvents: { 
            $elemMatch: { 
              event: eventId, 
              paymentStatus: 'paid' 
            } 
          } 
        }),
        TA.countDocuments({ 
          registeredEvents: { 
            $elemMatch: { 
              event: eventId, 
              paymentStatus: 'paid' 
            } 
          } 
        }),
        Professor.countDocuments({ 
          registeredEvents: { 
            $elemMatch: { 
              event: eventId, 
              paymentStatus: 'paid' 
            } 
          } 
        }),
      ]);

      const attendees = students + staff + ta + professors;

      return {
        id: ev._id,
        title: ev.title || ev.type || 'Untitled',
        type: ev.type || 'event',
        startDate: ev.startDate || ev.date || null,
        endDate: ev.endDate || null,
        attendees,
        breakdown: { students, staff, ta, professors }
      };
    }));

    res.status(200).json({ count: report.length, report });
  } catch (err) {
    console.error('Error building attendees report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Revenue Report - Calculate revenue from paid events
export const getRevenueReport = async (req, res) => {
  try {
    const { type, startDate, endDate, sort } = req.query;

    // Build query for revenue-generating events: workshops, trips, bazaar, booth
    const conditions = [];
    
    // Filter by type if specified, otherwise show all revenue-generating types
    if (type) {
      conditions.push({ type: type });
    } else {
      conditions.push({ type: { $in: ['workshop', 'trip', 'bazaar', 'booth'] } });
    }
    
    // Filter by date range
    if (startDate || endDate) {
      const range = {};
      if (startDate) range.$gte = new Date(startDate);
      if (endDate) range.$lte = new Date(endDate);

      conditions.push({
        $or: [
          { startDate: range },
          { date: range }
        ]
      });
    }

    const query = { $and: conditions };

    // Find events matching filters
    const events = await Event.find(query).lean();

    // Calculate revenue for each event
    const report = await Promise.all(events.map(async (ev) => {
      const eventId = ev._id;
      let revenue = 0;

      // Import user models
      const { Student } = await import('../models/Users/Student.js');
      const { Staff } = await import('../models/Users/Staff.js');
      const { TA } = await import('../models/Users/TA.js');
      const { Professor } = await import('../models/Users/Professor.js');
      const { Vendor } = await import('../models/Users/Vendor.js');

      // For workshops and trips: sum up prices from paid registrations (all user types)
      if (ev.type === 'workshop' || ev.type === 'trip') {
        const allUsers = await Promise.all([
          Student.find({ 
            registeredEvents: { 
              $elemMatch: { 
                event: eventId, 
                paymentStatus: 'paid' 
              } 
            } 
          }).select('registeredEvents'),
          Staff.find({ 
            registeredEvents: { 
              $elemMatch: { 
                event: eventId, 
                paymentStatus: 'paid' 
              } 
            } 
          }).select('registeredEvents'),
          TA.find({ 
            registeredEvents: { 
              $elemMatch: { 
                event: eventId, 
                paymentStatus: 'paid' 
              } 
            } 
          }).select('registeredEvents'),
          Professor.find({ 
            registeredEvents: { 
              $elemMatch: { 
                event: eventId, 
                paymentStatus: 'paid' 
              } 
            } 
          }).select('registeredEvents'),
        ]);

        // Sum up all paid registration prices
        allUsers.flat().forEach(user => {
          const paidReg = user.registeredEvents?.find(
            reg => reg.event.equals(eventId) && reg.paymentStatus === 'paid'
          );
          if (paidReg && paidReg.priceAtRegistration) {
            revenue += paidReg.priceAtRegistration;
          }
        });
      }

      // For bazaars and booths: sum up prices from paid vendor registrations in the event itself
      if (ev.type === 'bazaar' || ev.type === 'booth') {
        // Vendor registrations are stored in the event's registeredVendors array
        if (ev.registeredVendors && Array.isArray(ev.registeredVendors)) {
          ev.registeredVendors.forEach(vendorReg => {
            if (vendorReg.paymentStatus === 'paid' && vendorReg.finalPrice) {
              revenue += vendorReg.finalPrice;
            }
          });
        }
      }

      return {
        id: ev._id,
        title: ev.title || ev.type || 'Untitled',
        type: ev.type || 'event',
        startDate: ev.startDate || ev.date || null,
        endDate: ev.endDate || null,
        revenue: Math.round(revenue * 100) / 100 // Round to 2 decimal places
      };
    }));

    // Sort by revenue if requested
    let sortedReport = report;
    if (sort === 'asc') {
      sortedReport = report.sort((a, b) => a.revenue - b.revenue);
    } else if (sort === 'desc') {
      sortedReport = report.sort((a, b) => b.revenue - a.revenue);
    }

    // Calculate total revenue
    const totalRevenue = sortedReport.reduce((sum, item) => sum + item.revenue, 0);

    res.status(200).json({ 
      count: sortedReport.length, 
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      report: sortedReport 
    });
  } catch (err) {
    console.error('Error building revenue report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




// ✅ Register for a general event (not just trip)
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id || req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Check if registration deadline exists
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline))
      return res.status(400).json({ error: 'Registration deadline passed' });

    // Prevent duplicate registrations
    if (event.registeredStudents?.includes(userId))
      return res.status(400).json({ error: 'Already registered' });

    // Push user into registered students array
    event.registeredStudents = event.registeredStudents || [];
    event.registeredStudents.push(userId);
    await event.save();

    res.status(200).json({ message: 'Successfully registered', event });
  } catch (err) {
    console.error("Error in registerForEvent:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get my registered events
export const getMyRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const events = await Event.find({ registeredStudents: userId });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Vendor Registering for a Bazaar

const registerVendorSchema = Joi.object({
  reps: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      })
    )
    .max(5)
    .required(),
  boothSize: Joi.string().valid('2x2', '4x4').required()
});


export const registerForBazaar = async (req, res) => {
  try {
    const { bazaarId } = req.params;
    const vendorId = req.user.id || req.user._id;

    
    const { error, value } = registerVendorSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const bazaar = await Bazaar.findById(bazaarId);
    console.log(bazaarId);
    if (!bazaar) return res.status(404).json({ error: 'Bazaar not found' });

    
    const alreadyRegistered = bazaar.registeredVendors.some(
      v => v.vendor.toString() === vendorId
    );
    if (alreadyRegistered)
      return res.status(400).json({ error: 'Vendor already applied for the event before' });

    
    bazaar.registeredVendors.push({
      vendor: vendorId,
      status: 'pending',
      reps: value.reps,
      boothSize: value.boothSize,
      finalPrice:0,
      paymentStatus:"unpaid"
    });
    await bazaar.save({ validateBeforeSave: false });
    
    // ✅ Send notification to all Event Officers and Admins
try {
  const eventOfficers = await EventOfficer.find();
  const admins = await (await import("../models/Users/Admin.js")).Admin.find();

  const vendorName = req.user.companyName || "Unknown Vendor";
  const message = `🧾 New vendor request from ${vendorName} for bazaar "${bazaar.title}". Status: pending approval.`;

  // Add the message to each event officer's and admin's notification list
  for (const officer of eventOfficers) {
    officer.notifications.push(message);
    await officer.save();
  }
  for (const admin of admins) {
    admin.notifications.push(message);
    await admin.save();
  }
} catch (notifyErr) {
  console.error("Error sending notification:", notifyErr);
}

    res.status(200).json({ message: 'Applied successfully, waiting for approval', bazaar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// update bazaar details if bazaare has not started yet
export const updateBazaar = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 Ensure only Event Officers can edit
    if (req.user.role !== 'eventOfficer')
      return res.status(403).json({ error: 'Only Event Officers can edit bazaars.' });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Bazaar not found' });

    if (event.type !== 'bazaar' && event.__t !== 'bazaar')
      return res.status(400).json({ error: 'Event is not a bazaar' });

    const now = new Date();
    if (now >= new Date(event.startDate))
      return res.status(400).json({ error: 'Bazaar already started and cannot be edited' });

    const bazaarEditSchema = bazaarSchema.fork(
      Object.keys(bazaarSchema.describe().keys),
      (schema) => schema.optional()
    );

    const { error, value } = bazaarEditSchema.validate(req.body, {
      allowUnknown: true,
      presence: 'optional',
    });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedEvent = await Bazaar.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: 'Bazaar updated successfully',
      event: updatedEvent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// ////////////////////////
// register vendor schema for booth in platform

const registerBoothSchema = Joi.object({
  boothId: Joi.string().required(),
  startDate: Joi.date().required(),
  durationWeeks: Joi.number().integer().min(1).max(4).required(),
  reps: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      })
    )
    .max(5)
    .required(),
  boothSize: Joi.string().valid("2x2", "4x4").required(), // only for registeredVendor
});




export const registerBooth = async (req, res) => {
  try {
    const { error, value } = registerBoothSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details[0].message });

    const { boothId, startDate, durationWeeks, reps, boothSize } = value;
    const vendorId = req.user?.id || req.user?._id;

    const booth = await Booth.findById(boothId);
    if (!booth)
      return res.status(404).json({ error: "Booth not found" });

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + durationWeeks * 7);

    // Check for overlapping approved vendors with same booth size
    const overlapping = booth.registeredVendors.some(
      (v) =>
        v.status === "approved" &&
        v.boothSize === boothSize &&
        ((start >= v.startDate && start <= v.endDate) ||
          (end >= v.startDate && end <= v.endDate) ||
          (start <= v.startDate && end >= v.endDate))
    );

    if (overlapping) {
      return res.status(400).json({
        error: "This booth with the selected size is already booked during the selected period.",
      });
    }

    // Check if the vendor already registered this booth with same size for overlapping period
    const alreadyRegistered = booth.registeredVendors.some(
      (v) =>
        v.vendor.toString() === vendorId.toString() &&
        v.boothSize === boothSize &&
        ((start >= v.startDate && start <= v.endDate) ||
          (end >= v.startDate && end <= v.endDate) ||
          (start <= v.startDate && end >= v.endDate))
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        error: "You have already registered this booth with the selected size during the selected period.",
      });
    }

    // Add vendor registration
    booth.registeredVendors.push({
      vendor: vendorId,
      reps,
      durationWeeks,
      startDate: start,
      endDate: end,
      status: "pending",
      boothSize,
      finalPrice:0,
      paymentStatus:"unpaid"

    });

    await booth.save({ validateBeforeSave: false });
// ✅ Send notification to all Event Officers and Admins
try {


  const vendorName = req.user.companyName || "Unknown Vendor";
  const message = `🧾 New booth request from ${vendorName} for booth "${booth.title}".`;

  // find all event officers and admins
  const eventOfficers = await User.find({ role: "eventOfficer" });
  const admins = await User.find({ role: "admin" });

  for (const officer of eventOfficers) {
    officer.notifications.push(message);
    await officer.save();
  }

  for (const admin of admins) {
    admin.notifications.push(message);
    await admin.save();
  }

  console.log("✅ Notifications sent to all Event Officers and Admins");
} catch (notifyErr) {
  console.error("❌ Error sending booth notification:", notifyErr);
}

    res.status(201).json({
      message: "Booth registration submitted successfully",
      booth,
    });
  } catch (err) {
    console.error("Register Booth Error:", err);
    res.status(500).json({ error: err.message });
  }
};


/////////////////////

export const getMyEventApplications = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;

    // 1️⃣ Get all bazaars where this vendor registered
    const myBazaars = await Bazaar.find({
      "registeredVendors.vendor": vendorId
    }).select("title type location startDate endDate registeredVendors");

    // 2️⃣ Get all booths where this vendor registered
    const myBooths = await Booth.find({
      "registeredVendors.vendor": vendorId
    }).select("title type locationInPlatform duration startDate endDate registeredVendors");

    const formattedBazaars = [];
    myBazaars.forEach(bazaar => {
      bazaar.registeredVendors
        .filter(v => v.vendor.toString() === vendorId)
        .forEach(reg => {
          formattedBazaars.push({
            id: bazaar._id,
            type: "bazaar",
            title: bazaar.title,
            location: bazaar.location,
            startDate: reg.startDate || bazaar.startDate,
            endDate: reg.endDate || bazaar.endDate,
            status: reg.status || "unknown",
            boothSize: reg.boothSize || "N/A",
            finalPrice: reg.finalPrice || 0,
            paymentStatus: reg.paymentStatus || "unpaid",
             paymentDeadline: reg.paymentDeadline || null, // ✅ added
            workersSubmitted: reg.workersSubmitted || false,
            registrationId: reg._id || null,
            
          });
        });
    });

    const formattedBooths = [];
    myBooths.forEach(booth => {
      booth.registeredVendors
        .filter(v => v.vendor.toString() === vendorId)
        .forEach(reg => {
          formattedBooths.push({
            id: booth._id,
            type: "booth",
            title: booth.title,
            location: booth.locationInPlatform,
            startDate: reg.startDate || booth.startDate,
            endDate: reg.endDate || booth.endDate,
            status: reg.status || "unknown",
            boothSize: reg.boothSize || "N/A",
            finalPrice: reg.finalPrice || 0,
            paymentStatus: reg.paymentStatus || "unpaid",
            paymentDeadline: reg.paymentDeadline || null, // ✅ added
            workersSubmitted: reg.workersSubmitted || false,
            registrationId: reg._id || null,
          });
        });
    });

    res.status(200).json({
      message: "Fetched all your applications successfully",
      applications: [...formattedBazaars, ...formattedBooths],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//CHECK ANY CONFLICTED BOOTH REQUESTS(EVENT OFFICER)
export const getAllBoothConflicts = async (req, res) => {
  try {
    const booths = await Booth.find()
      .populate("registeredVendors.vendor", "companyName name") // get vendor names
      .lean();

    const conflictedBooths = [];

    for (const booth of booths) {
      const vendors = booth.registeredVendors.filter(v => v.status === "approved" || v.status === "pending");

      const conflicts = [];

      for (let i = 0; i < vendors.length; i++) {
        for (let j = i + 1; j < vendors.length; j++) {
          const v1 = vendors[i];
          const v2 = vendors[j];

          const overlap =
            (v1.startDate <= v2.endDate && v1.endDate >= v2.startDate);

          if (overlap) {
            conflicts.push({
              vendor1Name: v1.vendor?.companyName || v1.vendor?.name || "Unknown",
              vendor2Name: v2.vendor?.companyName || v2.vendor?.name || "Unknown",

              vendor1: {
                startDate: v1.startDate,
                endDate: v1.endDate
              },

              vendor2: {
                startDate: v2.startDate,
                endDate: v2.endDate
              }
            });
          }
        }
      }

      if (conflicts.length > 0) {
        conflictedBooths.push({
          booth: {
            id: booth._id,
            title: booth.title || "Unknown Booth",
            location: booth.locationInPlatform || ""
          },
          conflicts
        });
      }
    }

    res.status(200).json({
      conflictedBooths,
      count: conflictedBooths.length
    });

  } catch (err) {
    console.error("Conflict detection error:", err);
    res.status(500).json({ error: err.message });
  }
};



export const registerForGymSession = async (req, res) => {
  try {
    const { sessionId } = req.params; // gym session id
    const userId = req.user.id;

    const session = await GymSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Gym session not found" });

    //  Check if session has available spots
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ message: "Session is full" });
    }

    // Check if already registered
    if (session.participants.includes(userId)) {
      return res.status(400).json({ message: "Already registered for this session" });
    }

    //  Add user
    session.participants.push(userId);
    await session.save();

    res.status(200).json({
      message: "Successfully registered for gym session",
      session,
    });
  } catch (err) {
    console.error("Register Gym Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



///////////////////////////////////////////




export const updateVendorStatus = async (req, res) => {
  try {
    const { eventId, vendorId } = req.params;
    const { status } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Find the vendor REGISTRATION by its _id (not by vendor user ID)
    const vendorIndex = event.registeredVendors.findIndex(
      (v) => v._id.toString() === vendorId.toString()
    );
    
    if (vendorIndex === -1) {
      return res.status(404).json({ error: "Vendor registration not found" });
    }

    const vendorReg = event.registeredVendors[vendorIndex];

    // Use registration-specific dates if available, otherwise fallback to event dates
    const vendorStart = vendorReg.startDate || event.startDate;
    const vendorEnd = vendorReg.endDate || event.endDate;

    if (status === "approved") {
      // Check for overlapping approved registrations (ANY vendor including the same one)
      const overlapping = event.registeredVendors.some((v, idx) => {
        if (idx === vendorIndex) return false; // skip current registration
        if (v.status !== "approved") return false; // only check approved registrations

        const vStart = v.startDate || event.startDate;
        const vEnd = v.endDate || event.endDate;

        // Check for any date overlap
        return (
          (vendorStart <= vEnd && vendorStart >= vStart) ||
          (vendorEnd >= vStart && vendorEnd <= vEnd) ||
          (vendorStart <= vStart && vendorEnd >= vEnd)
        );
      });

      if (overlapping) {
        return res.status(400).json({
          error: "This booth is already booked during the selected period",
        });
      }
    }

    // Update status
    event.registeredVendors[vendorIndex].status = status;
    event.markModified('registeredVendors');
    await event.save({ validateBeforeSave: false });

    // Send email notification to the VENDOR USER (not registration)
    try {
      const vendorUser = await User.findById(vendorReg.vendor);
      if (vendorUser && vendorUser.email) {
        const subject =
          status === "approved"
            ? `Innovex GUC: Your application for "${event.title}" is approved`
            : `Innovex GUC: Your application for "${event.title}" is rejected`;

        const text =
          status === "approved"
            ? `Congratulations! Your application for "${event.title}" has been approved. You have 3 days to complete the payment. Please reply to this email if you have any questions.`
            : `We are sorry. Your application for "${event.title}" has been rejected. Please reply to this email if you have any questions.`;

        await sendEmail({
          to: vendorUser.email,
          subject,
          text,
          html: `<p>${text}</p>`
        });
      }
    } catch (emailErr) {
      console.error("Failed to send email to vendor:", emailErr);
    }

    res.json({ message: `Vendor ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createBazaar = async (req, res) => {
  try {
    if (req.user.role !== "eventOfficer") {
      return res.status(403).json({ message: "Only Event Officers can create bazaars" });
    }

    console.log("🧾 Received body:", req.body);
    // Automatically set organizer and createdBy
    const userId = req.user.id || req.user._id;
    req.body.organizerId = req.body.organizerId || userId;
    req.body.createdBy = userId;

    const { error, value } = bazaarSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newBazaar = new Bazaar(value);
    await newBazaar.save();

    // ✅ New: notify all relevant users about the new bazaar
    try {
      await notifyUsersOfNewEvent(newBazaar);
    } catch (notifyErr) {
      console.error("Error sending new-event notifications for bazaar:", notifyErr);
    }

    res.status(201).json({ message: "Bazaar created successfully", bazaar: newBazaar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createConference = async (req, res) => {
  try {
    // 🔒 Only Event Officers can create
    if (req.user.role !== "eventOfficer") {
      return res.status(403).json({ error: "Only Event Officers can create conferences." });
    }

    console.log("🧾 Received body:", req.body);

    const userId = req.user.id || req.user._id;
    req.body.organizerId = req.body.organizerId || userId;
    req.body.createdBy = userId;
    req.body.type = "conference";

    const { error, value } = conferenceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Auto-approve conferences
    value.status = "approved";

    const newConference = new Conference(value);
    await newConference.save();

    // ✅ New: notify all relevant users about the new conference
    try {
      await notifyUsersOfNewEvent(newConference);
    } catch (notifyErr) {
      console.error("Error sending new-event notifications for conference:", notifyErr);
    }

    res.status(201).json({
      message: "Conference created successfully",
      conference: newConference,
    });
  } catch (err) {
    console.error("Create Conference Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const updateConference = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 Only Event Officers can update
    if (req.user.role !== 'eventOfficer') {
      return res.status(403).json({ error: 'Only Event Officers can update conferences.' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Conference not found' });

    if (event.type !== 'conference' && event.__t !== 'conference') {
      return res.status(400).json({ error: 'Event is not a conference' });
    }

    const now = new Date();
    if (now >= new Date(event.startDate)) {
      return res.status(400).json({ error: 'Conference already started and cannot be edited' });
    }

    // ✅ Allow partial updates
    const conferenceEditSchema = conferenceSchema.fork(
      Object.keys(conferenceSchema.describe().keys),
      (schema) => schema.optional()
    );

    const { error, value } = conferenceEditSchema.validate(req.body, {
      allowUnknown: true,
      presence: 'optional',
    });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedConference = await Conference.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: 'Conference updated successfully',
      conference: updatedConference,
    });
  } catch (err) {
    console.error('Update Conference Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const generateVisitorQR = async (req, res) => {
  try {
    const { id } = req.params; // bazaar or booth ID
    const { name, email, nationalId } = req.body;

    // -----------------------------------
    // 1️⃣ Validate required fields
    // -----------------------------------
    if (!name || !nationalId) {
      return res.status(400).json({
        message: "Name and national ID are required.",
      });
    }

    // -----------------------------------
    // 2️⃣ Find the event (Bazaar or Booth)
    // -----------------------------------
    let event = await Bazaar.findById(id);

    if (!event) {
      event = await Booth.findById(id);
    }

    if (!event) {
      return res.status(404).json({
        message: "Bazaar or Booth not found.",
      });
    }

    // -----------------------------------
    // 3️⃣ Generate a unique visitor code
    // -----------------------------------
    const visitorCode =
      crypto.randomUUID?.() || crypto.randomBytes(16).toString("hex");

     const qrPayload = {
     name,
     nationalId,
     code: visitorCode,
     event: event.title,
     date: new Date().toISOString()
   };

   const qrBase64 = await QRCode.toDataURL(JSON.stringify(qrPayload));

    // -----------------------------------
    // 5️⃣ Add visitor entry to the event
    // -----------------------------------
    event.externalVisitors.push({
      name,
      email: email || null,
      nationalId,
      code: visitorCode,
      qrCode: qrBase64,
      createdAt: new Date(),
    });

    event.markModified("externalVisitors");
    await event.save({ validateBeforeSave: false });


    // -----------------------------------
    // 6️⃣ Prepare PNG buffer for download
    // -----------------------------------
    const buffer = Buffer.from(qrBase64.split(",")[1], "base64");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=QR_${name.replace(/\s+/g, "_")}.png`
    );
    res.setHeader("Content-Type", "image/png");

    return res.send(buffer);
  } catch (error) {
    console.error("QR generation error:", error);
    return res.status(500).json({
      message: "Server error generating QR code.",
      error: error.message,
    });
  }
};

export const getExternalVisitors = async (req, res) => {
  try {
    const { id } = req.params;

    // Look in both Bazaar and Booth
    let event = await Bazaar.findById(id) || await Booth.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({
      visitors: event.externalVisitors || []
    });
  } catch (err) {
    console.error("Error fetching QR visitors:", err);
    return res.status(500).json({
      message: "Failed to fetch visitor QR codes"
    });
  }
};


export const cancelVendorApplication = async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const vendorId = req.user._id;

    if (req.user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can cancel applications.' });
    }

    // 1. Find the event using the base Event model
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // 2. Check if it's a type we can cancel
    if (event.type !== 'bazaar' && event.type !== 'booth') {
      return res.status(400).json({ error: 'Cannot cancel application for this event type.' });
    }

    // 3. Find the specific registration in the event's array
    // (This assumes both Bazaar and Booth use a "registeredVendors" array)
    const registration = event.registeredVendors.id(registrationId);
    if (!registration) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // 4. Authorization: Is this the correct vendor?
    if (!registration.vendor.equals(vendorId)) {
      return res.status(403).json({ error: 'You are not authorized to cancel this application.' });
    }

    // 5. Business Rule: Can only cancel if NOT paid
    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Cannot cancel an application that has already been paid.' });
    }

    // 6. Remove the application using Mongoose's pull method
    event.registeredVendors.pull({ _id: registrationId });
    
    // 7. Save the parent event
    await event.save();

    res.status(200).json({ message: 'Application cancelled successfully.' });

  } catch (err) {
    console.error("Error cancelling vendor application:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
export const deleteComment = async (req, res) => {
  try {
    const { eventId, commentId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the comment index
    const index = event.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (index === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Store comment data before deletion for email
    const deletedComment = event.comments[index];
    const userId = deletedComment.user;
    const commentText = deletedComment.text;
    const commentDate = deletedComment.createdAt;
    const eventName = event.name || event.title;

    // Remove it
    event.comments.splice(index, 1);

    await event.save();

    // Send email notification (async, won't block response)
    try {
      const user = await User.findById(userId);
      
      if (user) {
        // Only send to student, staff, ta, professor (not events office)
        const allowedRoles = ["student", "staff", "ta", "professor"];
        const userRole = (user.role || "").toLowerCase();
        
        if (allowedRoles.includes(userRole)) {
          // Format the comment date
          const formattedDate = new Date(commentDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          });

          await sendEmail({
            to: user.email,
            subject: "⚠️ Your comment was removed!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d32f2f;">⚠️ Comment Removal Notice</h2>
                
                <p>Dear ${user.name || "User"},</p>
                
                <p>Your comment on <strong>"${eventName}"</strong> posted on <strong>${formattedDate}</strong> has been removed by an administrator for violating community guidelines.</p>
                
                <div style="background-color: #f5f5f5; border-left: 4px solid #d32f2f; padding: 12px; margin: 20px 0;">
                  <strong>Removed comment:</strong>
                  <p style="margin: 8px 0 0 0; font-style: italic; color: #555;">"${commentText}"</p>
                </div>
                
                <p>Please keep discussions respectful. Repeated violations may lead to account restrictions.</p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                
                <p style="color: #666; font-size: 14px;">— GUC Innovex Team</p>
              </div>
            `,
          });

          console.log(`✅ Comment removal email sent to ${user.email}`);
        }
      }
    } catch (emailError) {
      console.error("Error sending comment removal email:", emailError);
      // Don't fail the deletion if email fails
    }

    res.status(200).json({
      message: "Comment deleted successfully",
      comments: event.comments,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getAllComments = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("comments.user", "name email role")
      .select("title comments ratings type __t");

    const normalizeId = (value) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (value._id) return value._id.toString();
      if (typeof value.toString === "function") return value.toString();
      return null;
    };

    let allComments = [];

    events.forEach((event) => {
      const eventObj = event.toObject({ virtuals: false });
      const eventType = eventObj?.type || eventObj?.__t || null;

      event.comments.forEach((c) => {
        const commentUserId = normalizeId(c.user);
        const ratingEntry = Array.isArray(event.ratings)
          ? event.ratings.find((r) => normalizeId(r.user) === commentUserId)
          : null;

        allComments.push({
          eventId: event._id,
          eventTitle: event.title,
          eventType: eventType ? String(eventType) : null,
          commentId: c._id,
          text: c.text,
          createdAt: c.createdAt,
          user: c.user,
          rating: ratingEntry ? Number(ratingEntry.value) : null,
        });
      });
    });

    res.status(200).json({ comments: allComments });
  } catch (error) {
    console.error("Error fetching all comments:", error);
    res.status(500).json({ message: "Failed to load comments" });
  }
};


