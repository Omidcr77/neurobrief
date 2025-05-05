// server/routes/history.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const historyController = require('../controllers/historyController');

// GET  /api/summaries
router.get('/', auth, historyController.getAllSummaries);

// GET  /api/summaries/:id
router.get('/:id', auth, historyController.getSummaryById);

// DELETE /api/summaries/:id
router.delete('/:id', auth, historyController.deleteSummary);

module.exports = router;
