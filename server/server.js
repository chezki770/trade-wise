const path = require("path");

// Load env variables
const dotenv = require('dotenv');
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug env loading
if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Successfully loaded .env file');
}

// Debug the current working directory and .env path
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.resolve(__dirname, '../.env'));
console.log('All environment variables:', process.env);

// Use existing JWT_SECRET as SECRET_OR_KEY if not set
if (!process.env.SECRET_OR_KEY && process.env.JWT_SECRET) {
    process.env.SECRET_OR_KEY = process.env.JWT_SECRET;
    console.log('Using JWT_SECRET as SECRET_OR_KEY');
}

// Check required environment variables
const requiredEnvVars = ['ALPHAVANTAGE_API_KEY', 'MONGODB_URI', 'SECRET_OR_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => {
    const exists = !!process.env[varName];
    console.log(`Checking ${varName}:`, exists ? 'Present' : 'Missing');
    return !exists;
});

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

// Debug log to check environment variables
console.log('Environment Variables Check:', {
    ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY ? 'Present' : 'Not found',
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.cwd()
});

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");

// Load routes
const users = require("./routes/auth/users");
const news = require("./routes/news");
const stocks = require("./routes/api/stocks");
const analytics = require("./routes/analytics");
const apiUsageTracker = require("./middleware/apiUsageTracker");

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = process.env.MONGODB_URI || "mongodb://localhost:27017/stockportfolio";

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    mongoose
        .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("MongoDB successfully connected"))
        .catch(err => console.log(err));
}

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        auth: req.headers.authorization ? 'Present' : 'None'
    });
    next();
});

// Debug middleware to log environment variables on each request
app.use((req, res, next) => {
    console.log('Environment Variables:', {
        ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY ? 'Set' : 'Not Set',
        NODE_ENV: process.env.NODE_ENV
    });
    next();
});

// Use API usage tracker middleware for all routes
app.use(apiUsageTracker());

// Routes
app.use("/api/users", users);
app.use("/api/news", news);
app.use("/api/stocks", apiUsageTracker('ALPHA_VANTAGE'));
app.use("/api/stocks", stocks);
app.use("/api/analytics", analytics);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    
    // Handle Axios errors
    if (err.isAxiosError) {
        const status = err.response?.status || 500;
        const message = err.response?.data?.error || err.message;
        return res.status(status).json({
            error: 'API Error',
            message: message,
            details: err.response?.data
        });
    }
    
    // Handle other errors
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static("client/build"));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

// Function to start the server
const startServer = (port = process.env.PORT || 8080) => {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log('Environment check on server start:', {
            ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY ? 'Present' : 'Not found',
            NODE_ENV: process.env.NODE_ENV,
            PWD: process.cwd()
        });
    })
    .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying alternative port ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server failed to start:', err.message);
            process.exit(1);
        }
    });
    
    // Handle server shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
};

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// Export for testing
module.exports = app;
