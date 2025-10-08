import Joi from 'joi';
import { Event } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { Confrence } from '../models/Events/Confrence.js';
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
