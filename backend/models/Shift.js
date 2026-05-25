const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['AC', 'Non-AC']
  },
  timeRange: { 
    type: String, 
    required: true 
  },
  durationText: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  colorCode: {
    type: String,
    default: 'blue-700'
  }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
