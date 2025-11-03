import Joi from 'joi';
import { Event } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { Conference } from '../models/Events/Conference.js';
import { GymSession } from '../models/Events/GymSession.js';
import { Trip } from '../models/Events/Trip.js';
import { Workshop } from '../models/Events/Workshop.js';

import { Student } from "../models/Users/Student.js";
import { Staff } from "../models/Users/Staff.js";
import { Professor } from "../models/Users/Professor.js";
import { TA } from "../models/Users/TA.js";

import { Vendor } from "../models/Users/Vendor.js";

import mongoose from "mongoose";

// --------------------------------------
// JOI VALIDATION SCHEMAS
// --------------------------------------
const baseEventSchema = Joi.object({
  type: Joi.string().valid('bazaar', 'booth', 'conference', 'trip', 'workshop', 'gym').required(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'completed'),
  createdBy: Joi.string().optional(),
  organizerId: Joi.string().optional(),
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

// --------------------------------------
// CONTROLLERS
// --------------------------------------

// Get all events (optionally filter by type)
export const getAllEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const Model = type ? getEventModel(type) : Event;

    console.log("Query type:", type);
    console.log("Using model:", Model.modelName);

    const events = await Model.find({});
    console.log("Fetched events from DB:", events); // <--- Add this

    res.status(200).json(events);
  } catch (err) {
    console.error("Error in getAllEvents:", err);
    res.status(500).json({ error: err.message });
  }
};



// Get upcoming events with details (includes vendor participation for bazaars/booths)
// export const getUpcomingEvents = async (req, res) => {
//   try {
//     const now = new Date();

//     // Only approved and future-dated events are considered upcoming
//     const baseFilter = { status: 'approved', $or: [ { startDate: { $gte: now } }, { endDate: { $gte: now } } ] };

//     // Build queries per discriminator to leverage field existence
//     const [bazaars, booths, conferences, trips, workshops] = await Promise.all([
//       Bazaar.find(baseFilter)
//         .populate({ path: 'registeredVendors.vendor', select: 'name email role' })
//         .lean(),
//       Booth.find(baseFilter)
//         .populate({ path: 'registeredVendors.vendor', select: 'name email role' })
//         .lean(),
//       Conference.find(baseFilter).lean(),
//       Trip.find(baseFilter).lean(),
//       Workshop.find(baseFilter)
//         .populate('professorsParticipating', 'name email')
//         .lean(),
//     ]);

//     const combined = [
//       ...bazaars.map(e => ({ ...e, type: 'bazaar' })),
//       ...booths.map(e => ({ ...e, type: 'booth' })),
//       ...conferences.map(e => ({ ...e, type: 'conference' })),
//       ...trips.map(e => ({ ...e, type: 'trip' })),
//       ...workshops.map(e => ({ ...e, type: 'workshop' })),
//     ];

//     // Sort by startDate ascending when available, otherwise by createdAt
//     combined.sort((a, b) => {
//       const aDate = a.startDate ? new Date(a.startDate).getTime() : new Date(a.createdAt).getTime();
//       const bDate = b.startDate ? new Date(b.startDate).getTime() : new Date(b.createdAt).getTime();
//       return aDate - bDate;
//     });

