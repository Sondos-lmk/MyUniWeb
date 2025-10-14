import Joi from 'joi';
import { Event } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { Conference } from '../models/Events/Conference.js';
import { GymSession } from '../models/Events/GymSession.js';
import { Trip } from '../models/Events/Trip.js';
import { Workshop } from '../models/Events/Workshop.js';
import mongoose from "mongoose";

// --------------------------------------
// JOI VALIDATION SCHEMAS
// --------------------------------------
const baseEventSchema = Joi.object({
  type: Joi.string().valid('bazaar', 'booth', 'conference', 'trip', 'workshop', 'gym').required(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'completed'),
  organizerId: Joi.string().required(),
});

const bazaarSchema = baseEventSchema.keys({

  title: Joi.string().required(),
  desc: Joi.string().allow(''),
  location: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date().required(),
  vendors: Joi.array().items(Joi.string()),
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
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    })
  ),
  locationInPlatform: Joi.string().required(),
  boothSize: Joi.string().valid('2x2', '4x4').required(),
});

const conferenceSchema = baseEventSchema.keys({
  title: Joi.string().required(),
  desc: Joi.string().allow(''),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date(),
  fullAgenda: Joi.string().allow(''),
  websiteLink: Joi.string().uri().required(),
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
    const role = req.user?.role;
    const Model = type ? getEventModel(type) : Event;
    const filter = {};
     if (role === 'vendor') {
      filter.type = 'bazaar';
      filter.status = 'approved';
    } 
    const events = await Model.find(filter);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
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
    const workshops = await Workshop.find({ status: 'pending' })
      .populate('organizerId', 'name email role')
      .populate('professorsParticipating', 'name email');
    res.status(200).json(workshops);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
});

export const registerBooth = async (req, res) => {
  try {
    const { error, value } = registerBoothSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details[0].message });

    const { boothId, startDate, durationWeeks, reps } = value;
    const vendorId = req.user?.id || req.user?._id; // assume authenticated vendor

    // Find the booth
    const booth = await Booth.findById(boothId);
    if (!booth)
      return res.status(404).json({ error: "Booth not found" });

    // Calculate end date based on duration
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + durationWeeks * 7);

    // Check for overlapping approved rentals
    const overlapping = booth.registeredVendors.some((v) =>
      v.status === "approved" &&
      ((start >= v.startDate && start <= v.endDate) ||
        (end >= v.startDate && end <= v.endDate) ||
        (start <= v.startDate && end >= v.endDate))
    );

    if (overlapping) {
      return res.status(400).json({
        error: "This booth is already booked during the selected period.",
      });
    }

    // Add vendor request
    booth.registeredVendors.push({
      vendor: vendorId,
      reps,
      durationWeeks,
      startDate: start,
      endDate: end,
      status: "pending",
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
// export const createBazaar = async (req, res) => {
//   try {
//     const { error, value } = bazaarSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const newBazaar = new Bazaar(value);
//     await newBazaar.save();

//     res.status(201).json({ message: 'Bazaar created successfully', bazaar: newBazaar });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

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




