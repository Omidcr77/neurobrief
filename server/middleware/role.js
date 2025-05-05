// server/middleware/role.js
const User = require('../models/User');

/**
 * role(requiredRole) → middleware that ensures req.user has that role.
 */
module.exports = function(requiredRole) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }
      if (user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: Admins only.' });
      }
      next();
    } catch (err) {
      console.error('Role middleware error:', err);
      res.status(500).json({ message: 'Server error checking role.' });
    }
  };
};
