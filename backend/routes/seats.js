const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');

// @route GET /api/seats
// @desc Get all seats
router.get('/', async (req, res) => {
  try {
    const seats = await Seat.find().populate('assignedTo', 'fullName studentId');
    res.json(seats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/seats
// @desc Add a new seat
router.post('/', async (req, res) => {
  try {
    const { seatNumber, floorNumber, seatType } = req.body;
    let seat = await Seat.findOne({ seatNumber });
    if (seat) return res.status(400).json({ msg: 'Seat already exists' });

    seat = new Seat({ seatNumber, floorNumber, seatType });
    await seat.save();
    res.status(201).json(seat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route DELETE /api/seats/:id
// @desc Delete a seat
router.delete('/:id', async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) return res.status(404).json({ msg: 'Seat not found' });
    
    await seat.deleteOne();
    res.json({ msg: 'Seat removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
