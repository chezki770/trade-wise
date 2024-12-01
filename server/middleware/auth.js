const jwt = require('jsonwebtoken');
const config = require('../config/keys');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Extract token from Bearer format
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    // Verify token
    const decoded = jwt.verify(token, config.secretOrKey);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
