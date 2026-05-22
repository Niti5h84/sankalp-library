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

// Basic API Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Sankalp Library API is running smoothly.' });
});

const Student = require('./models/Student');

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments(); // Assuming all are active for now, update status logic later if needed
    
    // For now, hardcode the total seats capacity to 100 for calculation
    const totalSeats = 100;
    const occupiedSeats = totalStudents;
    const emptySeats = totalSeats - occupiedSeats;

    res.json({
      totalStudents: totalStudents,
      activeStudents: activeStudents,
      emptySeats: emptySeats,
      occupiedSeats: occupiedSeats,
      todayAttendance: 0,
      todayCollection: 0,
      pendingFees: 0,
      monthlyRevenue: 0
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
