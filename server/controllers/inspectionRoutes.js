const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');
const Inspection = require('../models/Inspection');

/**
 * @swagger
 * /api/hives/{hiveId}/inspections:
 *   post:
 *     summary: Create new inspection for a hive
 *     description: Creates a new inspection record for a specific hive and updates the hive's status based on the inspection data.
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hiveId
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InspectionInput'
 *     responses:
 *       201:
 *         description: Inspection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inspection'
 *       404:
 *         description: Hive not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:hiveId', auth, async (req, res) => {
  try {
    const { hiveId } = req.params;
    const inspectionData = req.body;

    if (!hiveId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Hive ID is required' });
    }

    const hive = await Hive.findOne({
      _id: hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
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
    res.status(400).json({ error: 'Bad Request', message: 'Error creating inspection', details: error.message });
  }
});

/**
 * @swagger
 * /api/inspections/{hiveId}:
 *   get:
 *     summary: Get inspections for a specific hive
 *     description: Retrieves a list of all inspections for a specific hive, sorted by date in descending order.
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hiveId
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of inspections for the hive
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inspection'
 *       404:
 *         description: Hive not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:hiveId', auth, async (req, res) => {
  try {
    const { hiveId } = req.params;

    if (!hiveId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Hive ID is required' });
    }

    const hive = await Hive.findOne({
      _id: hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    const inspections = await Inspection.find({ hive: hiveId }).sort({ date: -1 });

    res.status(200).json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(400).json({ error: 'Bad Request', message: 'Error fetching inspections', details: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{hiveId}/inspections/{id}:
 *   get:
 *     summary: Get a specific inspection
 *     description: Retrieves a specific inspection record for a hive.
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hiveId
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the inspection
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inspection details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inspection'
 *       404:
 *         description: Inspection or Hive not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/inspectionReport/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await Inspection.findOne({ _id: id });

    if (!inspection) {
      return res.status(404).json({ error: 'Not Found', message: 'Inspection not found or unauthorized' });
    }

    res.status(200).json(inspection);
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(400).json({ error: 'Bad Request', message: 'Error fetching inspection', details: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{hiveId}/inspections/{id}:
 *   put:
 *     summary: Update an inspection
 *     description: Updates an existing inspection record and updates the associated hive's status based on the new inspection data.
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hiveId
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the inspection
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InspectionUpdate'
 *     responses:
 *       200:
 *         description: Inspection updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inspection'
 *       404:
 *         description: Inspection or Hive not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/hives/:hiveId/inspections/:id', auth, async (req, res) => {
  try {
    const { hiveId, id } = req.params;
    const inspectionData = req.body;

    const hive = await Hive.findOne({
      _id: hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    const inspection = await Inspection.findOne({ _id: id, hive: hiveId });

    if (!inspection) {
      return res.status(404).json({ error: 'Not Found', message: 'Inspection not found or unauthorized' });
    }

    // Update the inspection
    Object.assign(inspection, inspectionData);
    const updatedInspection = await inspection.save();

    // Update hive status based on updated inspection data
    hive.lastInspectionDate = updatedInspection.date;
    hive.overallHealth = updatedInspection.overallHealth;

    if (updatedInspection.queenSeen) {
      hive.queenStatus = 'Present';
    } else if (updatedInspection.queenCells) {
      hive.queenStatus = 'Queen Cells Present';
    }

    if (updatedInspection.diseasesSeen) {
      hive.diseaseStatus = updatedInspection.diseasesSeen;
    }

    if (updatedInspection.pestsSeen) {
      hive.pestStatus = updatedInspection.pestsSeen;
    }

    await hive.save();

    res.json(updatedInspection);
  } catch (error) {
    console.error('Error updating inspection:', error);
    res.status(400).json({ error: 'Bad Request', message: 'Error updating inspection', details: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{hiveId}/inspections/{id}:
 *   delete:
 *     summary: Delete an inspection
 *     description: Deletes an existing inspection record and updates the associated hive's status if necessary.
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hiveId
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the inspection
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inspection deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Inspection or Hive not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/hives/:hiveId/inspections/:id', auth, async (req, res) => {
  try {
    const { hiveId, id } = req.params;

    const hive = await Hive.findOne({
      _id: hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    const inspection = await Inspection.findOne({ _id: id, hive: hiveId });

    if (!inspection) {
      return res.status(404).json({ error: 'Not Found', message: 'Inspection not found or unauthorized' });
    }

    // Remove the inspection from the hive's inspections array
    hive.inspections.pull(inspection._id);

    // Delete the inspection
    await inspection.remove();

    // Update the hive's last inspection date if necessary
    const latestInspection = await Inspection.findOne({ hive: hiveId }).sort({ date: -1 });
    if (latestInspection) {
      hive.lastInspectionDate = latestInspection.date;
      hive.overallHealth = latestInspection.overallHealth;
    } else {
      hive.lastInspectionDate = null;
      hive.overallHealth = null;
    }

    await hive.save();

    res.json({ message: 'Inspection removed successfully' });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    res.status(400).json({ error: 'Bad Request', message: 'Error deleting inspection', details: error.message });
  }
});

module.exports = router;