const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');

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

// ... (rest of the file remains unchanged)

module.exports = router;
