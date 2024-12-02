const ApiUsage = require('../models/ApiUsage');

const apiUsageTracker = (provider = 'INTERNAL') => async (req, res, next) => {
  // Store the original end function
  const originalEnd = res.end;
  
  // Override the end function
  res.end = async function (chunk, encoding) {
    // Restore the original end function
    res.end = originalEnd;
    
    try {
      // Create API usage record
      await ApiUsage.create({
        endpoint: req.originalUrl,
        method: req.method,
        userId: req.user ? req.user.id : null,
        responseStatus: res.statusCode,
        provider
      });
    } catch (error) {
      console.error('Error logging API usage:', error);
    }
    
    // Call the original end function
    res.end(chunk, encoding);
  };
  
  next();
};

module.exports = apiUsageTracker;
