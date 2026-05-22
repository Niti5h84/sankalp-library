const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true, unique: true },
  floorNumber: { type: Number, required: true },
  seatType: { type: String, enum: ['Normal', 'Cabin', 'AC'], default: 'Normal' },
  status: { type: String, enum: ['Occupied', 'Empty', 'Reserved'], default: 'Empty' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Seat', seatSchema);
