// routes/auth.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// ─── Public ────────────────────────────────────────
// Anyone can hit these without a token:
router.post('/register', register);
router.post('/login',    login);

// ─── Protected ─────────────────────────────────────
// All routes declared _after_ this line will require auth:
router.use(auth);

router.get ('/profile', auth, getProfile);
router.put ('/profile', auth, updateProfile);

module.exports = router;
