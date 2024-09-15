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
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, frames, conditions, boxNumber, notes } = req.body;

    // Check if the box exists and belongs to a hive owned by the user
    const box = await Box.findOne({
      _id: id,
      parent: {
        $in: await Hive.find({
          parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
        }).distinct('_id'),
      },
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Get the Apiary IDs where the parent is the current user
    const apiaryIds = await Apiary.find({ parent: req.user }).distinct('_id');

    // Step 2: Get the Hive IDs where the parent is one of the apiaries found above
    const hiveIds = await Hive.find({ parent: { $in: apiaryIds } }).distinct('_id');

    // Step 3: Find and delete the Box where the _id matches the box ID and the parent is one of the hives found above
    const box = await Box.findOneAndDelete({
      _id: id,
      parent: { $in: hiveIds },
    });

    if (!box) {
      return res.status(404).json({ message: 'Box not found or unauthorized' });
    }

    // Remove the box from the hive's children array
    const updateResult = await Hive.updateOne(
      { _id: box.parent },
      { $pull: { children: box._id } }
    );

    if (updateResult.nModified === 0) {
      console.warn(`Box ${id} was not found in the parent hive's children array.`);
    }

    res.json({ message: 'Box removed successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid box ID format' });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
