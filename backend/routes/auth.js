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

// @route POST /api/auth/forgot-password
// @desc Send password reset/recovery info email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ msg: 'Email not found in our records.' });

    // In a real app, generate a secure token here.
    const resetLink = `http://localhost:3000/admin/reset-password?token=dummy-token-123`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@sankalplibrary.com',
      to: email,
      subject: 'Password Recovery - Sankalp Library',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #0b223f; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: #d4af37;">Sankalp Library</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <h3>Hello ${admin.name},</h3>
            <p>We received a request to view or reset your account details for the Admin Panel.</p>
            <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
              <li><strong>Name:</strong> ${admin.name}</li>
              <li><strong>Email:</strong> ${admin.email}</li>
            </ul>
            <p>For security reasons, your actual password is encrypted and cannot be shown. To create a new password, click the secure link below:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetLink}" style="background-color: #0b223f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    // Note: If .env variables are not set, this will fail in production.
    // For local testing without a real email, we can just send success if not configured.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Nodemailer is not configured with real credentials. The email content would be:', mailOptions.html);
      return res.json({ msg: 'Mock email sent! Check terminal. (Set EMAIL_USER in .env for real emails)' });
    }

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Recovery email sent successfully!' });

  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ msg: 'Failed to send recovery email. Check server configuration.' });
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
