const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const mongoose = require("mongoose");
const axios = require("axios");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validatePurchaseInput = require("../../validation/stockRequest");

// Load User model
const User = require("../../models/User");

// Debug middleware for auth routes
router.use((req, res, next) => {
    console.log('Auth Header:', req.headers.authorization);
    next();
});

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", async (req, res) => {
    try {
        const { errors, isValid } = validateRegisterInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ email: "Email already exists" });
        }

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin || false,
            balance: 100000.00,
            transactions: [],
            ownedStocks: []
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);
        newUser.password = hash;

        const savedUser = await newUser.save();

        const payload = {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            isAdmin: savedUser.isAdmin,
            balance: savedUser.balance,
            transactions: savedUser.transactions,
            ownedStocks: savedUser.ownedStocks
        };

        jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 31556926 },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token: "Bearer " + token,
                    user: payload
                });
            }
        );
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Error registering user" });
    }
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", async (req, res) => {
    try {
        const { errors, isValid } = validateLoginInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ emailnotfound: "Email not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ passwordincorrect: "Password incorrect" });
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            balance: user.balance,
            transactions: user.transactions,
            ownedStocks: user.ownedStocks
        };

        jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 31556926 },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token: "Bearer " + token,
                    user: payload
                });
            }
        );
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Error logging in" });
    }
});

// @route GET api/users
// @desc Get all users (admin only)
// @access Private/Admin
router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        const users = await User.find()
            .select("-password") // Exclude password field
            .sort({ date: -1 }); // Sort by date, newest first

        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// @route GET api/users/all
// @desc Get all users (admin only)
// @access Private
router.get("/all", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Unauthorized: Admin access required" });
        }

        const users = await User.find()
            .select("-password")
            .sort({ date: -1 });

        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Error fetching users" });
    }
});

// @route GET api/users/current
// @desc Return current user
// @access Private
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
            balance: req.user.balance,
            transactions: req.user.transactions,
            ownedStocks: req.user.ownedStocks
        });
    }
);

// @route PUT api/users/:id
// @desc Update user (admin only)
// @access Private
router.put("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Unauthorized: Admin access required" });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (typeof req.body.isAdmin === 'boolean') {
            user.isAdmin = req.body.isAdmin;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                balance: updatedUser.balance,
                transactions: updatedUser.transactions,
                ownedStocks: updatedUser.ownedStocks
            }
        });
    } catch (err) {
        console.error("Update route error:", err);
        res.status(500).json({ error: "Error updating user" });
    }
});

// @route POST api/users/stockRequest 
// @desc Validate stock request
// @access Private
router.post("/stockRequest", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const { errors, isValid } = validatePurchaseInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Stock request validation error:", err);
        res.status(500).json({ error: "Error validating stock request" });
    }
});

// @route POST api/users/buyStock
// @desc Buy stocks
// @access Private
router.post("/buyStock", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        console.log("Buy stock request body:", req.body);
        const { userId, symbol, quantity, stockInfo } = req.body;

        // Validate input
        if (!userId || !symbol || !quantity || !stockInfo) {
            console.error("Missing required fields:", { userId, symbol, quantity, stockInfo });
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found:", userId);
            return res.status(404).json({ error: "User not found" });
        }

        // Validate stock info
        if (!stockInfo.currentPrice || isNaN(stockInfo.currentPrice)) {
            console.error("Invalid stock price:", stockInfo);
            return res.status(400).json({ error: "Invalid stock price" });
        }

        const currentPrice = Number(stockInfo.currentPrice);
        const totalCost = currentPrice * quantity;

        if (user.balance < totalCost) {
            console.error("Insufficient funds:", { balance: user.balance, cost: totalCost });
            return res.status(400).json({ error: "Insufficient funds" });
        }

        user.balance -= totalCost;

        const existingStockIndex = user.ownedStocks.findIndex(stock => stock.symbol === symbol);

        if (existingStockIndex !== -1) {
            const existingStock = user.ownedStocks[existingStockIndex];
            const newQuantity = existingStock.quantity + Number(quantity);
            const newAveragePrice = ((existingStock.unit_price * existingStock.quantity) + (currentPrice * quantity)) / newQuantity;

            user.ownedStocks[existingStockIndex] = {
                symbol,
                quantity: newQuantity,
                unit_price: newAveragePrice,
                open_price: Number(stockInfo.openPrice)
            };
        } else {
            user.ownedStocks.push({
                symbol,
                quantity: Number(quantity),
                unit_price: currentPrice,
                open_price: Number(stockInfo.openPrice)
            });
        }

        user.transactions.push({
            transaction_type: "BUY",
            symbol,
            stock_price: currentPrice,
            stock_quantity: Number(quantity),
            date: new Date()
        });

        console.log("Saving updated user data:", user);
        await user.save();

        res.json({
            success: true,
            data: user
        });

    } catch (err) {
        console.error("Buy stock error:", err);
        res.status(500).json({ error: "Error processing stock purchase" });
    }
});

