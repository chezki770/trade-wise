module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/stockportfolio',
    secretOrKey: process.env.SECRET_OR_KEY || "secret"
};