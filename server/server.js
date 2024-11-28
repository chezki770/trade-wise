const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

// Debug log to check environment variables
console.log('Environment Variables Check:', {
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ? 'Present' : 'Not found',
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
const stock = require("./routes/auth/stock");

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

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

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
        ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ? 'Set' : 'Not Set',
        NODE_ENV: process.env.NODE_ENV
    });
    next();
});

// Routes
app.use("/api/users", users);
app.use("/api/news", news);
app.use("/api/stock", stock);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
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
            ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ? 'Present' : 'Not found',
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

// Start the server
startServer();
