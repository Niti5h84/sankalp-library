const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// @route POST /api/notifications/subscribe
// @desc Subscribe an admin's device to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, adminEmail } = req.body;
    
    // Find admin and add subscription if it doesn't already exist
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });

    // Check if subscription already exists (by endpoint)
    const exists = admin.pushSubscriptions.find(sub => sub.endpoint === subscription.endpoint);
    
    if (!exists) {
      admin.pushSubscriptions.push(subscription);
      await admin.save();
    }

    res.status(201).json({ msg: 'Subscribed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/notifications/unsubscribe
// @desc Unsubscribe a device
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint, adminEmail } = req.body;
    const admin = await Admin.findOne({ email: adminEmail });
    
    if (admin) {
      admin.pushSubscriptions = admin.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
      await admin.save();
    }
    
    res.status(200).json({ msg: 'Unsubscribed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
