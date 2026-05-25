const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');

// Configure Nodemailer Transport (Requires App Password for Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// @route POST /api/auth/register
// @desc Register a new admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin exists
    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ msg: 'Admin already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();

    res.status(201).json({ msg: 'Admin registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/auth/login
// @desc Authenticate admin & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Match password
    const isMatch = await bcrypt.compare(String(password), admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Return JSON Web Token
    const payload = { admin: { id: admin.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/auth/reset-password-direct
// @desc Directly reset admin password without email
router.post('/reset-password-direct', async (req, res) => {
  try {
    const { email, newPassword, securityPin, securityQuestion, securityAnswer, recoveryMethod } = req.body;
    
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ msg: 'Admin not found with this email.' });

    // If security is set up, verify it based on the chosen method
    if (admin.securityPin && admin.securityAnswer) {
      if (recoveryMethod === 'pin') {
        if (!securityPin || admin.securityPin !== securityPin) {
          return res.status(400).json({ msg: 'Invalid Security PIN.' });
        }
      } else if (recoveryMethod === 'question') {
        if (!securityAnswer || admin.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase() || admin.securityQuestion !== securityQuestion) {
          return res.status(400).json({ msg: 'Invalid Security Question or Answer.' });
        }
      } else {
        return res.status(400).json({ msg: 'Please select a valid recovery method.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ msg: 'Password updated successfully! You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/auth/update-security
// @desc Update admin security PIN and Question
router.post('/update-security', async (req, res) => {
  try {
    const { adminId, securityPin, securityQuestion, securityAnswer } = req.body;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ msg: 'Admin not found.' });

    admin.securityPin = securityPin;
    admin.securityQuestion = securityQuestion;
    admin.securityAnswer = securityAnswer;
    await admin.save();

    res.json({ msg: 'Security settings updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// STUDENT AUTHENTICATION
const Student = require('../models/Student');

// @route POST /api/auth/student/register
// @desc Register a new student (Self-signup)
router.post('/student/register', async (req, res) => {
  try {
    const { studentId, fullName, mobileNumber, password } = req.body;
    
    // Check if student exists
    let student = await Student.findOne({ mobileNumber });
    if (student) return res.status(400).json({ msg: 'Student with this mobile number already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    student = new Student({ 
      studentId: studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`, 
      fullName, 
      mobileNumber, 
      password: hashedPassword,
      monthlyFee: 1000 // default mock fee
    });
    await student.save();

    res.status(201).json({ msg: 'Student registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/auth/student/login
// @desc Authenticate student & get token
router.post('/student/login', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    // Check for student
    const student = await Student.findOne({ mobileNumber });
    if (!student) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Match password
    const isMatch = await bcrypt.compare(String(password), student.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Return JSON Web Token
    const payload = { student: { id: student.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        student: { 
          id: student.id, 
          studentId: student.studentId, 
          fullName: student.fullName 
        } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
