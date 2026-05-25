const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sankalp-library')
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/shifts', require('./routes/shifts'));
app.use('/api/notifications', require('./routes/notifications'));

// Initialize Cron Jobs
require('./cron');

// TEMPORARY SYNC ENDPOINT
app.get('/api/sync-seats', async (req, res) => {
  const Student = require('./models/Student');
  const Seat = require('./models/Seat');
  try {
    await Seat.updateMany({}, { status: 'Empty', assignedTo: null });
    const students = await Student.find({});
    let syncData = [];
    for (const student of students) {
      if (student.address) {
        const seatNumber = student.address.trim();
        const roomNum = parseInt(String(student.studentId).replace(/\D/g, ''), 10) || 1;
        await Seat.findOneAndUpdate(
          { seatNumber: seatNumber },
          { $set: { status: 'Occupied', assignedTo: student._id, floorNumber: roomNum }, $setOnInsert: { seatType: 'Normal' } },
          { upsert: true, new: true }
        );
        syncData.push(`Synced ${seatNumber} for ${student.fullName} in Room ${roomNum}`);
      }
    }
    res.json({ message: 'Sync complete', details: syncData });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Basic API Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Sankalp Library API is running smoothly.' });
});

const Student = require('./models/Student');

  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const students = await Student.find({});
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'Active').length;
      
      const totalSeats = 100;
      const occupiedSeats = activeStudents;
      const emptySeats = totalSeats - occupiedSeats;
      
      let totalCollection = 0;
      let pendingFees = 0;
      
      students.forEach(s => {
        totalCollection += (s.paidAmount || 0);
        const pending = (s.monthlyFee || 0) - (s.paidAmount || 0);
        if (pending > 0) {
          pendingFees += pending;
        }
      });
  
      res.json({
        totalStudents,
        activeStudents,
        emptySeats,
        occupiedSeats,
        todayAttendance: 0,
        totalCollection: totalCollection,
        pendingFees: pendingFees,
        monthlyRevenue: totalCollection // For now, setting it same as total
      });
    } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ msg: "Server Error fetching stats" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
