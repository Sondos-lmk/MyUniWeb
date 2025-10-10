import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/Users/User.js';
import { Staff } from '../models/Users/Staff.js';
import { Professor } from '../models/Users/Professor.js';
import { TA } from '../models/Users/TA.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, uniID, companyName } = req.body;
    console.log('Register Attempt:', { name, email, role, uniID, companyName });

    // Validate required fields
    // Validate required fields
if (!email || !password || !role) {
  console.log("Missing required fields");
  return res.status(400).json({ message: "Missing required fields" });
}

// Vendors don't need a name
if (role !== "vendor" && !name) {
  return res.status(400).json({ message: "Name is required" });
}

// Validate confirmPassword
if (password !== confirmPassword) {
  return res.status(400).json({ message: "Passwords do not match" });
}

const validRoles = ["student", "staff", "ta", "professor", "vendor"];
if (!validRoles.includes(role)) {
  return res.status(400).json({ message: "Invalid role" });
}

// Validate email domain based on role
if (role === "student" && !email.endsWith("@student.guc.edu.eg")) {
  return res.status(400).json({ message: "Student email must end with @student.guc.edu.eg" });
}


 //temporairly disable domain check for staff, ta, professor, admin
/*if (["staff", "ta", "professor", "admin"].includes(role) && !email.endsWith("@guc.edu.eg")) {
  return res.status(400).json({ message: `${role} email must end with @guc.edu.eg` });
}*/

// For testing purposes, allow Gmail for staff/ta/professor
if (['staff', 'ta', 'professor', 'admin'].includes(role)) {
  if (!email.endsWith('@guc.edu.eg') && !email.endsWith('@gmail.com')) {
    return res.status(400).json({ message: `${role} email must end with @guc.edu.eg (or @gmail.com for testing)` });
  }
}




// Vendors can use any email, so no domain check needed

// Validate uniID for specific roles
if (["student", "staff", "ta", "professor"].includes(role) && !uniID) {
  return res.status(400).json({ message: "University ID required" });
}

// Validate companyName for vendor
if (role === "vendor" && !companyName) {
  return res.status(400).json({ message: "Company name required" });
}


    const Model = role === 'staff' ? Staff : role === 'professor' ? Professor : role === 'ta' ? TA : User;

    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (uniID && (await Model.findOne({ uniID }))) {
      console.log('uniID already exists:', uniID);
      return res.status(400).json({ message: 'University ID already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new Model({
      name,
      email,
      passwordHash,
      role,
      isVerified: ['student', 'vendor'].includes(role), // Auto-verify student and vendor
      uniID: ['student', 'staff', 'ta', 'professor'].includes(role) ? uniID : undefined,
      companyName: role === 'vendor' ? companyName : undefined,
    });

    await user.save();
    console.log('User registered:', { email, name, role, uniID, companyName, isVerified: user.isVerified });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login Attempt:', { email });

    // Check all models
    let user =
      (await User.findOne({ email })) ||
      (await Staff.findOne({ email })) ||
      (await Professor.findOne({ email })) ||
      (await TA.findOne({ email }));

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Require isVerified for staff, professor, ta, but not for student, vendor, or admin
    if (!['student', 'vendor', 'admin'].includes(user.role) && !user.isVerified) {
      console.log('User not verified:', email);
      return res.status(403).json({ message: 'Account not verified. Please wait for admin approval.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Login Success:', { email, role: user.role, isVerified: user.isVerified });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Email verification route 
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Search in all possible models
    const user =
      (await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() },
      })) ||
      (await Staff.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() },
      })) ||
      (await Professor.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() },
      })) ||
      (await TA.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() },
      }));

    if (!user) {
      console.log("Invalid or expired verification link");
      return res.status(400).send("<h1>Invalid or expired verification link</h1>");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log(" User verified successfully:", user.email);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).send("<h1>Server error verifying email</h1>");
  }
});



export default router;