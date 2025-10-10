import { Staff } from '../models/Users/Staff.js';
import { Professor } from '../models/Users/Professor.js';
import { Student } from '../models/Users/Student.js';
import { Admin } from '../models/Users/Admin.js';
import { EventOfficer } from '../models/Users/EventsOfficer.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';

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

// Admin creates Admin/EventOfficer
export const createAdminOrEventOfficer = async (req,res)=>{
  try{
    const { name, email, password, role } = req.body;
    if(!['admin','eventOfficer'].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const Model = role==='admin' ? Admin : EventOfficer;
    const exists = await Model.findOne({ email });
    if(exists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Model({ name, email, passwordHash: hashedPassword, isVerified: true });
    await newUser.save();
    res.status(201).json({ message: `${role} account created`, user: newUser });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
