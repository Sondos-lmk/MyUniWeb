import Joi from 'joi';
import { Event } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { Conference } from '../models/Events/Conference.js';
import { GymSession } from '../models/Events/GymSession.js';
import { Trip } from '../models/Events/Trip.js';
import { Workshop } from '../models/Events/Workshop.js';


// Base event schema (used for common fields)
const baseEventSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'completed'),
  organizerId: Joi.string().required(),
});

// Bazaar
const bazaarSchema = baseEventSchema.keys({
  title: Joi.string().required(),
  desc: Joi.string().allow(''),
  location: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date().required(),
  vendors: Joi.array().items(Joi.string()),
});

// Booth
const boothSchema = baseEventSchema.keys({
  reps: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    })
  ),
  setupStart: Joi.date().required(),
  setupEnd: Joi.date().required(),
  locationInPlatform: Joi.string().required(),
  boothSize: Joi.string().valid('2x2', '4x4').required(),
});

// Conference
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

// Trip
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

// Workshop
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
});

// Gym session
const gymSchema = baseEventSchema.keys({
  date: Joi.date().required(),
  time: Joi.string().required(),
  duration: Joi.number().required(),
  maxParticipants: Joi.number().required(),
});


// Choose validation schema based on event type
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

//Choose model based on event type
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
// ----------------------
// CREATE EVENT
// ----------------------
export const createEvent = async (req, res) => {
  try {
    const { type } = req.body;
    const schema = getValidationSchema(type);
    // If authenticated, set organizerId from token to prevent spoofing
    if (req.user && !req.body.organizerId) req.body.organizerId = req.user.id || req.user._id;
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const Model = getEventModel(type);
    const newEvent = new Model(value);
    await newEvent.save();

    res.status(201).json({ message: `${type} created successfully`, event: newEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// GET ALL EVENTS (OPTIONAL FILTER BY TYPE)
// ----------------------
export const getAllEvents = async (req, res) => {
  try {
    const { type } = req.query;
    let events;

    if (type) {
      const Model = getEventModel(type);
      events = await Model.find();
    } else {
      events = await Event.find();
    }

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// GET EVENT BY ID
// ----------------------
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// UPDATE EVENT
// ----------------------
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Determine event type (supporting both discriminator fields)
    const eventType = event.type || event.__t;

    // Prevent editing trips that already started. Use stored startDate (not incoming update).
    if (eventType === 'trip') {
      const now = Date.now();
      const tripStart = event.startDate ? new Date(event.startDate).getTime() : null;

      if (!tripStart) {
        // If no start date is set, be conservative and allow update — or change to block if you prefer
      } else if (now >= tripStart) {
        return res.status(400).json({ error: 'Trip has already started and cannot be edited.' });
      }
    }

    // Validate only provided fields when updating (partial update)
    const schema = getValidationSchema(eventType);
    // Build a partial object containing only allowed keys from schema by validating req.body with options.
    const { error, value } = schema.validate(req.body, { allowUnknown: true, presence: 'optional' });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Use the validated value for update to strip unknown fields
    const updatedEvent = await Event.findByIdAndUpdate(id, value, { new: true, runValidators: true });
    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// DELETE EVENT
// ----------------------
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ----------------------
// APPROVE EVENT (publish)
// ----------------------
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Only pending events can be approved
    if (event.status === 'approved') {
      return res.status(400).json({ error: 'Event is already approved' });
    }

    event.status = 'approved';
    await event.save();
    res.status(200).json({ message: 'Event approved and published', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// REJECT EVENT
// ----------------------
export const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Only pending events can be rejected
    if (event.status === 'rejected') {
      return res.status(400).json({ error: 'Event is already rejected' });
    }

    event.status = 'rejected';
    await event.save();
    res.status(200).json({ message: 'Event rejected', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ----------------------
// CREATE WORKSHOP BY PROFESSOR
// ----------------------
export const createProfessorWorkshop = async (req, res) => {
  try {
    const { type } = req.body;
    
    // Ensure only workshops can be created by professors
    if (type !== 'workshop') {
      return res.status(400).json({ error: 'Professors can only create workshops' });
    }

    const schema = getValidationSchema(type);
    
    // Set organizerId from authenticated professor
    req.body.organizerId = req.user.id || req.user._id;
    
    // Force status to 'pending' for professor-created workshops
    req.body.status = 'pending';
    
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const Model = getEventModel(type);
    const newWorkshop = new Model(value);
    await newWorkshop.save();

    res.status(201).json({ 
      message: 'Workshop submitted successfully and is pending approval', 
      workshop: newWorkshop 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// GET PENDING WORKSHOPS (FOR EVENTS OFFICERS)
// ----------------------
export const getPendingWorkshops = async (req, res) => {
  try {
    const pendingWorkshops = await Workshop.find({ status: 'pending' })
      .populate('organizerId', 'name email role')
      .populate('professorsParticipating', 'name email');
    
    res.status(200).json(pendingWorkshops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// GET PROFESSOR'S WORKSHOPS
// ----------------------
export const getProfessorWorkshops = async (req, res) => {
  try {
    const professorId = req.user.id || req.user._id;
    
    const workshops = await Workshop.find({ organizerId: professorId })
      .populate('professorsParticipating', 'name email');
    
    res.status(200).json(workshops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// REGISTER FOR TRIP
// ----------------------
export const registerForTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { studentId } = req.body; // you can get this from auth later

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Check deadline
    if (new Date() > new Date(trip.registrationDeadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if trip is already full
    if (trip.registeredStudents.length >= trip.capacity) {
      trip.status = 'Closed';
      await trip.save();
      return res.status(400).json({ error: 'Trip is already full' });
    }

    // Check if already registered
    if (trip.registeredStudents.includes(studentId)) {
      return res.status(400).json({ error: 'You are already registered for this trip' });
    }

    // Register student
    trip.registeredStudents.push(studentId);

    // Close if reached capacity
    if (trip.registeredStudents.length >= trip.capacity) {
      trip.status = 'Closed';
    }

    await trip.save();
    res.status(200).json({ message: 'Registration successful', trip });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


