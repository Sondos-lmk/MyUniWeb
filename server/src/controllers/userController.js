import bcrypt from 'bcryptjs';
import Joi from 'joi';

import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Professor } from '../models/Professor.js';
import { Vendor } from '../models/Vendor.js';
import { Admin } from '../models/Admin.js';
import { EventOfficer } from '../models/EventsOfficer.js';

//Base schema for all users
const baseUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(), // for registration
  role: Joi.string().valid('student', 'staff', 'professor', 'vendor', 'admin', 'eventOfficer').required(),
});

//Extended schemas for each role
const studentSchema = baseUserSchema.keys({
  uniID: Joi.string().required(),
  favoritesLists: Joi.array().items(Joi.string().hex().length(24)).default([]),
  registeredEvents: Joi.array().items(Joi.string().hex().length(24)).default([]),
  isActive: Joi.boolean().default(true),
  isVerified: Joi.boolean().default(false),
  wallet: Joi.number().min(0).default(0),
  notifications: Joi.array().items(Joi.string()).default([]),
});

const staffSchema = baseUserSchema.keys({
  favoritesLists: Joi.array().items(Joi.string().hex().length(24)).default([]),
  registeredEvents: Joi.array().items(Joi.string().hex().length(24)).default([]),
  wallet: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
  isVerified: Joi.boolean().default(false),
  notifications: Joi.array().items(Joi.string()).default([]),
});

const professorSchema = baseUserSchema.keys({
  favoritesLists: Joi.array().items(Joi.string().hex().length(24)).default([]),
  wallet: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
  isVerified: Joi.boolean().default(false),
  notifications: Joi.array().items(Joi.string()).default([]),
  workshops: Joi.array().items(Joi.string().hex().length(24)).default([]),
});

const vendorSchema = baseUserSchema.keys({
  companyName: Joi.string().required(),
  appliedEvents: Joi.array().items(Joi.string().hex().length(24)).default([]),
  isActive: Joi.boolean().default(true),
  isVerified: Joi.boolean().default(false),
});

const adminSchema = baseUserSchema.keys({
  notifications: Joi.array().items(Joi.string()).default([]),
});

const eventOfficerSchema = baseUserSchema.keys({
  notifications: Joi.array().items(Joi.string()).default([]),
  isActive: Joi.boolean().default(true),
  isVerified: Joi.boolean().default(false),
});

// Helper: choose which schema to use based on role
const getValidationSchema = (role) => {
  switch (role) {
    case 'student':
      return studentSchema;
    case 'staff':
      return staffSchema;
    case 'professor':
      return professorSchema;
    case 'vendor':
      return vendorSchema;
    case 'admin':
      return adminSchema;
    case 'eventOfficer':
      return eventOfficerSchema;
    default:
      return baseUserSchema;
  }
};

//Helper: choose which model to use based on role
const getUserModel = (role) => {
  switch (role) {
    case 'student':
      return Student;
    case 'staff':
      return Staff;
    case 'professor':
      return Professor;
    case 'vendor':
      return Vendor;
    case 'admin':
      return Admin;
    case 'eventOfficer':
      return EventOfficer;
    default:
      return User;
  }
};

