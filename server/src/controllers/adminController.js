import { Staff } from '../models/Users/Staff.js';
import { Professor } from '../models/Users/Professor.js';
import { Student } from '../models/Users/Student.js';
import { Admin } from '../models/Users/Admin.js';
import { EventOfficer } from '../models/Users/EventsOfficer.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

// Approve user (set isVerified = true and send verification email)
export const approveUser = async (req,res)=>{
  try{
    const { id } = req.params;
    const user = await Student.findById(id) || await Staff.findById(id) || await Professor.findById(id);
    if(!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    await user.save();

    const link = `${process.env.FRONTEND_URL}?verify=${user._id}`;
    await sendEmail({ to: user.email, subject: "Account Verified", html: `Your account is approved. Click <a href="${link}">here</a> to login.` });

    res.json({ message: "User approved and verification email sent", link });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// validation schema for creating admins/event officers
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

//admin creates an admin or events officer 
export const createUserByAdmin = async (req, res) => {
  try {
    //Extract the role from the route parameter
    const { role } = req.params; // example: /admin/create/admin or /admin/create/eventOfficer

    //Validate allowed roles
    if (!['admin', 'eventOfficer'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'eventOfficer'." });
    }

    // Validate request body
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = value;

    //Check if user already exists
    const Model = role === 'admin' ? Admin : EventOfficer;
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: `${role} with this email already exists` });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create and save user
    const newUser = new Model({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      isVerified: true // Admins and Event Officers are verified immediately
    });

    await newUser.save();

    //Respond
    res.status(201).json({
      message: `${role} account created successfully.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//admin deleting event officer or other admin by id 
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    // Check if target user is Admin or EventOfficer
    const user = await Admin.findById(id) || await EventOfficer.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: `${user.role} deleted successfully.` });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//  Admin can view all users
export const getAllUsers = async (req, res) => {
  try {
    const models = [Student, Staff, Professor, Admin, EventOfficer];

    const allUsers = [];

    // Loop through each model and collect users
    for (const Model of models) {
      const users = await Model.find({}, "name email role isVerified createdAt");
      allUsers.push(...users);
    }

    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

