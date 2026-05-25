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
