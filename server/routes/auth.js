// routes/auth.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,      // ← import the new controller
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Public routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ─── Public ────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ─── Protected ────────────────────────────────────
router.use(auth);

// Profile routes
router.get ('/profile', auth, getProfile);
router.put ('/profile', auth, updateProfile);

// **New** Change-Password route
router.put('/password', auth, changePassword);



module.exports = router;
