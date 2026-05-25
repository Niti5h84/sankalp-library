const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');

// @route   GET /api/shifts
// @desc    Get all shifts grouped or flat
router.get('/', async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ createdAt: 1 });
    res.json(shifts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/shifts
// @desc    Add a new shift
router.post('/', async (req, res) => {
  try {
    const { category, timeRange, durationText, price, colorCode } = req.body;
    const newShift = new Shift({
      category, timeRange, durationText, price, colorCode: colorCode || 'blue-700'
    });
    await newShift.save();
    res.status(201).json(newShift);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/shifts/:id
// @desc    Update a shift
router.put('/:id', async (req, res) => {
  try {
    const { category, timeRange, durationText, price, colorCode } = req.body;
    const shift = await Shift.findByIdAndUpdate(
      req.params.id, 
      { category, timeRange, durationText, price, colorCode }, 
      { new: true }
    );
    if (!shift) return res.status(404).json({ msg: 'Shift not found' });
    res.json(shift);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/shifts/:id
// @desc    Delete a shift
router.delete('/:id', async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ msg: 'Shift not found' });
    res.json({ msg: 'Shift removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/shifts/seed
// @desc    Seed the database with the predefined catalog
router.post('/seed', async (req, res) => {
  try {
    await Shift.deleteMany({}); // Clear existing shifts
    
    const seedData = [
      // AC
      { category: 'AC', timeRange: '06:00 AM to 10:00 PM', durationText: '(16 Hours)', price: 1500, colorCode: '#1e3a8a' }, // blue-800
      { category: 'AC', timeRange: '06:00 AM to 06:00 PM', durationText: '(12 Hours)', price: 1100, colorCode: '#16a34a' }, // green-600
      { category: 'AC', timeRange: '10:00 PM to 10:00 AM', durationText: '(12 Hours)', price: 1100, colorCode: '#06b6d4' }, // cyan-500
      { category: 'AC', timeRange: '06:00 AM to 02:00 PM', durationText: '(8 Hours)', price: 699, colorCode: '#c026d3' },  // fuchsia-600
      { category: 'AC', timeRange: '06:00 AM to 10:00 AM', durationText: '(4 Hours)', price: 399, colorCode: '#57534e' },  // stone-600
      { category: 'AC', timeRange: '10:00 AM to 02:00 PM', durationText: '(4 Hours)', price: 399, colorCode: '#dc2626' },  // red-600
      { category: 'AC', timeRange: '02:00 PM to 10:00 PM', durationText: '(8 Hours)', price: 699, colorCode: '#1e3a8a' },  // blue-800
      { category: 'AC', timeRange: '06:00 PM to 10:00 PM', durationText: '(4 Hours)', price: 399, colorCode: '#16a34a' },  // green-600
      { category: 'AC', timeRange: '02:00 PM to 08:00 PM', durationText: '(6 Hours)', price: 599, colorCode: '#06b6d4' },  // cyan-500

      // Non-AC
      { category: 'Non-AC', timeRange: '06:00 AM to 10:00 AM', durationText: '(4 Hours)', price: 350, colorCode: '#c026d3' },
      { category: 'Non-AC', timeRange: '10:00 AM to 02:00 PM', durationText: '(4 Hours)', price: 350, colorCode: '#c026d3' },
      { category: 'Non-AC', timeRange: '02:00 PM to 06:00 PM', durationText: '(4 Hours)', price: 350, colorCode: '#dc2626' },
      { category: 'Non-AC', timeRange: '06:00 PM to 10:00 PM', durationText: '(4 Hours)', price: 300, colorCode: '#1e3a8a' },
      { category: 'Non-AC', timeRange: '12:00 PM to 04:00 PM', durationText: '(4 Hours)', price: 350, colorCode: '#16a34a' },
      { category: 'Non-AC', timeRange: '01:00 PM to 05:00 PM', durationText: '(4 Hours)', price: 350, colorCode: '#06b6d4' },
      { category: 'Non-AC', timeRange: '03:00 PM to 07:00 PM', durationText: '(4 Hours)', price: 350, colorCode: '#db2777' }, // pink-600
      { category: 'Non-AC', timeRange: '04:00 PM to 10:00 PM', durationText: '(6 Hours)', price: 500, colorCode: '#9333ea' }, // purple-600
      { category: 'Non-AC', timeRange: '06:00 AM to 12:00 PM', durationText: '(6 Hours)', price: 500, colorCode: '#dc2626' },
      { category: 'Non-AC', timeRange: '10:00 AM to 04:00 PM', durationText: '(6 Hours)', price: 500, colorCode: '#1e3a8a' },
      { category: 'Non-AC', timeRange: '01:00 PM to 07:00 PM', durationText: '(6 Hours)', price: 500, colorCode: '#16a34a' },
      { category: 'Non-AC', timeRange: '04:00 PM to 10:00 PM', durationText: '(6 Hours)', price: 500, colorCode: '#06b6d4' },
      { category: 'Non-AC', timeRange: '06:00 AM to 06:00 PM', durationText: '(12 Hours)', price: 800, colorCode: '#db2777' },
      { category: 'Non-AC', timeRange: '10:00 AM to 12:00 AM', durationText: '(14 Hours)', price: 900, colorCode: '#9333ea' },
      { category: 'Non-AC', timeRange: '06:00 AM to 10:00 PM', durationText: '(16 Hours)', price: 900, colorCode: '#dc2626' },
      { category: 'Non-AC', timeRange: 'Any Flexible Time', durationText: '(16 Hours)', price: 1200, colorCode: '#1e293b' }, // slate-800
      { category: 'Non-AC', timeRange: 'Any Flexible Time', durationText: '(24 Hours)', price: 1500, colorCode: '#1e293b' }
    ];

    await Shift.insertMany(seedData);
    res.json({ msg: 'Database seeded with predefined shifts successfully!', count: seedData.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
