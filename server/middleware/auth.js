const passport = require('passport');

module.exports = function(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ msg: 'Authentication error', error: err });
    }
    
    if (!user) {
      console.error('Authentication failed:', info);
      return res.status(401).json({ msg: 'Unauthorized', details: info });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};
