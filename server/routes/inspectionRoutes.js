const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');
const Inspection = require('../models/Inspection');

/**
 * @swagger
 * /api/inspections/{hiveId}:
 *   post:
 *     summary: Create new inspection for a hive
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hiveId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               overallHealth:
 *                 type: string
 *               queenSeen:
 *                 type: boolean
 *               queenCells:
 *                 type: boolean
 *               eggsSeen:
 *                 type: boolean
 *               larvaeSeen:
 *                 type: boolean
 *               capBrood:
 *                 type: boolean
 *               diseasesSeen:
 *                 type: string
 *               pestsSeen:
 *                 type: string
 *               hiveTemperament:
 *                 type: string
 *               weatherConditions:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inspection created successfully
 *       404:
 *         description: Hive not found or unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/:hiveId/inspections', auth, async (req, res) => {
  try {
    const { hiveId } = req.params;
    const inspectionData = req.body;

    if (!hiveId) {
      return res.status(400).json({ message: 'Hive ID is required' });
    }

    const hive = await Hive.findOne({
      _id: hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ message: 'Hive not found or unauthorized' });
    }

    const newInspection = new Inspection({
      ...inspectionData,
      hive: hiveId,
    });

    const savedInspection = await newInspection.save();

    // Update the hive's inspections array and relevant fields
    hive.inspections.push(savedInspection._id);
    hive.lastInspectionDate = savedInspection.date;
    hive.overallHealth = savedInspection.overallHealth;

    // Update hive status based on inspection data
    if (savedInspection.queenSeen) {
      hive.queenStatus = 'Present';
    } else if (savedInspection.queenCells) {
      hive.queenStatus = 'Queen Cells Present';
    }

    if (savedInspection.diseasesSeen) {
      hive.diseaseStatus = savedInspection.diseasesSeen;
    }

    if (savedInspection.pestsSeen) {
      hive.pestStatus = savedInspection.pestsSeen;
    }

    await hive.save();

    res.status(201).json(savedInspection);
  } catch (error) {
    console.error('Error in inspection creation:', error);
    res.status(400).json({ message: 'Error creating inspection', error: error.message });
  }
});

module.exports = router;