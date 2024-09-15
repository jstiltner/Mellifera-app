const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');
const Box = require('../models/Box');

/**
 * @swagger
 * /api/hive-creation:
 *   post:
 *     summary: Create new hive with boxes
 *     description: Creates a new hive associated with an apiary, including its boxes.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiaryId
 *               - name
 *               - boxes
 *             properties:
 *               apiaryId:
 *                 type: string
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               boxes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     boxNumber:
 *                       type: number
 *                     type:
 *                       type: string
 *                     frames:
 *                       type: number
 *     responses:
 *       201:
 *         description: Hive created successfully with boxes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hive'
 *       404:
 *         description: Apiary not found or unauthorized
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
router.post('/hive-creation', auth, async (req, res) => {
  try {
    const { apiaryId, location, boxes, ...otherHiveData } = req.body;

    // Check if the apiary exists and belongs to the user
    const apiary = await Apiary.findOne({ _id: apiaryId, parent: req.user });
    if (!apiary) {
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'Apiary not found or unauthorized' });
    }

    // Validate required fields
    if (!boxes || boxes.length === 0) {
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Name and at least one box are required' });
    }

    // Create the hive
    const newHive = new Hive({
      location,
      ...otherHiveData,
      parent: apiaryId,
    });

    // Create boxes and associate them with the hive
    const boxPromises = boxes.map(async (boxData) => {
      const newBox = new Box({
        ...boxData,
        parent: newHive._id,
      });
      await newBox.save();
      return newBox._id;
    });

    newHive.children = await Promise.all(boxPromises);

    const savedHive = await newHive.save();

    // Update the apiary's children array
    apiary.children.push(savedHive._id);
    await apiary.save();

    // Populate the saved hive with box details
    const populatedHive = await Hive.findById(savedHive._id).populate('children');

    res.status(201).json(populatedHive);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

module.exports = router;