//     res.status(200).json(combined);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get event by ID
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

    res.status(200).json(event);
  } catch (err) {
    console.error('Error in getEventById:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL UPCOMING EVENTS (For All Roles)
export const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();

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
      GymSession.find({ date: { $gt: now }, status: "approved" }),
    ]);

    // Combine all events into a single list
    const allUpcoming = [
      ...workshops.map((e) => formatEvent(e, "workshop")),
      ...trips.map((e) => formatEvent(e, "trip")),
      ...bazaars.map((e) => formatEvent(e, "bazaar")),
      ...booths.map((e) => formatEvent(e, "booth")),
      ...conferences.map((e) => formatEvent(e, "conference")),
      ...gymSessions.map((e) => ({
        id: e._id,
        type: "gym",
        sessionType: e.sessionType,
        date: e.date,
        time: e.time,
        duration: e.duration,
        maxParticipants: e.maxParticipants,
        participants: e.participants?.length || 0,
      })),
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
      payload.createdBy = authUserId; // 👈 add it here, AFTER validation
    }

    // Auto-approve trips, bazaars, and conferences
    if (type === 'trip' || type === 'bazaar' || type === 'conference') {
      payload.status = 'approved';
    }

    const Model = getEventModel(type);
    const newEvent = new Model(payload);
    await newEvent.save();

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

    res.status(200).json({
      message: "Event approved successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status
      }
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

    res.status(200).json({
      message: "Event rejected successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status
      }
    });
  } catch (error) {
    console.error("Reject Event Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const registerForWorkshopOrTrip = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id || req.user.id;

    // 1️⃣ Find the event and ensure it exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 2️⃣ Allow only workshops and trips
    if (event.type !== "workshop" && event.type !== "trip") {
      return res.status(400).json({
        error: "You can only register for workshops or trips",
      });
    }

    // 3️⃣ Check if the user’s role is allowed
    const allowedRoles = ["student", "staff", "ta", "professor"];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "This role is not allowed to register for events",
      });
    }

    // 4️⃣ Prevent duplicate registration
    event.registeredStudents = event.registeredStudents || [];
    if (event.registeredStudents.includes(userId)) {
      return res.status(400).json({ error: "Already registered for this event" });
    }

    // 5️⃣ Add user to the event’s registered list
    event.registeredStudents.push(userId);
    await event.save();

    // 6️⃣ Add event to user’s registeredEvents list
    const roleModelMap = {
      student: Student,
      staff: Staff,
      ta: TA,
      professor: Professor,
    };
    const UserModel = roleModelMap[req.user.role];

    if (UserModel) {
      const user = await UserModel.findById(userId);
      if (user) {
        user.registeredEvents = user.registeredEvents || [];
        if (!user.registeredEvents.includes(eventId)) {
          user.registeredEvents.push(eventId);
          await user.save();
        }
      }
    }

    // 7️⃣ Send success message only
    res.status(200).json({ message: "Successfully registered for the event" });
  } catch (err) {
    console.error("Error registering for event:", err);
    res.status(500).json({ error: "Server error", details: err.message });
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
      "registeredEvents",
      "title type startDate endDate location description"
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // 4️⃣ Return the populated registeredEvents
    const events = user.registeredEvents || [];
    res.status(200).json(user.registeredEvents || []);

  } catch (err) {
    console.error("❌ Error in getMyRegisteredEventsFromUser:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
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

    // ⚠️ Don't add createdBy or organizerId yet — wait until after validation

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
      value.professorNames = req.body.professorNames.map((n) => String(n).trim()).filter(Boolean);
    }

    // ✅ Automatically include the creating professor
    value.professorsParticipating = [req.user._id];
    
    // ✅ Save the workshop
    const newWorkshop = new Workshop(value);
    await newWorkshop.save();

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

// Get attendees report (total attendees per event) with optional filters
export const getAttendeesReport = async (req, res) => {
  try {
    const { name, type, startDate, endDate } = req.query;

    // Build flexible query: support events that use `startDate` or `date`, and search multiple fields for name
    const conditions = [];
    if (type) conditions.push({ type });
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

      // Match events where either `startDate` or `date` falls in the range
      conditions.push({
        $or: [
          { startDate: range },
          { date: range }
        ]
      });
    }

    const query = conditions.length ? { $and: conditions } : {};

    // Find events matching filters (flexible for different event shapes)
    const events = await Event.find(query).lean();

    // For each event compute attendee counts (breakdown by role when possible)
    const report = await Promise.all(events.map(async (ev) => {
      // initialize breakdown
      let students = 0;
      let staff = 0;
      let ta = 0;
      let professors = 0;
      let vendors = 0;

      // If the event document stores registeredVendors (bazaar/booth)
      if (ev.registeredVendors && Array.isArray(ev.registeredVendors)) {
        // registeredVendors may be array of vendor IDs or objects
        vendors = ev.registeredVendors.length;
      }

      // If event stores registeredStudents
      if (ev.registeredStudents && Array.isArray(ev.registeredStudents)) {
        students = ev.registeredStudents.length;
      }

      // If event stores participants (gym sessions)
      if (ev.participants && Array.isArray(ev.participants)) {
        // participants may include mixed roles; we count as students here unless user models used
        students = ev.participants.length;
      }

      // Fallback: count across user collections who have this event in their registeredEvents
      if (!vendors && !students) {
        const eventId = ev._id;
        const [sCount, stfCount, taCount, profCount, vCount] = await Promise.all([
          (await import('../models/Users/Student.js')).Student.countDocuments({ registeredEvents: eventId }),
          (await import('../models/Users/Staff.js')).Staff.countDocuments({ registeredEvents: eventId }),
          (await import('../models/Users/TA.js')).TA.countDocuments({ registeredEvents: eventId }),
          (await import('../models/Users/Professor.js')).Professor.countDocuments({ registeredEvents: eventId }),
          (await import('../models/Users/Vendor.js')).Vendor.countDocuments({ registeredEvents: eventId }),
        ]);
        students = sCount;
        staff = stfCount;
        ta = taCount;
        professors = profCount;
        vendors = vCount;
      }

      const attendees = students + staff + ta + professors + vendors;

      return {
        id: ev._id,
        title: ev.title || ev.type || 'Untitled',
        type: ev.type || 'event',
        startDate: ev.startDate || ev.date || null,
        endDate: ev.endDate || null,
        attendees,
        breakdown: { students, staff, ta, professors, vendors }
      };
    }));

    res.status(200).json({ count: report.length, report });
  } catch (err) {
    console.error('Error building attendees report:', err);
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
      return res.status(400).json({ error: 'Vendor already applied' });

    
    bazaar.registeredVendors.push({
      vendor: vendorId,
      status: 'pending',
      reps: value.reps,
      boothSize: value.boothSize
    });
    await bazaar.save();
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
    });

    await booth.save();

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

