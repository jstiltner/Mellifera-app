const express = require('express');
const router = express.Router();
const Box = require('../models/Box');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');
const auth = require('../middleware/auth');

// @route   POST api/boxes
// @desc    Create a new box
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, frames, conditions, boxNumber, hiveId } = req.body;

    // Check if the hive exists and belongs to the user
    const hive = await Hive.findOne({
      _id: hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ message: 'Hive not found or unauthorized' });
    }

    const newBox = new Box({
      name,
      type,
      frames,
      conditions,
      boxNumber,
      notes: '',
      parent: hiveId,
    });

    const box = await newBox.save();

    // Update the hive's children array
    hive.children.push(box._id);
    await hive.save();

    res.status(201).json(box);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/boxes/:id
// @desc    Update a box
// @access  Private
router.put('/boxes/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, frames, conditions, boxNumber, notes } = req.body;

    // Check if the box exists and belongs to a hive owned by the user
    const box = await Box.findOne({
      _id: id,
      parent: { $in: await Hive.find({ parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') } }).distinct('_id') },
    });

    if (!box) {
      return res.status(404).json({ message: 'Box not found or unauthorized' });
    }

    // Update the box
    box.name = name || box.name;
    box.type = type || box.type;
    box.frames = frames || box.frames;
    box.conditions = conditions || box.conditions;
    box.boxNumber = boxNumber || box.boxNumber;
    box.notes = notes || box.notes;

    const updatedBox = await box.save();

    res.json(updatedBox);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/boxes/:id
// @desc    Delete a box
// @access  Private
router.delete('/boxes/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the box exists and belongs to a hive owned by the user
    const box = await Box.findOne({
      _id: id,
      parent: { $in: await Hive.find({ parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') } }).distinct('_id') },
    });

    if (!box) {
      return res.status(404).json({ message: 'Box not found or unauthorized' });
    }

    // Remove the box from the hive's children array
    await Hive.findByIdAndUpdate(box.parent, { $pull: { children: box._id } });

    // Delete the box
    await box.remove();

    res.json({ message: 'Box removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;