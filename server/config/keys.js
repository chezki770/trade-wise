module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/stockportfolio',
    secretOrKey: process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex')
};