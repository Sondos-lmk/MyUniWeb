import express from 'express';
import { requireAuth, requireAdmin, requireEventOfficerOrAdmin } from '../middleware/auth.js';
import { User } from '../models/Users/User.js';
import { Staff } from '../models/Users/Staff.js';
import { Student } from '../models/Users/Student.js';
import { getAllUsers } from '../controllers/adminController.js';
import { Professor } from '../models/Users/Professor.js';
import { TA } from '../models/Users/TA.js';
import { EventOfficer } from '../models/Users/EventsOfficer.js';
import { sendEmail } from '../utils/email.js';
import { createUserByAdmin, deleteUserByAdmin } from '../controllers/adminController.js';
import { getAttendeesReport, getRevenueReport } from '../controllers/eventController.js';
import { blockUser, unblockUser } from "../controllers/adminController.js";

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();



// Get pending users
router.get('/pending-users', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Fetch pending users across user models but exclude students (they receive verification immediately)
    const pendingUsers = await User.find({ isVerified: false, role: { $nin: ['vendor', 'admin', 'student'] } });
    const pendingStaff = await Staff.find({ isVerified: false });
    const pendingProf = await Professor.find({ isVerified: false });
    const pendingTA = await TA.find({ isVerified: false });

    const allPendingUsers = [...pendingUsers, ...pendingStaff, ...pendingProf, ...pendingTA];

    // Remove duplicates by email
    const uniquePendingUsers = allPendingUsers.filter(
      (user, index, self) => index === self.findIndex((u) => u.email === user.email)
    );

    console.log('Unique Pending Users:', uniquePendingUsers.length);
    res.json(uniquePendingUsers);
  } catch (err) {
    console.error('Pending Users Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Admin view all users (Requirement 2)
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.patch("/users/:id/block", requireAuth, requireAdmin, blockUser);
router.patch("/users/:id/unblock", requireAuth, requireAdmin, unblockUser);

// Approve user and send verification email
router.post('/approve-user/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

  const validRoles = ['staff', 'ta', 'professor', 'student'];
    if (role && !validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role. Must be staff, ta, or professor.' });
    }

    // Try to find the user across all relevant models, including Student
    let user =
      (await User.findById(id)) ||
      (await Staff.findById(id)) ||
      (await Professor.findById(id)) ||
      (await TA.findById(id)) ||
      (await Student.findById(id));

    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      console.log('Cannot approve admin:', id);
      return res.status(400).json({ message: 'Cannot approve admin accounts' });
    }

    // Generate verification token and expiry
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Move user to correct model if role changes
    let newUser;
    if (role && role !== user.role) {
      const Model =
        role === 'student' ? Student :
        role === 'staff' ? Staff :
        role === 'professor' ? Professor :
        role === 'ta' ? TA :
        User;

      newUser = new Model({
        ...user.toObject(),
        role,
        verificationToken,
        verificationExpires,
      });

      await newUser.save();
      await user.deleteOne(); // remove from old collection
    } else {
      user.verificationToken = verificationToken;
      user.verificationExpires = verificationExpires;
      await user.save();
      newUser = user;
    }

    // Send verification email
    const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify/${verificationToken}`;
    await sendEmail({
      to: newUser.email,
      subject: 'Verify Your University Event Management Account',
      html: `
        <p>Hello ${newUser.name || 'User'},</p>
        <p>Your account has been approved. Please verify your email by clicking the link below:</p>
        <a href="${verifyLink}" target="_blank">${verifyLink}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    console.log('User Approval Initiated:', { email: newUser.email, role: newUser.role });
    res.json({
      message: 'Verification email sent successfully',
      user: { name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error('Approve Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all admins
router.get('/admins', requireAuth, requireAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('name email role');
    console.log('Admins Fetched:', admins.length);
    res.json(admins);
  } catch (err) {
    console.error('Fetch Admins Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all event officers
router.get('/event-officers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const eventOfficers = await EventOfficer.find().select('name email role');
    console.log('Event Officers Fetched:', eventOfficers.length);
    res.json(eventOfficers);
  } catch (err) {
    console.error('Fetch Event Officers Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reports: attendees per event (filterable)
// Allow both Admins and Event Officers to access this report
router.get('/reports/attendees', requireAuth, requireEventOfficerOrAdmin, getAttendeesReport);

// Reports: revenue from events (filterable and sortable)
// Allow both Admins and Event Officers to access this report
router.get('/reports/revenue', requireAuth, requireEventOfficerOrAdmin, getRevenueReport);

// Create admin or event officer
router.post('/create/:role', requireAuth, requireAdmin, createUserByAdmin);

// Delete admin or event officer
router.delete('/delete-user/:id', requireAuth, requireAdmin, deleteUserByAdmin);


export default router;