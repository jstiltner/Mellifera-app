const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');

// ... (keep the existing routes)

/**
 * @swagger
 * /api/hives/{id}:
 *   get:
 *     summary: Get a single hive by ID
 *     description: Retrieves a specific hive by its ID for the authenticated user.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the hive to retrieve
 *     responses:
 *       200:
 *         description: Hive retrieved successfully
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', auth, async (req, res) => {
  console.log(`Fetching hive with ID: ${req.params.id}`);
  try {
    const hiveId = req.params.id;
    const hive = await Hive.findById(hiveId)
      .populate('parent', 'name location')
      .populate('children')
      .populate({
        path: 'inspections',
        options: { sort: { date: -1 }, limit: 10 } // Populate the latest 10 inspections
      });

    console.log('Hive found:', hive ? 'Yes' : 'No');

    if (!hive) {
      console.log('Hive not found');
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found' });
    }

    // Check if the hive belongs to an apiary owned by the user
    const apiary = await Apiary.findOne({ _id: hive.parent, parent: req.user });
    console.log('Apiary found:', apiary ? 'Yes' : 'No');

    if (!apiary) {
      console.log('Apiary not found or unauthorized');
      return res.status(404).json({ error: 'Not Found', message: 'Hive not found or unauthorized' });
    }

    console.log('Sending hive data with inspections');
    res.json(hive);
  } catch (error) {
    console.error('Error fetching hive:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * @swagger
 * /api/hives:
 *   get:
 *     summary: Get all hives with optional pagination
 *     description: Retrieves a list of hives for the authenticated user. Can filter by apiaryId. Returns all hives if no pagination parameters are provided.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (optional)
 *       - in: query
 *         name: apiaryId
 *         schema:
 *           type: string
 *         description: ID of the apiary to filter hives (optional)
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const apiaryId = req.query.apiaryId;
    let query = {};

    if (apiaryId) {
      // Check if the apiary belongs to the user
      const apiary = await Apiary.findOne({ _id: apiaryId, parent: req.user });
      if (!apiary) {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Apiary not found or unauthorized' });
      }
      query.parent = apiaryId;
    } else {
      // If no apiaryId is provided, fetch hives from all apiaries belonging to the user
      const apiaryIds = await Apiary.find({ parent: req.user }).distinct('_id');
      query.parent = { $in: apiaryIds };
    }

    let hivesQuery = Hive.find(query)
      .populate('parent', 'name location')
      .populate('children') // Populate the children (boxes)
      .sort({ createdAt: -1 });

    if (!isNaN(page) && !isNaN(limit)) {
      const skip = (page - 1) * limit;
      hivesQuery = hivesQuery.skip(skip).limit(limit);
    }

    const hives = await hivesQuery;
    const totalHives = await Hive.countDocuments(query);

    const response = {
      hives,
      totalHives,
    };

    if (!isNaN(page) && !isNaN(limit)) {
      response.currentPage = page;
      response.totalPages = Math.ceil(totalHives / limit);
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});
// ... (keep the rest of the file unchanged)

module.exports = router;
