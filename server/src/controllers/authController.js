import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/Users/User.js';
import { Staff } from '../models/Users/Staff.js';
import { Professor } from '../models/Users/Professor.js';
import { TA } from '../models/Users/TA.js';
import { Admin } from '../models/Users/Admin.js';
import { EventOfficer } from '../models/Users/EventsOfficer.js';
import { Student } from '../models/Users/Student.js';
import { Vendor } from '../models/Users/Vendor.js';
import Joi from 'joi'; // ✅ Add Joi for validation
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';

function getModelByRole(role) {
  const roleMap = {
    admin: Admin,
    eventsofficer: EventOfficer,
    professor: Professor,
    staff: Staff,
    student: Student,
    ta: TA,
    user: User,
    vendor: Vendor
  };

  // default fallback
  return roleMap[role?.toLowerCase()] || User;
}



// ✅ Register Schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  role: Joi.string().valid('student', 'staff', 'ta', 'professor', 'vendor', 'admin').required(),
  uniID: Joi.string().allow(null, ''),
  companyName: Joi.string().allow(null, '')
});

// ✅ Login Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ---------- REGISTER ----------
export async function register(req, res) {
  try {
    // Validate input with Joi
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { name, email, password, role, uniID, companyName } = value;
    console.log('Register Attempt:', { name, email, role, uniID, companyName });

    // ✅ Role-based email validation
    if (role === 'student' && !email.endsWith('@student.guc.edu.eg')) {
      return res
        .status(400)
        .json({ message: 'Student email must end with @student.guc.edu.eg' });
    }

     if (['staff', 'ta', 'professor', 'admin'].includes(role)) {
      if (!email.endsWith('@guc.edu.eg') ) { 
        return res.status(400).json({
          message: `${role} email must end with @guc.edu.eg `,
        });
      }
    }

    // Require companyName for vendor(to solve vendor sign up server error)
    if (role === 'vendor' && (!companyName || companyName === '')) {
      return res.status(400).json({
        message: 'Company name is required for vendors',
      });
    }

    // Choose correct model
   const Model = getModelByRole(role); // instead of manually checking all models


    // Check if email or ID already exists
    if (await Model.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    if (uniID && await Model.findOne({ uniID }))
      return res.status(400).json({ message: 'University ID already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    if (role === 'vendor') {
      user = new Vendor({
        email,
        passwordHash,
        role: 'vendor',
        companyName: companyName.trim(),
        isVerified: true,
      });
      await user.save();
      console.log('Vendor registered (auto-verified):', { email });
      return res.status(201).json({ message: 'Vendor registered successfully' });
    }

    user = new Model({
      name,
      email,
      passwordHash,
      role,
      uniID,
      isVerified: false,
    });

    // If the registrant is a student, generate verification token and send email immediately
    if (role === 'student') {
      try {
        const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        user.verificationToken = verificationToken;
        user.verificationExpires = verificationExpires;
      } catch (err) {
        console.error('Error generating verification token:', err);
      }
    }

    await user.save();

    // Send verification email for students (do not block registration on email failure)
    if (role === 'student') {
      const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify/${user.verificationToken}`;
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify Your University Event Management Account',
          html: `
            <p>Hello ${user.name || 'Student'},</p>
            <p>Thanks for registering. Please verify your email by clicking the link below:</p>
            <a href="${verifyLink}" target="_blank">${verifyLink}</a>
            <p>This link will expire in 24 hours.</p>
          `,
        });
        console.log('Verification email sent to:', user.email);
      } catch (err) {
        console.error('Failed to send verification email:', err);
        // Do not fail registration if email sending fails; return 201 but warn client/logs
      }
    }

    console.log('User registered:', { email, name, role });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


// ---------- LOGIN ----------
export async function login(req, res) {
  try {
    // Validate input
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = value;
    console.log('Login Attempt:', { email });

    // Find user in all models (include Student, Vendor, Admin, EventOfficer)
    let user =
      (await User.findOne({ email })) ||
      (await Student.findOne({ email })) ||
      (await Staff.findOne({ email })) ||
      (await Professor.findOne({ email })) ||
      (await TA.findOne({ email })) ||
      (await Admin.findOne({ email })) ||
      (await EventOfficer.findOne({ email })) ||
      (await Vendor.findOne({ email }));

    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    // Check verification (except student/vendor/admin)
    if (!['vendor', 'admin'].includes(user.role) && !user.isVerified)
      return res.status(403).json({ message: 'Account not verified' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    // ✅ Use your helper function to sign the token
    const token = signToken(user);

    console.log('Login Success:', { email, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      // role: user.role,
      // user: publicUser(user)
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}



// ---------- VERIFY EMAIL ----------
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const user =
      (await User.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } })) ||
      (await Student.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } })) ||
      (await Staff.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } })) ||
      (await Professor.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } })) ||
      (await TA.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } })) ||
      (await EventOfficer.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } })) ||
      (await Admin.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } }));

    if (!user)
      return res.status(400).send('<h1>Invalid or expired verification link</h1>');

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log('User verified:', user.email);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (err) {
    console.error('Verification Error:', err);
    res.status(500).send('<h1>Server error verifying email</h1>');
  }
}

export async function me(req, res) {
  try {
    const Model = getModelByRole(req.user.role);
    const user = await Model.findById(req.user.id).lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('me() error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}



function signToken(user) {
  const payload = { id: user._id.toString(), name: user.name, role: user.role, companyName: user.companyName };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function publicUser(u) {
  return { id: u._id?.toString() || u.id, name: u.name, email: u.email, role: u.role, companyName: u.companyName };
}
