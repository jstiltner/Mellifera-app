const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');
const Box = require('../models/Box');

/**
 * @swagger
 * /api/box-addition/{hiveId}:
 *   post:
 *     summary: Add a new box to an existing hive
 *     description: Adds a new box to a specific hive and updates the hive's children array.
 *     tags: [Boxes]
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
 *             type: object
 *             required:
 *               - boxNumber
 *               - type
 *               - frames
 *             properties:
 *               boxNumber:
 *                 type: number
 *               type:
 *                 type: string
 *               frames:
 *                 type: number
 *     responses:
 *       201:
 *         description: Box added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Box'
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
    const hive = await Hive.findOne({
      _id: req.params.hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    const newBox = new Box({
      ...req.body,
      parent: hive._id,
    });

    const savedBox = await newBox.save();

    // Update the hive's children array
    hive.children.push(savedBox._id);
    await hive.save();

    res.status(201).json(savedBox);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

module.exports = router;