const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// @route GET /api/attendance
// @desc Get attendance records (can filter by month/student)
router.get('/', async (req, res) => {
  try {
    const { studentId, month, year } = req.query;
    let query = {};
    
    if (studentId) query.student = studentId;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).populate('student', 'fullName studentId');
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/attendance
// @desc Mark attendance
router.post('/', async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    
    // Normalize date to start of day
    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ student: studentId, date: recordDate });
    
    if (attendance) {
      // Update existing
      attendance.status = status;
      await attendance.save();
    } else {
      // Create new
      attendance = new Attendance({
        student: studentId,
        date: recordDate,
        status
      });
      await attendance.save();
    }
    
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
