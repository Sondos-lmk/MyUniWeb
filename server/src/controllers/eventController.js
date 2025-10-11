import Joi from 'joi';
import { Event } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { Conference } from '../models/Events/Conference.js';
import { GymSession } from '../models/Events/GymSession.js';
import { Trip } from '../models/Events/Trip.js';
import { Workshop } from '../models/Events/Workshop.js';

// --------------------------------------
// JOI VALIDATION SCHEMAS
// --------------------------------------
const baseEventSchema = Joi.object({
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
});

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
    const events = await Model.find();
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

    if (req.user && !req.body.organizerId)
      req.body.organizerId = req.user.id || req.user._id;

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const Model = getEventModel(type);
    const newEvent = new Model(value);
    await newEvent.save();

    res.status(201).json({ message: `${type} created successfully`, event: newEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const eventType = event.type || event.__t;
    if (eventType === 'trip') {
      const now = Date.now();
      if (now >= new Date(event.startDate).getTime())
        return res.status(400).json({ error: 'Trip already started and cannot be edited' });
    }

    const schema = getValidationSchema(eventType);
    const { error, value } = schema.validate(req.body, { allowUnknown: true, presence: 'optional' });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedEvent = await Event.findByIdAndUpdate(id, value, { new: true, runValidators: true });
    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve / Reject event
export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.status === 'approved') return res.status(400).json({ error: 'Already approved' });
    event.status = 'approved';
    await event.save();
    res.status(200).json({ message: 'Event approved', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.status === 'rejected') return res.status(400).json({ error: 'Already rejected' });
    event.status = 'rejected';
    await event.save();
    res.status(200).json({ message: 'Event rejected', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Create / manage professor workshops
export const createProfessorWorkshop = async (req, res) => {
  try {
    const { type } = req.body;
    if (type !== 'workshop') return res.status(400).json({ error: 'Only workshops allowed' });

    const schema = getValidationSchema(type);
    req.body.organizerId = req.user.id || req.user._id;
    req.body.status = 'pending';

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newWorkshop = new Workshop(value);
    await newWorkshop.save();

    res.status(201).json({
      message: 'Workshop submitted and pending approval',
      workshop: newWorkshop,
    });
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
    const professorId = req.user.id || req.user._id;
    const workshops = await Workshop.find({ organizerId: professorId })
      .populate('professorsParticipating', 'name email');
    res.status(200).json(workshops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit bazaar
export const editBazaar = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedBazaar = await Bazaar.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedBazaar) return res.status(404).json({ message: 'Bazaar not found' });
    res.status(200).json({ message: 'Bazaar updated successfully', updatedBazaar });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bazaar', error: error.message });
  }
};
export const createBazaar = async (req, res) => {
  try {
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
    const { error, value } = conferenceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Set organizerId from authenticated user
    value.organizerId = req.user.id || req.user._id;
    value.status = 'pending'; // Conferences need approval

    const newConference = new Conference(value);
    await newConference.save();

    res.status(201).json({ 
      message: 'Conference created successfully and pending approval', 
      conference: newConference 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

