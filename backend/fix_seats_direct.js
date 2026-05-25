const mongoose = require('mongoose');
const Student = require('./models/Student');
const Seat = require('./models/Seat');

const fixSeats = async () => {
  try {
    await mongoose.connect("mongodb+srv://mkrajkumar2022_db_user:Niti5h%40123@cluster0.ekrzeit.mongodb.net/library?appName=Cluster0");
    console.log("Connected to production DB...");

    const students = await Student.find();
    for (const student of students) {
      if (student.address) {
        console.log(`Fixing seat ${student.address} for student ${student.fullName}`);
        await Seat.findOneAndUpdate(
          { seatNumber: student.address },
          { 
            $set: { status: 'Occupied', assignedTo: student._id },
            $setOnInsert: { floorNumber: 1, seatType: 'Normal' }
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log("Fixed all seats successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixSeats();
