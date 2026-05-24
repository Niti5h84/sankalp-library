const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  fatherName: { type: String },
  mobileNumber: { type: String, required: true },
  alternateNumber: { type: String },
  address: { type: String },
  aadhaarNumber: { type: String, unique: true, sparse: true },
  photoUrl: { type: String },
  admissionDate: { type: Date, default: Date.now },
  feeExpiryDate: { type: Date },
  seatNumber: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat' },
  shiftTiming: { type: String },
  monthlyFee: { type: Number, required: true },
  feeMonth: { type: String },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
