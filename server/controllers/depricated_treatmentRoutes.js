const express = require('express');
const router = express.Router();
const Treatment = require('../models/Treatment');
const Hive = require('../models/Hive');

router.post('/hives/:hiveId/treatments', async (req, res) => {
  try {
    const { hiveId } = req.params;
    const treatmentData = req.body;

    const newTreatment = new Treatment({
      ...treatmentData,
      hive: hiveId,
    });

    const savedTreatment = await newTreatment.save();

    // Update the hive with the new treatment reference
    await Hive.findByIdAndUpdate(hiveId, {
      $push: { treatments: savedTreatment._id },
    });

    res.status(201).json(savedTreatment);
  } catch (error) {
    console.error('Error adding treatment:', error);
    res.status(500).json({ message: 'Failed to add treatment' });
  }
});

module.exports = router;