// Fetch all bazaars and booths I registered for

export const getMyEventApplications = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;

    // 1️⃣ Get all bazaar applications by this vendor
    const myBazaars = await Bazaar.find({
      "registeredVendors.vendor": vendorId
    }).select("title type location startDate endDate registeredVendors");

    // 2️⃣ Get all booth applications by this vendor
    const myBooths = await Booth.find({
      "registeredVendors.vendor": vendorId
    }).select(" title type locationInPlatform duration startDate endDate registeredVendors");

    // Combine and format results
    const formattedBazaars = myBazaars.map(bazaar => {
      const reg = bazaar.registeredVendors.find(v => v.vendor.toString() === vendorId);
      return {
        type: "bazaar",
        title: bazaar.title,
        location: bazaar.location,
        startDate: bazaar.startDate,
        endDate: bazaar.endDate,
        status: reg?.status || "unknown"
      };
    });

    const formattedBooths = myBooths.map(booth => {
      const reg = booth.registeredVendors.find(v => v.vendor.toString() === vendorId);
      return {
        type: "booth",
        title: booth.title,
        location: booth.locationInPlatform,
        startDate: reg?.startDate,
        endDate: reg?.endDate,
        status: reg?.status || "unknown"
      };
    });

    res.status(200).json({
      message: "Fetched all your applications successfully",
      applications: [...formattedBazaars, ...formattedBooths],
    });
  } catch (err) {
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

//vendor approving booth application by event officer
// PATCH /events/:eventId/vendors/:vendorId
export const updateVendorStatus = async (req, res) => {
  try {
    const { eventId, vendorId } = req.params;
    const { status } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const vendor = event.registeredVendors.find(
      (v) => v.vendor.toString() === vendorId
    );
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    // Only check for overlapping if approving
    if (status === "approved") {
      const overlap = event.registeredVendors.some((v) => 
        v.vendor.toString() !== vendorId && // ignore the current vendor
        v.status === "approved" &&
        ((vendor.startDate <= v.endDate && vendor.startDate >= v.startDate) || 
         (vendor.endDate >= v.startDate && vendor.endDate <= v.endDate) ||
         (vendor.startDate <= v.startDate && vendor.endDate >= v.endDate)) // full overlap
      );

      if (overlap) {
        return res.status(400).json({ 
          error: "This booth is already booked during the selected period" 
        });
      }
    }

    // Approve/reject
    vendor.status = status;
    await event.save();

    res.json({ message: `Vendor ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






















// // Edit bazaar
// export const editBazaar = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
//     const updatedBazaar = await Bazaar.findByIdAndUpdate(id, updates, { new: true });
//     if (!updatedBazaar) return res.status(404).json({ message: 'Bazaar not found' });
//     res.status(200).json({ message: 'Bazaar updated successfully', updatedBazaar });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update bazaar', error: error.message });
//   }
// };
export const createBazaar = async (req, res) => {
  try {

    if (req.user.role !== 'eventOfficer') {
      return res.status(403).json({ message: 'Only Event Officers can create bazaars' });
    }

    console.log("🧾 Received body:", req.body);
    // Automatically set organizer and createdBy
    const userId = req.user.id || req.user._id;
    req.body.organizerId = req.body.organizerId || userId;
    req.body.createdBy = userId; // ✅ add this line

    const { error, value } = bazaarSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newBazaar = new Bazaar(value);
    await newBazaar.save();

    res.status(201).json({ message: 'Bazaar created successfully', bazaar: newBazaar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createConference = async (req, res) => {
  try {
    // 🔒 Only Event Officers can create
    if (req.user.role !== 'eventOfficer') {
      return res.status(403).json({ error: 'Only Event Officers can create conferences.' });
    }

    console.log("🧾 Received body:", req.body);

    const userId = req.user.id || req.user._id;
    req.body.organizerId = req.body.organizerId || userId;
    req.body.createdBy = userId;
    req.body.type = 'conference'; // ensure type is correctly set

    const { error, value } = conferenceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Auto-approve conferences
    value.status = 'approved';

    const newConference = new Conference(value);
    await newConference.save();

    res.status(201).json({
      message: 'Conference created successfully',
      conference: newConference,
    });
  } catch (err) {
    console.error('Create Conference Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
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



// export const createConference = async (req, res) => {
//   try {
//     const { error, value } = conferenceSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     // Set organizerId from authenticated user
//     value.organizerId = req.user.id || req.user._id;
//     value.status = 'pending'; // Conferences need approval

//     const newConference = new Conference(value);
//     await newConference.save();

//     res.status(201).json({ 
//       message: 'Conference created successfully and pending approval', 
//       conference: newConference 
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };




