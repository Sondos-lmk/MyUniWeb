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
import { Booth } from '../models/Events/Booth.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import fs from 'fs';
import path from 'path';

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

// Get all users (for Admin or Event Officer)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash'); // exclude passwordHash
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // user ID from route
    if (!id) return res.status(400).json({ message: "User ID is required" });

    // Find the user in all collections (or just User base if you store all)
    // If using discriminators, you can just query the base User model
    const user = await User.findById(id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Get vendor profile (logo, tax document, company info)
export async function getVendorProfile(req, res) {
  try {
    const vendorId = req.user.id;
    const vendor = await Vendor.findById(vendorId).select('companyName logo taxDocument isVerified').lean();
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        logo: vendor.logo,
        taxDocument: vendor.taxDocument,
        isVerified: vendor.isVerified,
      },
    });
  } catch (err) {
    console.error('Error fetching vendor profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
// Edit vendor profile (logo and other fields)
// Edit vendor profile (logo and other fields)
export async function editVendorProfile(req, res) {
  try {
    const vendorId = req.user.id;
    const { companyName } = req.body;

    console.log('🔍 editVendorProfile called with:', {
      vendorId,
      companyName,
      hasFile: !!req.file,
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : 'No file received'
    });

    // Find current vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      console.log('❌ Vendor not found:', vendorId);
      return res.status(404).json({ message: 'Vendor not found' });
    }

    console.log('✅ Found vendor:', {
      id: vendor._id,
      companyName: vendor.companyName,
      currentLogo: vendor.logo
    });

    // Update company name if provided
    if (companyName) {
      vendor.companyName = companyName;
      console.log('📝 Updated company name to:', companyName);
    }

    // Handle new logo upload
    if (req.file) {
      console.log('🖼️ Processing logo upload...');
      
      // Delete old logo if exists
      if (vendor.logo) {
        const oldPath = path.join(process.cwd(), vendor.logo);
        console.log('🗑️ Checking old logo at:', oldPath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('✅ Deleted old logo');
        } else {
          console.log('ℹ️ Old logo file not found at:', oldPath);
        }
      }

      // Save new logo path
      const newLogoPath = `/uploads/vendors/${req.file.filename}`;
      vendor.logo = newLogoPath;
      console.log('💾 Set new logo path to:', newLogoPath);
    } else {
      console.log('⚠️ No logo file in request - req.file is:', req.file);
    }

    // Log before save
    console.log('💾 About to save vendor with data:', {
      companyName: vendor.companyName,
      logo: vendor.logo
    });

    // Save changes
    const savedVendor = await vendor.save();
    console.log('✅ Vendor saved successfully:', {
      id: savedVendor._id,
      companyName: savedVendor.companyName,
      logo: savedVendor.logo
    });

    // Verify the save worked by fetching fresh data
    const freshVendor = await Vendor.findById(vendorId);
    console.log('🔍 Fresh vendor data from DB:', {
      companyName: freshVendor.companyName,
      logo: freshVendor.logo
    });

    res.status(200).json({
      message: 'Vendor profile updated successfully',
      vendor: {
        id: freshVendor._id,
        companyName: freshVendor.companyName,
        logo: freshVendor.logo,
        taxDocument: freshVendor.taxDocument,
        isVerified: freshVendor.isVerified,
      },
    });

  } catch (err) {
    console.error('❌ Error updating vendor profile:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
}

//////////////////////////////////////////


// Submit workers information for a booth/bazaar application
export const submitWorkers = async (req, res) => {
  try {
    const { id } = req.params; // Event ID
    const vendorId = req.user.id;
    const files = req.files || {};

    console.log('🔍 Worker submission request received:');
    console.log('Event ID:', id);
    console.log('Vendor ID:', vendorId);
    console.log('Request body:', req.body);
    console.log('Uploaded files count:', files.workers ? files.workers.length : 0);

    // Extract worker names from the correct format
    let workersData = [];
    
    // Check if workers data is sent as an array in req.body.workers
    if (req.body.workers && Array.isArray(req.body.workers)) {
      workersData = req.body.workers.map((worker, index) => ({
        name: worker.name,
        index: index
      }));
      console.log('Extracted worker names from array:', workersData);
    } 
    // Fallback to the original format
    else {
      let index = 0;
      while (req.body[`workers[${index}][name]`]) {
        workersData.push({
          name: req.body[`workers[${index}][name]`],
          index: index
        });
        index++;
      }
      console.log('Extracted worker names from indexed format:', workersData);
    }

    if (workersData.length === 0) {
      console.log('❌ No worker names found in request');
      return res.status(400).json({ message: 'At least one worker is required' });
    }

    // Validate that we have ID pictures for all workers
    if (!files.workers || files.workers.length !== workersData.length) {
      console.log('❌ File count mismatch:', {
        filesCount: files.workers ? files.workers.length : 0,
        workersCount: workersData.length
      });
      return res.status(400).json({ 
        message: 'ID picture required for each worker' 
      });
    }

    // Try to find the event in Booth or Bazaar
    let event = await Booth.findById(id);
    if (!event) {
      event = await Bazaar.findById(id);
    }

    if (!event) {
      console.log('❌ Event not found with ID:', id);
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find the vendor's application in registeredVendors
    const vendorApplication = event.registeredVendors.find(
      rv => rv.vendor.toString() === vendorId
    );

    if (!vendorApplication) {
      console.log('❌ Vendor application not found');
      return res.status(404).json({ 
        message: 'Application not found for this vendor' 
      });
    }

    // Check if application is approved
    if (vendorApplication.status !== 'approved') {
      console.log('❌ Application not approved, status:', vendorApplication.status);
      return res.status(400).json({ 
        message: 'Application must be approved before adding workers' 
      });
    }

    // Check if workers already submitted
    if (vendorApplication.workersSubmitted) {
      console.log('❌ Workers already submitted');
      return res.status(400).json({ 
        message: 'Workers information already submitted' 
      });
    }

    // Process and save worker information
    const workers = [];
    
    for (let i = 0; i < workersData.length; i++) {
      const workerFile = files.workers[i];
      const workerName = workersData[i].name;

      if (!workerName || !workerName.trim()) {
        console.log('❌ Worker name missing for index:', i);
        // Clean up uploaded files
        if (files.workers) {
          files.workers.forEach(file => {
            const filePath = path.join(process.cwd(), file.path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
        }
        
        return res.status(400).json({ 
          message: `Worker ${i + 1} name is required` 
        });
      }

      workers.push({
        name: workerName.trim(),
        idPicture: `/uploads/workers/${workerFile.filename}`,
        addedAt: new Date()
      });
    }

    // Update vendor application with workers
    vendorApplication.workers = workers;
    vendorApplication.workersSubmitted = true;

    await event.save();

    console.log('✅ Workers submitted successfully:', workers);
    res.status(200).json({
      message: 'Workers information submitted successfully',
      workers: workers.map(w => ({ name: w.name, addedAt: w.addAt }))
    });

  } catch (err) {
    console.error('❌ Error submitting workers:', err);
    
    // Clean up uploaded files on error
    if (req.files && req.files.workers) {
      req.files.workers.forEach(file => {
        const filePath = path.join(process.cwd(), file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get workers information for a vendor's application
export const getWorkers = async (req, res) => {
  try {
    const { id } = req.params; // Event ID
    const vendorId = req.user.id;

    // Try to find the event in Booth or Bazaar
    let event = await Booth.findById(id);
    if (!event) {
      event = await Bazaar.findById(id);
    }

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find the vendor's application
    const vendorApplication = event.registeredVendors.find(
      rv => rv.vendor.toString() === vendorId
    );

    if (!vendorApplication) {
      return res.status(404).json({ 
        message: 'Application not found for this vendor' 
      });
    }

    res.status(200).json({
      workers: vendorApplication.workers || [],
      workersSubmitted: vendorApplication.workersSubmitted || false
    });

  } catch (err) {
    console.error('Error fetching workers:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
