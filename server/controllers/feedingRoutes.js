const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Feeding = require('../models/Feeding');
const Hive = require('../models/Hive');
const auth = require('../middleware/auth');

// Create a new feeding
router.post('/', auth, async (req, res) => {
  try {
    const { hiveId, date, type, amount, units, notes } = req.body;

    const feeding = new Feeding({
      date,
      type,
      amount,
      units,
      notes,
      hive: hiveId,
    });

    await feeding.save();

    // Update the hive's feedings array and lastFeeding date
    await Hive.findByIdAndUpdate(hiveId, {
      $push: { feedings: feeding._id },
      $set: { lastFeeding: date },
    });

    res.status(201).json(feeding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all feedings for a specific hive
router.get('/hive/:hiveId', auth, async (req, res) => {
  try {
    const hiveId = req.params.hiveId;
    const feedings = await Feeding.find({ hive: hiveId }).sort({ date: -1 });
    res.json(feedings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a feeding
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, amount, units, notes } = req.body;

    const feeding = await Feeding.findByIdAndUpdate(
      id,
      {
        date,
        type,
        amount,
        units,
        notes,
      },
      { new: true }
    );

    if (!feeding) {
      return res.status(404).json({ message: 'Feeding not found' });
    }

    // Update the hive's lastFeeding date if this is the most recent feeding
    await Hive.findOneAndUpdate(
      { _id: feeding.hive, lastFeeding: { $lte: feeding.date } },
      { $set: { lastFeeding: feeding.date } }
    );

    res.json(feeding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a feeding
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const feeding = await Feeding.findByIdAndDelete(id);

    if (!feeding) {
      return res.status(404).json({ message: 'Feeding not found' });
    }

    // Remove the feeding from the hive's feedings array
    await Hive.findByIdAndUpdate(feeding.hive, {
      $pull: { feedings: feeding._id },
    });

    // Update the hive's lastFeeding date
    const latestFeeding = await Feeding.findOne({ hive: feeding.hive }).sort({ date: -1 });
    await Hive.findByIdAndUpdate(feeding.hive, {
      $set: { lastFeeding: latestFeeding ? latestFeeding.date : null },
    });

    res.json({ message: 'Feeding deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
