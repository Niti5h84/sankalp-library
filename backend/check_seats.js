const mongoose = require('mongoose');
const Seat = require('./models/Seat');
require('dotenv').config();

const printSeats = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const seats = await Seat.find();
    console.log(JSON.stringify(seats, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
printSeats();
