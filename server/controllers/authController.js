// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For generating secure tokens
const User = require('../models/User');
const {
  sendPasswordResetEmail,
  sendEmailVerification 
} = require('../services/emailService');


/**
 * GET /auth/profile
 * Returns the logged-in user’s profile (excluding passwordHash).
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User
      .findById(req.user)
      .select('-passwordHash -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
}; 
// :contentReference[oaicite:0]{index=0}


/**
 * PUT /auth/profile
 * Updates the logged-in user’s name and/or email.
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user;
    const { name, email } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    res.status(500).json({ message: 'Server error updating profile.' });
  }
}; 
// :contentReference[oaicite:1]{index=1}


/**
 * PUT /auth/password
 * Changes the logged-in user’s password (requires currentPassword + newPassword).
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Both current and new passwords are required.' 
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error updating password.' });
  }
}; 
// :contentReference[oaicite:2]{index=2}


/**
 * POST /auth/register
 * Step 1 of signup: create user with isVerified=false, generate a 6-digit code,
 * store it in emailVerificationToken + emailVerificationExpires, and send email.
 * Returns only a “code sent” message—no JWT yet.
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters' 
      });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate a 6-digit numeric verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Set expiration for 1 hour from now
    const expires = Date.now() + 60 * 60 * 1000;
    
    // Create the new user with isVerified=false
    const user = await new User({
      name,
      email,
      passwordHash,
      isVerified: false,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: new Date(expires)
    }).save();
    
    // Send the verification code via email
    await sendEmailVerification(email, verificationCode);
    
    // Respond with a simple message—no JWT yet
    return res.status(201).json({
      message: 'Verification code sent to email. Please check your inbox.',
      email: user.email
    });
  } catch (err) {
    console.error('Registration error:', err);
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
}; 
// Modified from original :contentReference[oaicite:3]{index=3}


/**
 * POST /auth/verify-email
 * Step 2 of signup: user provides { email, code }. We verify that:
 *  - a user with that email exists
 *  - isVerified is currently false
 *  - emailVerificationToken matches the provided code
 *  - emailVerificationExpires has not passed
 * If valid, set isVerified=true, clear token fields, then issue a JWT.
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified.' });
    }

    // Check that the code matches and is not expired
    if (
      user.emailVerificationToken !== code ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Mark as verified and clear token fields
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Email verified successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Server error verifying email.' });
  }
}; 
// New function, not present in original


/**
 * POST /auth/login
 * Allows only users with isVerified=true and status==='active'.
 * Rejects if user.status==='banned' or if isVerified===false.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Must be verified before login
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.'
      });
    }

    // Check if the account is banned
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account is banned.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email,
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
}; 
// Based on original, but with isVerified check and removed 'inactive' logic :contentReference[oaicite:4]{index=4}


/**
 * POST /auth/forgot-password
 * Generates a reset token (+ expiry), stores it on the user, then sends an email.
 * Always responds with 200 to avoid email enumeration.
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ 
        message: 'If that email exists, reset instructions will be sent' 
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    
    await user.save();

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    // Send email
    await sendPasswordResetEmail(email, resetUrl);

    res.status(200).json({ 
      message: 'Password reset instructions sent' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error processing request' });
  }
}; 
// :contentReference[oaicite:5]{index=5}


/**
 * POST /auth/reset-password/:token
 * Validates the reset token + expiry, then updates the password.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Basic validation
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters' 
      });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Check not expired
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired token. Please request a new reset link.' 
      });
    }

    // Update password, clear reset fields
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({ 
      message: 'Password updated successfully. You can now login with your new password.' 
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error resetting password' });
  }
}; 
// :contentReference[oaicite:6]{index=6}
