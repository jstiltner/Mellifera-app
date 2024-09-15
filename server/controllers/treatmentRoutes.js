const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');
const Treatment = require('../models/Treatment');

/**
 * @swagger
 * /api/treatments:
 *   post:
 *     summary: Create new Treatment(s) for hive(s) or apiary
 *     description: Creates new treatment record(s) for specific hive(s) or an entire apiary and updates the hive(s) status based on the treatment data.
 *     tags: [treatments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/singleTreatmentInput'
 *               - $ref: '#/components/schemas/batchTreatmentInput'
 *     responses:
 *       201:
 *         description: Treatment(s) created successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/treatment'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/treatment'
 *       404:
 *         description: Hive(s) or Apiary not found or unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', auth, async (req, res) => {
  try {
    const { hiveId, hiveIds, apiaryId, ...treatmentData } = req.body;

    if (!hiveId && !hiveIds && !apiaryId) {
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Either hiveId, hiveIds, or apiaryId is required' });
    }

    let hivesToTreat = [];

    if (apiaryId) {
      const apiary = await Apiary.findOne({ _id: apiaryId, parent: req.user });
      if (!apiary) {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Apiary not found or unauthorized' });
      }
      hivesToTreat = await Hive.find({ parent: apiaryId });
    } else if (hiveIds) {
      hivesToTreat = await Hive.find({
        _id: { $in: hiveIds },
        parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
      });
    } else {
      const hive = await Hive.findOne({
        _id: hiveId,
        parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
      });
      if (hive) hivesToTreat.push(hive);
    }

    if (hivesToTreat.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'No authorized hives found' });
    }

    const createdTreatments = [];

    for (const hive of hivesToTreat) {
      const newTreatment = new Treatment({
        ...treatmentData,
        hive: hive._id,
        apiary: hive.parent,
      });

      const savedTreatment = await newTreatment.save();
      createdTreatments.push(savedTreatment);

      // Update the hive's treatments array and relevant fields
      hive.treatments.push(savedTreatment._id);
      hive.lastTreatmentDate = savedTreatment.date;

      await hive.save();
    }

    res.status(201).json(createdTreatments.length === 1 ? createdTreatments[0] : createdTreatments);
  } catch (error) {
    console.error('Error in treatment creation:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: 'Error creating treatment(s)',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /api/treatments/{hiveId}:
 *   get:
 *     summary: Get treatments for a specific hive
 *     description: Retrieves a list of all treatments for a specific hive, sorted by date in descending order.
 *     tags: [treatments]
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
 *         description: List of treatments for the hive
 *       404:
 *         description: Hive not found or unauthorized
 *       400:
 *         description: Bad request
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
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    const treatments = await Treatment.find({ hive: hiveId }).sort({ date: -1 });

    res.status(200).json(treatments);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res
      .status(400)
      .json({ error: 'Bad Request', message: 'Error fetching treatments', details: error.message });
  }
});

/**
 * @swagger
 * /api/treatments/{id}:
 *   put:
 *     summary: Update a treatment
 *     description: Updates an existing treatment record and updates the associated hive's status based on the new treatment data.
 *     tags: [treatments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the treatment
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/treatmentUpdate'
 *     responses:
 *       200:
 *         description: Treatment updated successfully
 *       404:
 *         description: Treatment or Hive not found or unauthorized
 *       400:
 *         description: Bad request
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const treatmentData = req.body;

    const treatment = await Treatment.findOne({ _id: id });

    if (!treatment) {
      return res.status(404).json({ error: 'Not Found', message: 'Treatment not found' });
    }

    const hive = await Hive.findOne({
      _id: treatment.hive,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    // Update the treatment
    Object.assign(treatment, treatmentData);
    const updatedTreatment = await treatment.save();

    // Update hive's last treatment date
    hive.lastTreatmentDate = updatedTreatment.date;
    await hive.save();

    res.json(updatedTreatment);
  } catch (error) {
    console.error('Error updating Treatment:', error);
    res
      .status(400)
      .json({ error: 'Bad Request', message: 'Error updating Treatment', details: error.message });
  }
});

/**
 * @swagger
 * /api/treatments/{id}:
 *   delete:
 *     summary: Delete a treatment
 *     description: Deletes an existing treatment record and updates the associated hive's status if necessary.
 *     tags: [Treatments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the treatment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Treatment deleted successfully
 *       404:
 *         description: Treatment or Hive not found or unauthorized
 *       400:
 *         description: Bad request
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const treatment = await Treatment.findOne({ _id: id });

    if (!treatment) {
      return res.status(404).json({ error: 'Not Found', message: 'Treatment not found' });
    }

    const hive = await Hive.findOne({
      _id: treatment.hive,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    // Remove the treatment from the hive's treatments array
    hive.treatments.pull(treatment._id);

    // Delete the treatment
    await treatment.remove();

    // Update the hive's last treatment date if necessary
    const latestTreatment = await Treatment.findOne({ hive: hive._id }).sort({ date: -1 });
    hive.lastTreatmentDate = latestTreatment ? latestTreatment.date : null;

    await hive.save();

    res.json({ message: 'Treatment removed successfully' });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    res
      .status(400)
      .json({ error: 'Bad Request', message: 'Error deleting treatment', details: error.message });
  }
});

module.exports = router;
