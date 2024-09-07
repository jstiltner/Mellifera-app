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
 *     description: Retrieves a paginated list of hives for the authenticated user. Can filter by apiaryId.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: >
 *           Page number (default: 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: >
 *           Number of items per page (default: 10)
 *       - in: query
 *         name: apiaryId
 *         schema:
 *           type: string
 *         description: >
 *           ID of the apiary to filter hives (optional)
 *     responses:
 *       200:
 *         description: Hives retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hives:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hive'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalHives:
 *                   type: integer
 *       404:
 *         description: Apiary not found or unauthorized
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
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const apiaryId = req.query.apiaryId;  

    let query = {};

    if (apiaryId) {
      // Check if the apiary belongs to the user
      const apiary = await Apiary.findOne({ _id: apiaryId, parent: req.user });
      if (!apiary) {
        return res.status(404).json({ error: 'Not Found', message: 'Apiary not found or unauthorized' });
      }
      query.parent = apiaryId;
    } else {
      // If no apiaryId is provided, fetch hives from all apiaries belonging to the user
      const apiaryIds = await Apiary.find({ parent: req.user }).distinct('_id');
      query.parent = { $in: apiaryIds };
    }

    const hives = await Hive.find(query)
      .populate('parent', 'name location')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalHives = await Hive.countDocuments(query);

    res.json({
      hives,
      currentPage: page,
      totalPages: Math.ceil(totalHives / limit),
      totalHives,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/current:
 *   get:
 *     summary: Get the current hive ID
 *     description: Retrieves the ID of the most recently created hive for the authenticated user.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current hive ID retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hiveId:
 *                   type: string
 *       404:
 *         description: No hives found for the user
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
router.get('/current', auth, async (req, res) => {
  try {
    const apiaryIds = await Apiary.find({ parent: req.user }).distinct('_id');
    const hive = await Hive.findOne({ parent: { $in: apiaryIds } }).sort({ createdAt: -1 });

    if (!hive) {
      return res.status(404).json({ error: 'Not Found', message: 'No hives found for the user' });
    }

    res.json({ hiveId: hive._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{id}:
 *   get:
 *     summary: Get single hive by ID
 *     description: Retrieves detailed information about a specific hive.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hive retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hive'
 *       404:
 *         description: Hive not found
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
router.get('/:id', auth, async (req, res) => {
  try {
    const hive = await Hive.findOne({
      _id: req.params.id,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    }).populate('parent', 'name location');

    if (!hive) {
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found' });
    }

    // Convert the hive document to a plain JavaScript object
    const hiveObject = hive.toObject();
    
    // Ensure _id is a string
    hiveObject._id = hiveObject._id.toString();
    
    // Convert all nested ObjectIds to strings
    const convertIds = (obj) => {
      for (let key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          if (obj[key]._bsontype === 'ObjectID') {
            obj[key] = obj[key].toString();
          } else {
            convertIds(obj[key]);
          }
        }
      }
    };
    
    convertIds(hiveObject);

    res.json(hiveObject);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/hives:
 *   post:
 *     summary: Create new hive
 *     description: Creates a new hive associated with an apiary.
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
 *               - children
 *             properties:
 *               apiaryId:
 *                 type: string
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               children:
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
router.post('/', auth, async (req, res) => {
  try {
    const { apiaryId, location, children, ...otherHiveData } = req.body;

    // Check if the apiary exists and belongs to the user
    const apiary = await Apiary.findOne({ _id: apiaryId, parent: req.user });
    if (!apiary) {
      return res.status(404).json({ error: 'Not Found', message: 'Apiary not found or unauthorized' });
    }

    // Validate required fields
    if (!children || children.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'Name and at least one box are required' });
    }

    const newHive = new Hive({
      children,
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
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{id}:
 *   put:
 *     summary: Update hive by ID
 *     description: Updates an existing hive's information.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HiveUpdate'
 *     responses:
 *       200:
 *         description: Hive updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hive'
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
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }
    res.json(hive);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

/**
 * @swagger
 * /api/hives/{id}:
 *   delete:
 *     summary: Delete hive by ID
 *     description: Deletes an existing hive and removes it from its associated apiary.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the hive
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hive deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Hive not found or unauthorized
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedHive = await Hive.findOneAndDelete({
      _id: req.params.id,
      parent: { $in: await Apiary.find({ parent: req.user }).distinct('_id') },
    });
    if (!deletedHive) {
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    // Remove the hive from the apiary's children array
    const apiary = await Apiary.findById(deletedHive.parent);
    apiary.children.pull(deletedHive._id);
    await apiary.save();

    res.json({ message: 'Hive deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

module.exports = router;
