const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const upload  = require('../middleware/upload');

const {
  textSummarize
} = require('../controllers/summaryController');

const {
  pdfSummarize
} = require('../controllers/pdfController');

const {
  urlSummarize
} = require('../controllers/urlController');

// Text (existing) 
router.post('/text', auth, textSummarize);

// PDF
router.post('/pdf', auth, upload.single('file'), pdfSummarize);

// URL
router.post('/url', auth, urlSummarize);

module.exports = router;
