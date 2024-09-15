const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hive = require('../models/Hive');
const Apiary = require('../models/Apiary');

/**
 * @swagger
 * /api/hives/all:
 *   get:
 *     summary: Get all hives with pagination
 *     description: Retrieves a paginated list of all hives for the authenticated user across all apiaries.
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default: 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default: 10)
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

    // Fetch all apiary IDs belonging to the user
    const apiaryIds = await Apiary.find({ parent: req.user }).distinct('_id');

    // Fetch hives from all apiaries belonging to the user
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
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

module.exports = router;
