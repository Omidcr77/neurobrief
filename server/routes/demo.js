const express = require('express');
const router = express.Router();
const { getDemoToken } = require('../controllers/demoController');

router.get('/token', getDemoToken);

module.exports = router;