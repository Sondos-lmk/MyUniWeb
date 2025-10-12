import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { User } from '../models/Users/User.js';
import { Staff } from '../models/Users/Staff.js';
import { Professor } from '../models/Users/Professor.js';
import { TA } from '../models/Users/TA.js';
import { sendEmail } from '../utils/email.js';
import { createUserByAdmin } from '../controllers/adminController.js';
import { deleteUserByAdmin } from '../controllers/adminController.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();


// 📍 Get pending users

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


// ✅ Approve user and send verification email

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


// Create admin

// router.post('/create-admin', requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     console.log('Create Admin Attempt:', { name, email });

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Name, email, and password are required' });
//     }

//     if (!email.endsWith('@guc.edu.eg')) {
//       return res.status(400).json({ message: 'Email must end with @guc.edu.eg' });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     const passwordHash = await bcrypt.hash(password, 10);
//     const admin = new User({
//       name,
//       email,
//       passwordHash,
//       role: 'admin',
//       isVerified: true,
//     });

//     await admin.save();
//     console.log('Admin created:', { email, name });
//     res.status(201).json({ message: 'Admin account created successfully', admin: { name, email, role: 'admin' } });
//   } catch (err) {
//     console.error('Create Admin Error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });


// Delete admin

// router.delete('/delete-admin/:id', requireAuth, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const requestingUserId = req.user.userId;

//     if (id === requestingUserId) {
//       return res.status(400).json({ message: 'Cannot delete your own account' });
//     }

//     const admin = await User.findOne({ _id: id, role: 'admin' });
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin account not found' });
//     }

//     await admin.deleteOne();
//     console.log('Admin deleted:', { id, email: admin.email });
//     res.json({ message: 'Admin account deleted successfully' });
//   } catch (err) {
//     console.error('Delete Admin Error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });


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
//to create event ofiicer and admin(only admin)
router.post('/create/:role', requireAuth, requireAdmin, createUserByAdmin);

// Delete admin or event officer (Admin only)
router.delete('/delete-user/:id', requireAuth, requireAdmin, deleteUserByAdmin);

export default router;


