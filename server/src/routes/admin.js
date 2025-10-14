import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { User } from '../models/Users/User.js';
import { Staff } from '../models/Users/Staff.js';
import { getAllUsers } from '../controllers/adminController.js';
import { Professor } from '../models/Users/Professor.js';
import { TA } from '../models/Users/TA.js';
import { EventOfficer } from '../models/Users/EventsOfficer.js';
import { sendEmail } from '../utils/email.js';
import { createUserByAdmin, deleteUserByAdmin } from '../controllers/adminController.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();

// Get pending users
router.get('/pending-users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ isVerified: false, role: { $nin: ['student', 'vendor', 'admin'] } });
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


// Approve user and send verification email
router.post('/approve-user/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    const validRoles = ['staff', 'ta', 'professor'];
    if (role && !validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role. Must be staff, ta, or professor.' });
    }

    let user =
      (await User.findById(id)) ||
      (await Staff.findById(id)) ||
      (await Professor.findById(id)) ||
      (await TA.findById(id));

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

// Create admin or event officer
router.post('/create/:role', requireAuth, requireAdmin, createUserByAdmin);

// Delete admin or event officer
router.delete('/delete-user/:id', requireAuth, requireAdmin, deleteUserByAdmin);

// ✅ Requirement 3: Admin block or unblock a user
router.patch('/toggle-user/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find the user in all possible models
    const models = [
      (await import('../models/Users/Student.js')).Student,
      (await import('../models/Users/Staff.js')).Staff,
      (await import('../models/Users/Professor.js')).Professor,
      (await import('../models/Users/Admin.js')).Admin,
      (await import('../models/Users/EventsOfficer.js')).EventOfficer,
    ];

    let userFound = null;

    for (const Model of models) {
      const found = await Model.findById(id);
      if (found) {
        userFound = found;
        break;
      }
    }

    if (!userFound) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Flip the isActive flag
    userFound.isActive = !userFound.isActive;
    await userFound.save();

    res.status(200).json({
      message: userFound.isActive
        ? `${userFound.name} has been unblocked`
        : `${userFound.name} has been blocked`,
      user: {
        id: userFound._id,
        name: userFound.name,
        email: userFound.email,
        role: userFound.role,
        isActive: userFound.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user active status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


export default router;