const express = require('express');
const router = express.Router();
const Box = require('../models/Box');
const auth = require('../middleware/auth');

// @route   POST api/boxes
// @desc    Create a new box
// @access  Private
router.post('/boxes', auth, async (req, res) => {
  try {
    const { name, type, frames, conditions, boxNumber } = req.body;

    const newBox = new Box({
      name,
      type: 'brood',
      frames: 10,
      conditions: '',
      user: req.user.id,
      boxNumber,
      notes:  ''
    });

    const box = await newBox.save();
    res.json(box);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;