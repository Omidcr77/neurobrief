const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle demo user first
    if (decoded.isDemo) {
      req.user = { 
        _id: decoded.userId, 
        role: 'user',
        isDemo: true 
      };
      return next();
    }

    // Handle regular users
    req.user = decoded.userId;
    if (!req.user) {
      return res.status(401).json({ message: 'Token payload invalid.' });
    }
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};