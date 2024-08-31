const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');

/**
 * @swagger
 * /api/hives:
 *   get:
 *     summary: Get all hives with pagination
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Hives retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const apiaryIds = await Apiary.find({ parent: req.user }).distinct('_id');

    const hives = await Hive.find({ parent: { $in: apiaryIds } })
      .populate('parent', 'name location')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalHives = await Hive.countDocuments({ parent: { $in: apiaryIds } });

    res.json({
      hives,
      currentPage: page,
      totalPages: Math.ceil(totalHives / limit),
      totalHives,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/current:
 *   get:
 *     summary: Get the current hive ID
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current hive ID retrieved successfully
 *       404:
 *         description: No hives found for the user
 *       500:
 *         description: Server error
 */
router.get('/current', auth, async (req, res) => {
  try {
    const apiaryIds = await Apiary.find({ parent: req.user }).distinct('_id');
    const hive = await Hive.findOne({ parent: { $in: apiaryIds } }).sort({ createdAt: -1 });

    if (!hive) {
      return res.status(404).json({ message: 'No hives found for the user' });
    }

    res.json({ hiveId: hive._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{id}:
 *   get:
 *     summary: Get single hive by ID
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hive retrieved successfully
 *       404:
 *         description: Hive not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const hive = await Hive.findOne({
      _id: req.params.id,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    }).populate('parent', 'name location');
    if (!hive) {
      return res.status(404).json({ message: 'Hive not found' });
    }
    res.json(hive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/hives:
 *   post:
 *     summary: Create new hive
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                     type:
 *                       type: string
 *                     frames:
 *                       type: number
 *     responses:
 *       201:
 *         description: Hive created successfully
 *       404:
 *         description: Apiary not found or unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', auth, async (req, res) => {
  try {
    const { apiaryId, location, boxes, ...otherHiveData } = req.body;

    // Check if the apiary exists and belongs to the user
    const apiary = await Apiary.findOne({ _id: apiaryId, parent: req.user });
    if (!apiary) {
      return res.status(404).json({ message: 'Apiary not found or unauthorized' });
    }

    // Validate required fields
    if (!boxes || boxes.length === 0) {
      return res.status(400).json({ message: 'Name and at least one box are required' });
    }

    const newHive = new Hive({
      boxes,
      location,
      ...otherHiveData,
      parent: apiaryId,
    });

    const savedHive = await newHive.save();

    // Update the apiary's children array
    apiary.children.push(savedHive._id);
    await apiary.save();

    res.status(201).json(savedHive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{id}:
 *   put:
 *     summary: Update hive by ID
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Hive updated successfully
 *       404:
 *         description: Hive not found or unauthorized
 *       400:
 *         description: Bad request
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const hive = await Hive.findOneAndUpdate(
      {
        _id: req.params.id,
        parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
      },
      req.body,
      { new: true }
    ).populate('parent', 'name location');
    if (!hive) {
      return res.status(404).json({ message: 'Hive not found or unauthorized' });
    }
    res.json(hive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{id}:
 *   delete:
 *     summary: Delete hive by ID
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hive deleted successfully
 *       404:
 *         description: Hive not found or unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedHive = await Hive.findOneAndDelete({
      _id: req.params.id,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });
    if (!deletedHive) {
      return res.status(404).json({ message: 'Hive not found or unauthorized' });
    }

    // Remove the hive from the apiary's children array
    const apiary = await Apiary.findById(deletedHive.parent);
    apiary.children.pull(deletedHive._id);
    await apiary.save();

    res.json({ message: 'Hive deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
