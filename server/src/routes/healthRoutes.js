const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

// @desc    Get API & Database Health
// @route   GET /api/health
router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: {
      status: 'running',
      port: process.env.PORT || 5000,
      nodeVersion: process.version,
    },
    database: {
      name: 'MongoDB',
      status: dbStatus.state,
      connected: dbStatus.isConnected,
    },
  });
});

module.exports = router;
