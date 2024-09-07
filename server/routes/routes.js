const express = require('express');
const router = express.Router();
const Data = require('../models/model');
const HiveOutcomePredictor = require('../mlModel');
const { generateResponse } = require('../aiModel');
const { getReportData } = require('../reports');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Apiary = require('../models/Apiary');

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
 *     description: Retrieves the information of the currently authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/getAll:
 *   get:
 *     summary: Get all data
 *     description: Retrieves all data entries. This endpoint is protected and requires authentication.
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Data'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/getAll', auth, async (req, res) => {
  try {
    const data = await Data.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/getOne/{id}:
 *   get:
 *     summary: Get data by ID
 *     description: Retrieves a specific data entry by its ID. This endpoint is protected and requires authentication.
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the data entry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Data'
 *       404:
 *         description: Data not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/getOne/:id', auth, async (req, res) => {
  try {
    const data = await Data.getOne(req.params.id);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Not Found', message: 'Data not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/update/{id}:
 *   patch:
 *     summary: Update data by ID
 *     description: Updates a specific data entry by its ID. This endpoint is protected and requires authentication.
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the data entry
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DataUpdate'
 *     responses:
 *       200:
 *         description: Data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Data'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/update/:id', auth, async (req, res) => {
  try {
    const updatedData = await Data.updateOne(req.params.id, req.body);
    res.json(updatedData);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

/**
 * @swagger
 * /api/delete/{id}:
 *   delete:
 *     summary: Delete data by ID
 *     description: Deletes a specific data entry by its ID. This endpoint is protected and requires authentication.
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the data entry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    await Data.deleteOne(req.params.id);
    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/predict:
 *   post:
 *     summary: Predict hive outcome
 *     description: Uses a machine learning model to predict the outcome of a hive based on input data. This endpoint is protected and requires authentication.
 *     tags: [Prediction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PredictionInput'
 *     responses:
 *       200:
 *         description: Prediction successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PredictionResult'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/predict', auth, async (req, res) => {
  try {
    const inputData = req.body;
    const prediction = await predictor.predict(inputData);
    res.json({ prediction });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/voice-command:
 *   post:
 *     summary: AI-powered voice recognition
 *     description: Processes a voice command using AI and returns a relevant response. This endpoint is protected and requires authentication.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get report data
 *     description: Retrieves report data for the authenticated user. This endpoint is protected and requires authentication.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportData'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reports', auth, async (req, res) => {
  try {
    const reportData = await getReportData();
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries:
 *   get:
 *     summary: Get all apiaries for the authenticated user
 *     description: Retrieves all apiaries associated with the authenticated user, including basic information about their hives.
 *     tags: [Apiaries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Apiaries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Apiary'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
    res.status(500).json({ error: 'Internal Server Error', message: 'An error occurred while fetching apiaries' });
  }
});

/**
 * @swagger
 * /api/apiaries/{id}:
 *   get:
 *     summary: Get single apiary by ID
 *     description: Retrieves detailed information about a specific apiary, including its hives.
 *     tags: [Apiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the apiary
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Apiary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apiary'
 *       404:
 *         description: Apiary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/apiaries/:id', auth, async (req, res) => {
  try {
    const apiary = await Apiary.findOne({ _id: req.params.id, parent: req.user }).populate({
      path: 'children',
      model: 'Hive',
      select: 'name location hiveType lastInspection',
    });
    if (!apiary) {
      return res.status(404).json({ error: 'Not Found', message: 'Apiary not found' });
    }
    res.json(apiary);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries:
 *   post:
 *     summary: Create new apiary
 *     description: Creates a new apiary for the authenticated user.
 *     tags: [Apiaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiaryInput'
 *     responses:
 *       201:
 *         description: Apiary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apiary'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries/{id}:
 *   put:
 *     summary: Update apiary by ID
 *     description: Updates an existing apiary's information.
 *     tags: [Apiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the apiary
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiaryUpdate'
 *     responses:
 *       200:
 *         description: Apiary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apiary'
 *       404:
 *         description: Apiary not found
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
router.put('/apiaries/:id', auth, async (req, res) => {
  try {
    const apiary = await Apiary.findOneAndUpdate(
      { _id: req.params.id, parent: req.user },
      req.body,
      { new: true }
    );
    if (!apiary) {
      return res.status(404).json({ error: 'Not Found', message: 'Apiary not found' });
    }
    res.json(apiary);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

/**
 * @swagger
 * /api/apiaries/{id}:
 *   delete:
 *     summary: Delete apiary by ID
 *     description: Deletes an existing apiary and removes it from the user's apiaries list.
 *     tags: [Apiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the apiary
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Apiary deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Apiary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/apiaries/:id', auth, async (req, res) => {
  try {
    const deletedApiary = await Apiary.findOneAndDelete({ _id: req.params.id, parent: req.user });
    if (!deletedApiary) {
      return res.status(404).json({ error: 'Not Found', message: 'Apiary not found' });
    }
    const user = await User.findById(req.user);
    user.children.pull(deletedApiary._id);
    await user.save();
    res.json({ message: 'Apiary deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

module.exports = router;
