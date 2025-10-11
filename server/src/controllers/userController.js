import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { User } from '../models/Users/User.js';
import { Student } from '../models/Users/Student.js';
import { Staff } from '../models/Users/Staff.js';
import { Professor } from '../models/Users/Professor.js';
import { Vendor } from '../models/Users/Vendor.js';
import { Admin } from '../models/Users/Admin.js';
import { TA } from '../models/Users/TA.js';
import { EventOfficer } from '../models/Users/EventsOfficer.js';
import { sendEmail } from '../utils/email.js';


// Base schema including confirmPassword

const baseUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().required(),
  role: Joi.string().valid('student', 'staff', 'ta', 'professor', 'vendor', 'admin', 'eventOfficer').required(),
});

// Role-based schemas

const studentSchema = baseUserSchema.keys({ uniID: Joi.string().required() });
const staffSchema = baseUserSchema.keys({ uniID: Joi.string().required() });
const taSchema = baseUserSchema.keys({ uniID: Joi.string().required() });
const professorSchema = baseUserSchema.keys({ uniID: Joi.string().required() });
const vendorSchema = baseUserSchema.keys({ companyName: Joi.string().required() });


// Helpers
const getValidationSchema = role => {
  switch(role){
    case 'student': return studentSchema;
    case 'staff': return staffSchema;
    case 'ta': return taSchema;           // added TA
    case 'professor': return professorSchema;
    case 'vendor': return vendorSchema;
    default: return baseUserSchema;
  }
};

const getUserModel = role => {
  switch(role){
    case 'student': return Student;
    case 'staff': return Staff;
    case 'ta': return TA;             // TA stored in Staff collection
    case 'professor': return Professor;
    case 'vendor': return Vendor;
    case 'admin': return Admin;
    case 'eventOfficer': return EventOfficer;
    default: return User;
  }
};

// Registration
export const registerUser = async (req,res) => {
  try {
    const { role, email, password, confirmPassword } = req.body;

    // Disallow Admin/EventOfficer self-register
    if(['admin','eventOfficer'].includes(role)){
      return res.status(403).json({ message: "Cannot self-register as Admin or Event Officer" });
    }

    // Enforce GUC emails for student/staff/prof/ta
    if(['student','staff','ta','professor'].includes(role)){
      const gucPattern = role==='student' ? /@student\.guc\.edu\.eg$/ : /@guc\.edu\.eg$/;
      if(!gucPattern.test(email)){
        return res.status(400).json({ message: "Use a valid GUC email" });
      }
    }

    // Validation
    const schema = getValidationSchema(role);
    const { error, value } = schema.validate(req.body);
    if(error) return res.status(400).json({ message: error.details[0].message });

    // Check password match
    if(password !== confirmPassword){
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const UserModel = getUserModel(role);
    const exists = await UserModel.findOne({ email });
    if(exists) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Remove confirmPassword before saving
    const { confirmPassword: _, ...userData } = value;

    const newUser = new UserModel({
      ...userData,
      passwordHash: hashedPassword,
      isVerified: ['vendor','student'].includes(role) ? true : false
    });

    await newUser.save();

    // Send verification email for non-vendor roles
    if(['student','staff','ta','professor'].includes(role)){
      const link = `${process.env.FRONTEND_URL}?verify=${newUser._id}`;
      await sendEmail(email, "Verify your account", `Click this link to verify: ${link}`);
    }

    res.status(201).json({ message: "Registration successful. Await admin verification if required.", user: newUser });

  } catch(err){
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const loginUser = async (req,res) => {
  try{
    const { email, password, role } = req.body;
    const UserModel = getUserModel(role);
    const user = await UserModel.findOne({ email });
    if(!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if(!match) return res.status(400).json({ message: "Invalid credentials" });

    if(!user.isVerified && ['student','staff','ta','professor'].includes(user.role)){
      return res.status(403).json({ message: "Account not verified by admin" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: "Login successful", token });

  }catch(err){
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
