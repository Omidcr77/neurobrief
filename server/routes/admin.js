const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const { getMetrics } = require('../controllers/adminController');

// Protect all /api/admin routes
router.use(auth, role('admin'));

/**
 * GET /api/admin/metrics
 * Returns userCount, summaryCount, breakdown by type, and daily counts.
 */
router.get('/metrics', getMetrics);

module.exports = router;
