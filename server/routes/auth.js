const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  register,
  login,
  getProfile
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login',    login);

// ← Protect this route so req.user is set
router.get('/profile', auth, getProfile);

module.exports = router;
// This code defines the routes for user authentication in an Express.js application. It includes routes for user registration, login, and fetching the user's profile. The profile route is protected by middleware that checks for a valid JWT token.
