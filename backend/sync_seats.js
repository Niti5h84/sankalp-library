const mongoose = require('mongoose');
const Student = require('./models/Student');
const Seat = require('./models/Seat');

const MONGO_URI = 'mongodb+srv://admin:admin123@cluster0.zox90.mongodb.net/library?retryWrites=true&w=majority';

async function syncSeats() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Mark ALL seats as Available first
    await Seat.updateMany({}, { status: 'Available', assignedTo: null });
    console.log('Reset all seats to Available.');

    // 2. Find all Active students
    const activeStudents = await Student.find({ status: 'Active' });
    console.log(`Found ${activeStudents.length} active students.`);

    // 3. For each student, find their seat and mark it as Occupied
    for (const student of activeStudents) {
      if (student.address) {
        const seatNumber = student.address.trim();
        const seat = await Seat.findOneAndUpdate(
          { seatNumber: seatNumber },
          { 
            $set: { status: 'Occupied', assignedTo: student._id },
            $setOnInsert: { floorNumber: 1, seatType: 'Normal' }
          },
          { upsert: true, new: true }
        );
        console.log(`Seat ${seatNumber} marked as Occupied by ${student.fullName}`);
      }
    }

    console.log('Sync complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

syncSeats();
