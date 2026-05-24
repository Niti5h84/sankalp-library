const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Seat = require('../models/Seat');
const Attendance = require('../models/Attendance');

// @route POST /api/students
// @desc Add a new student
router.post('/', async (req, res) => {
  try {
    const { studentId, fullName, fatherName, studentAddress, phone, seat, shift, totalFee, paidAmount, feeMonth } = req.body;
    
    // Hash default password (using phone number or default string)
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = String(phone || '123456');
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Calculate expiry date (30 days from now)
    const feeExpiryDate = new Date();
    feeExpiryDate.setDate(feeExpiryDate.getDate() + 30);

    const newStudent = new Student({
      studentId,
      fullName,
      fatherName,
      studentAddress,
      mobileNumber: phone,
      // mapping seat string to a simple field for now (to avoid populating object ID initially)
      address: seat, 
      shiftTiming: shift,
      monthlyFee: totalFee || 1000, // Use provided totalFee or default
      feeMonth: feeMonth || "",
      paidAmount: paidAmount || 0,
      feeExpiryDate,
      password: hashedPassword
    });

    const student = await newStudent.save();
    
    // Automatically reserve the seat if provided
    if (seat) {
      await Seat.findOneAndUpdate(
        { seatNumber: seat },
        { 
          $set: { status: 'Occupied', assignedTo: student._id },
          $setOnInsert: { floorNumber: 1, seatType: 'Normal' }
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/students
// @desc Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/students/:id
// @desc Update an existing student
router.put('/:id', async (req, res) => {
  try {
    const { studentId, fullName, fatherName, studentAddress, phone, seat, shift, totalFee, paidAmount, feeMonth } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    // Update Seat if changed
    if (student.address !== seat) {
      if (student.address) {
        await Seat.findOneAndUpdate({ seatNumber: student.address }, { status: 'Empty', assignedTo: null });
      }
      if (seat) {
        await Seat.findOneAndUpdate(
          { seatNumber: seat }, 
          { 
            $set: { status: 'Occupied', assignedTo: student._id },
            $setOnInsert: { floorNumber: 1, seatType: 'Normal' }
          },
          { upsert: true, new: true }
        );
      }
    }

    student.studentId = studentId || student.studentId;
    student.fullName = fullName || student.fullName;
    student.fatherName = fatherName !== undefined ? fatherName : student.fatherName;
    student.studentAddress = studentAddress !== undefined ? studentAddress : student.studentAddress;
    student.mobileNumber = phone || student.mobileNumber;
    student.address = seat || student.address;
    student.shiftTiming = shift || student.shiftTiming;
    student.monthlyFee = totalFee !== undefined ? totalFee : student.monthlyFee;
    student.paidAmount = paidAmount !== undefined ? paidAmount : student.paidAmount;
    student.feeMonth = feeMonth !== undefined ? feeMonth : student.feeMonth;

    await student.save();
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route DELETE /api/students/:id
// @desc Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });
    
    // Automatically free the seat
    if (student.address) {
      await Seat.findOneAndUpdate(
        { seatNumber: student.address },
        { status: 'Empty', assignedTo: null }
      );
    }
    
    // Delete attendance records
    await Attendance.deleteMany({ student: student._id });
    
    await student.deleteOne();
    res.json({ msg: 'Student removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/students/:id/renew
// @desc Renew a student's subscription for 30 days
router.post('/:id/renew', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });
    
    // Set expiry to 30 days from now (or from previous expiry if not yet expired)
    let newExpiry = new Date();
    if (student.feeExpiryDate && student.feeExpiryDate > newExpiry) {
      newExpiry = new Date(student.feeExpiryDate);
    }
    newExpiry.setDate(newExpiry.getDate() + 30);
    
    student.feeExpiryDate = newExpiry;
    await student.save();
    
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/students/:id/reset-password
// @desc Admin resets a student's password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);
    await student.save();

    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
