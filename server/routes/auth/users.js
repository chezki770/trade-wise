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
        const { symbol, quantity, stockInfo } = req.body;
        const userId = req.user.id; // Get userId from authenticated user

        // Validate input
        if (!symbol || !quantity || !stockInfo) {
            console.error("Missing required fields:", { symbol, quantity, stockInfo });
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate stockInfo structure
        if (!stockInfo || typeof stockInfo !== 'object') {
            console.error("Invalid stockInfo object:", stockInfo);
            return res.status(400).json({ error: "Invalid stock information provided" });
        }

        if (!stockInfo.currentPrice || isNaN(stockInfo.currentPrice)) {
            console.error("Invalid stock price:", stockInfo);
            return res.status(400).json({ error: "Invalid stock price" });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found:", userId);
            return res.status(404).json({ error: "User not found" });
        }

        // Convert values to numbers and fix decimal places
        const currentPrice = Number(parseFloat(stockInfo.currentPrice).toFixed(2));
        const quantityNum = Number(parseInt(quantity));
        const commission = 0.00; // Add commission if needed
        const totalCost = parseFloat((currentPrice * quantityNum + commission).toFixed(2));

        console.log("Purchase details:", {
            userId,
            symbol,
            quantity: quantityNum,
            currentPrice,
            commission,
            totalCost,
            userBalance: user.balance
        });

        if (user.balance < totalCost) {
            console.error("Insufficient funds:", { balance: user.balance, cost: totalCost });
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // Update user balance with proper decimal handling
        user.balance = parseFloat((user.balance - totalCost).toFixed(2));

        const existingStockIndex = user.ownedStocks.findIndex(stock => stock.symbol === symbol);

        if (existingStockIndex !== -1) {
            // Update existing position with proper average price calculation
            const existingStock = user.ownedStocks[existingStockIndex];
            const totalShares = existingStock.quantity + quantityNum;
            const totalValue = (existingStock.quantity * existingStock.unit_price) + (quantityNum * currentPrice);
            const newAveragePrice = parseFloat((totalValue / totalShares).toFixed(2));

            user.ownedStocks[existingStockIndex] = {
                symbol,
                quantity: totalShares,
                unit_price: newAveragePrice,
                open_price: currentPrice,
                last_updated: new Date()
            };
        } else {
            // Add new position
            user.ownedStocks.push({
                symbol,
                quantity: quantityNum,
                unit_price: currentPrice,
                open_price: currentPrice,
                last_updated: new Date()
            });
        }

        // Record transaction
        user.transactions.push({
            transaction_type: "BUY",
            symbol,
            stock_price: currentPrice,
            stock_quantity: quantityNum,
            // commission,
            // total_cost: totalCost,
            date: new Date()
        });

        console.log("Saving updated user data:", {
            balance: user.balance,
            ownedStocks: user.ownedStocks,
            lastTransaction: user.transactions[user.transactions.length - 1]
        });

        await user.save();

        res.json({
            success: true,
            data: user
        });

    } catch (err) {
        console.error("Buy stock error:", err);
        res.status(500).json({ 
            error: "Error processing stock purchase", 
            details: err.message
        });
    }
});

// @route POST api/users/sellStock
// @desc Sell stocks
// @access Private
router.post("/sellStock", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        console.log("Sell Stock Request Body:", req.body);

        const { symbol, quantity, stockInfo } = req.body;
        const userId = req.user.id; // Get userId from authenticated user

        // Input validation
        if (!symbol || !quantity || !stockInfo) {
            console.error("Missing required fields:", { symbol, quantity, stockInfo });
            return res.status(400).json({
                error: "Missing required fields",
                details: {
                    symbol: !symbol ? "Symbol is required" : null,
                    quantity: !quantity ? "Quantity is required" : null,
                    stockInfo: !stockInfo ? "Stock information is required" : null
                }
            });
        }

        // Validate stockInfo structure
        if (!stockInfo.currentPrice || isNaN(stockInfo.currentPrice)) {
            console.error("Invalid stock price:", stockInfo);
            return res.status(400).json({
                error: "Invalid stock information",
                details: "Current price is required and must be a number"
            });
        }

        // Find user in database
        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found:", userId);
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the stock exists in user's portfolio
        const stockIndex = user.ownedStocks.findIndex(stock => stock.symbol === symbol);
        if (stockIndex === -1) {
            console.error("Stock not found in portfolio:", { userId, symbol });
            return res.status(400).json({ 
                error: "Stock not found in portfolio",
                details: `You do not own any shares of ${symbol}`
            });
        }

        const ownedStock = user.ownedStocks[stockIndex];
        const quantityNum = Number(parseInt(quantity));
        const currentPrice = Number(parseFloat(stockInfo.currentPrice).toFixed(2));
        const commission = 0.00; // Add commission if needed

        // Ensure user has sufficient shares to sell
        if (ownedStock.quantity < quantityNum) {
            console.error("Insufficient shares:", { 
                owned: ownedStock.quantity, 
                requested: quantityNum,
                symbol
            });
            return res.status(400).json({
                error: "Insufficient shares to sell",
                details: `You only own ${ownedStock.quantity} shares of ${symbol}, but attempted to sell ${quantityNum} shares`,
                owned: ownedStock.quantity,
                requested: quantityNum
            });
        }

        // Calculate sale proceeds and profit/loss
        const saleProceeds = parseFloat((currentPrice * quantityNum - commission).toFixed(2));
        const costBasis = parseFloat((ownedStock.unit_price * quantityNum).toFixed(2));
        const profitLoss = parseFloat((saleProceeds - costBasis).toFixed(2));

        console.log("Sale calculations:", {
            currentPrice,
            quantityNum,
            commission,
            saleProceeds,
            costBasis,
            profitLoss
        });

        // Update user's balance
        const newBalance = parseFloat((user.balance + saleProceeds).toFixed(2));
        user.balance = newBalance;

        // Update or remove stock position
        if (ownedStock.quantity === quantityNum) {
            // Remove the stock if selling all shares
            user.ownedStocks = user.ownedStocks.filter(stock => stock.symbol !== symbol);
        } else {
            // Update remaining position
            const remainingShares = ownedStock.quantity - quantityNum;
            const updatedStock = {
                ...ownedStock.toObject(),
                quantity: remainingShares,
                last_updated: new Date()
            };
            user.ownedStocks = user.ownedStocks.map(stock => 
                stock.symbol === symbol ? updatedStock : stock
            );
        }

        // Record transaction
        const transaction = {
            transaction_type: "SELL",
            symbol,
            stock_price: currentPrice,
            stock_quantity: quantityNum,
            // commission,
            // total_proceeds: saleProceeds,
            profit_loss: profitLoss,
            date: new Date()
        };
        user.transactions.push(transaction);

        console.log("Saving updated user data:", {
            balance: user.balance,
            ownedStocks: user.ownedStocks,
            lastTransaction: transaction
        });

        await user.save();

        res.json({
            success: true,
            data: {
                user,
                saleDetails: {
                    proceeds: saleProceeds,
                    profitLoss,
                    commission,
                    remainingShares: ownedStock.quantity - quantityNum
                }
            }
        });

    } catch (err) {
        console.error("Sell stock error details:", {
            error: err.message,
            stack: err.stack,
            requestBody: req.body,
            userId: req.user?.id
        });
        res.status(500).json({ 
            error: "Error processing stock sale", 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
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
