const express = require('express');
const router = express.Router();

const mainRoutes = require('./routes');
const authRoutes = require('./auth');
const hiveRoutes = require('./hiveRoutes');
const inspectionRoutes = require('./inspectionRoutes');
const voiceRoutes = require('./voiceRoutes');
const boxRoutes = require('./boxRoutes');
const hiveCreationRoutes = require('./hiveCreationRoutes');
const boxAdditionRoutes = require('./boxAdditionRoutes');

// Combine all routes with unique paths
router.use('/auth', authRoutes);
router.use('/hives', hiveRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/voice', voiceRoutes);
router.use('/boxes', boxRoutes);
router.use('/hive-creation', hiveCreationRoutes);
router.use('/box-addition', boxAdditionRoutes);
router.use('/', mainRoutes);  // Mount the main routes at the root level

module.exports = router;