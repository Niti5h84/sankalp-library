const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Admin' },
  securityPin: { type: String, default: '' },
  securityQuestion: { type: String, default: '' },
  securityAnswer: { type: String, default: '' },
  pushSubscriptions: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