// @route POST api/users/sellStock
// @desc Sell stocks
// @access Private
router.post("/sellStock", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        console.log("Sell Stock Request Body:", req.body); // Log incoming request

        // Extract necessary fields from request
        const { userId, symbol, quantity, stockInfo } = req.body;

        // Input validation
        if (!userId || !symbol || !quantity || !stockInfo) {
            return res.status(400).json({
                error: "Missing required fields: userId, symbol, quantity, stockInfo"
            });
        }

        // Find user in database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log("User found:", user);

        // Check if the stock exists in user's portfolio
        const stockIndex = user.ownedStocks.findIndex(stock => stock.symbol === symbol);
        if (stockIndex === -1) {
            return res.status(400).json({ error: "Stock not found in portfolio" });
        }

        const ownedStock = user.ownedStocks[stockIndex];
        console.log("Owned Stock:", ownedStock);

        // Ensure user has sufficient shares to sell
        if (ownedStock.quantity < quantity) {
            return res.status(400).json({
                error: "Insufficient shares to sell",
                owned: ownedStock.quantity,
                requested: quantity
            });
        }

        // Calculate current stock price and sale proceeds
        const currentPrice = stockInfo.currentPrice;
        const saleProceeds = currentPrice * quantity;

        console.log("Current Price:", currentPrice);
        console.log("Sale Proceeds:", saleProceeds);

        // Update user's balance
        user.balance += saleProceeds;

        // Update or remove stock from portfolio
        const remainingQuantity = ownedStock.quantity - quantity;
        if (remainingQuantity === 0) {
            // Remove stock if all shares are sold
            user.ownedStocks.splice(stockIndex, 1);
        } else {
            // Ensure all required fields are preserved
            user.ownedStocks[stockIndex] = {
                symbol: ownedStock.symbol,
                quantity: remainingQuantity,
                unit_price: ownedStock.unit_price,
                open_price: ownedStock.open_price
            };
        }

        console.log("Updated Owned Stocks:", user.ownedStocks);

        // Record transaction in user's history
        user.transactions.push({
            transaction_type: "SELL",
            symbol,
            stock_price: currentPrice,
            stock_quantity: quantity,
            date: new Date()
        });

        console.log("New Transaction Recorded:", user.transactions[user.transactions.length - 1]);

        // Save user to database
        await user.save();

        // Return success response
        res.json({
            success: true,
            message: "Stock sold successfully",
            balance: user.balance,
            ownedStocks: user.ownedStocks,
            transactions: user.transactions
        });
    } catch (err) {
        console.error("Sell Stock Error:", err);
        res.status(500).json({ error: "Error processing stock sale", details: err.message });
    }
});

// @route POST api/users/updateStocks
// @desc Update prices for all owned stocks
// @access Private
router.post("/updateStocks", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        console.log("Update Stocks Request Body:", req.body);

        // Extract userId from request body
        const { userId } = req.body;

        // Input validation
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Find user in the database using userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log("User found:", user);

        // Check if user has stocks to update
        if (!user.ownedStocks || user.ownedStocks.length === 0) {
            return res.status(400).json({ error: "No stocks to update" });
        }

        // Log owned stocks before update
        console.log("Owned Stocks Before Update:", user.ownedStocks);

        // Update stock prices for all owned stocks
        await updateStockPrices(user.ownedStocks);

        // Save updated user
        const updatedUser = await user.save();

        // Log owned stocks after update
        console.log("Owned Stocks After Update:", updatedUser.ownedStocks);

        // Return success response
        res.json({
            success: true,
            message: "Stock prices updated successfully",
            ownedStocks: updatedUser.ownedStocks
        });
    } catch (err) {
        console.error("Update Stocks Error:", err);
        res.status(500).json({ error: "Error updating stock prices", details: err.message });
    }
});

// Helper function to fetch and update stock prices
async function updateStockPrices(ownedStocks) {
    const url = "https://www.alphavantage.co/query?";
    const func = "function=TIME_SERIES_DAILY&symbol=";
    const apiKey = "&apikey=5ETEDSPX3VTJD6TR"; // Replace with a valid API key

    for (const stock of ownedStocks) {
        try {
            console.log(`Fetching data for stock: ${stock.symbol}`);
            const response = await axios.get(url + func + stock.symbol + apiKey);

            // Parse stock data
            const dailyData = response.data["Time Series (Daily)"];
            if (!dailyData) {
                console.warn(`No data available for stock symbol: ${stock.symbol}`);
                continue;
            }

            const latestDate = Object.keys(dailyData)[0];
            const stockInfo = dailyData[latestDate];

            // Update stock prices
            stock.unit_price = parseFloat(stockInfo["4. close"]);
            stock.open_price = parseFloat(stockInfo["1. open"]);
            console.log(`Updated ${stock.symbol}:`, { unit_price: stock.unit_price, open_price: stock.open_price });
        } catch (err) {
            console.error(`Error updating price for ${stock.symbol}:`, err.message);
        }
    }
}


module.exports = router;
