const express = require('express');
const router = express.Router();
const Data = require('../models/model');
const HiveOutcomePredictor = require('../mlModel');
const { generateResponse } = require('../aiModel');
const { getReportData } = require('../reports');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Apiary = require('../models/Apiary');
const Hive = require('../models/Hive');
const Box = require('../models/Box');
const mongoose = require('mongoose');

const predictor = new HiveOutcomePredictor();

// Initialize the model
(async () => {
  await predictor.createModel();
  // TODO: Load pretrained model or train with existing data
  // await predictor.loadModel('path/to/model');
})();

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get authenticated user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/getAll:
 *   get:
 *     summary: Get all data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All data retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/getAll', auth, async (req, res) => {
  try {
    const data = await Data.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/getOne/{id}:
 *   get:
 *     summary: Get data by ID
 *     tags: [Data]
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
 *         description: Data retrieved successfully
 *       404:
 *         description: Data not found
 *       500:
 *         description: Server error
 */
router.get('/getOne/:id', auth, async (req, res) => {
  try {
    const data = await Data.getOne(req.params.id);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: 'Data not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/update/{id}:
 *   patch:
 *     summary: Update data by ID
 *     tags: [Data]
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
 *         description: Data updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.patch('/update/:id', auth, async (req, res) => {
  try {
    const updatedData = await Data.updateOne(req.params.id, req.body);
    res.json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/delete/{id}:
 *   delete:
 *     summary: Delete data by ID
 *     tags: [Data]
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
 *         description: Data deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    await Data.deleteOne(req.params.id);
    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/predict:
 *   post:
 *     summary: Predict hive outcome
 *     tags: [Prediction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Prediction successful
 *       500:
 *         description: Server error
 */
router.post('/predict', auth, async (req, res) => {
  try {
    const inputData = req.body;
    const prediction = await predictor.predict(inputData);
    res.json({ prediction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/voice-command:
 *   post:
 *     summary: AI-powered voice recognition
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 *               context:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voice command processed successfully
 *       500:
 *         description: Server error
 */
router.post('/voice-command', auth, async (req, res) => {
  try {
    const { command, context } = req.body;
    const prompt = `As an AI assistant for beekeeping, respond to the following voice command and provide relevant information or ask for missing details if necessary. Consider the context provided.

Command: ${command}
Context: ${context}

Response:`;

    const response = await generateResponse(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get report data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report data retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/reports', auth, async (req, res) => {
  try {
    const reportData = await getReportData();
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries:
 *   get:
 *     summary: Get all apiaries for the authenticated user
 *     tags: [Apiaries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Apiaries retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/apiaries', auth, async (req, res) => {
  try {
    const apiaries = await Apiary.find({ parent: req.user }).populate({
      path: 'children',
      model: 'Hive',
      select: 'name location hiveType lastInspection',
    });

    res.status(200).json(apiaries);
  } catch (error) {
    console.error(`Error fetching apiaries for user ${req.user}:`, error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching apiaries', error: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries/{id}:
 *   get:
 *     summary: Get single apiary by ID
 *     tags: [Apiaries]
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
 *         description: Apiary retrieved successfully
 *       404:
 *         description: Apiary not found
 *       500:
 *         description: Server error
 */
router.get('/apiaries/:id', auth, async (req, res) => {
  try {
    const apiary = await Apiary.findOne({ _id: req.params.id, parent: req.user }).populate({
      path: 'children',
      model: 'Hive',
      select: 'name location hiveType lastInspection',
    });
    if (!apiary) {
      return res.status(404).json({ message: 'Apiary not found' });
    }
    res.json(apiary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries:
 *   post:
 *     summary: Create new apiary
 *     tags: [Apiaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Apiary created successfully
 *       400:
 *         description: Bad request
 */
router.post('/apiaries', auth, async (req, res) => {
  try {
    const newApiary = new Apiary({ ...req.body, parent: req.user });
    const savedApiary = await newApiary.save();
    const user = await User.findById(req.user);
    user.children.push(savedApiary._id);
    await user.save();
    res.status(201).json(savedApiary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries/{id}:
 *   put:
 *     summary: Update apiary by ID
 *     tags: [Apiaries]
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
 *         description: Apiary updated successfully
 *       404:
 *         description: Apiary not found
 *       400:
 *         description: Bad request
 */
router.put('/apiaries/:id', auth, async (req, res) => {
  try {
    const apiary = await Apiary.findOneAndUpdate(
      { _id: req.params.id, parent: req.user },
      req.body,
      { new: true }
    );
    if (!apiary) {
      return res.status(404).json({ message: 'Apiary not found' });
    }
    res.json(apiary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries/{id}:
 *   delete:
 *     summary: Delete apiary by ID
 *     tags: [Apiaries]
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
 *         description: Apiary deleted successfully
 *       404:
 *         description: Apiary not found
 *       500:
 *         description: Server error
 */
router.delete('/apiaries/:id', auth, async (req, res) => {
  try {
    const deletedApiary = await Apiary.findOneAndDelete({ _id: req.params.id, parent: req.user });
    if (!deletedApiary) {
      return res.status(404).json({ message: 'Apiary not found' });
    }
    const user = await User.findById(req.user);
    user.children.pull(deletedApiary._id);
    await user.save();
    res.json({ message: 'Apiary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
router.get('/api/hives', auth, async (req, res) => {
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
router.get('/hives/:id', auth, async (req, res) => {
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
 * /api/boxes/{id}:
 *   post:
 *     summary: Handle adding box to hive
 *     tags: [Boxes, Hives]
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
 *         description: Box configured successfully on Hive
 *       404:
 *         description: Hive not found
 *       500:
 *         description: Server error
 */
router.post('/boxes/:id', auth, async (req, res) => {
  try {
    const hiveId = req.params.id;
    const boxDataArray = req.body;

    // Check if the hive exists and belongs to the user
    const hive = await Hive.findOne({
      _id: hiveId,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });

    if (!hive) {
      return res.status(404).json({ message: 'Hive not found or unauthorized' });
    }

    const savedBoxes = [];
    for (const boxData of boxDataArray) {
      const newBox = new Box({
        ...boxData,
        parent: hiveId,
      });

      const savedBox = await newBox.save();
      savedBoxes.push(savedBox);

      // Update the hive's children array
      hive.children.push(savedBox);
    }
    await hive.save();
    res.status(201).json(savedBoxes);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
 *               hiveType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hive created successfully
 *       404:
 *         description: Apiary not found or unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/api/hives', auth, async (req, res) => {
  try {
    const { apiaryId, ...hiveData } = req.body;

    // Check if the apiary exists and belongs to the user
    const apiary = await Apiary.findOne({ _id: apiaryId, parent: req.user });
    if (!apiary) {
      return res.status(404).json({ message: 'Apiary not found or unauthorized' });
    }

    const newHive = new Hive({
      ...hiveData,
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
router.put('/api/hives/:id', auth, async (req, res) => {
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
router.delete('/api/hives/:id', auth, async (req, res) => {
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
