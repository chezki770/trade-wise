const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Validator = require("validator");
const keys = require("../../config/keys");

// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validatePurchaseInput = require("../../validation/stockRequest");

// Load Models
const User = require("../../models/User");
const Stock = require("../../models/Stock");

const stockInfoParser = require("../../utils/stockInfoParser");
const stockUpdater = require("../../utils/stockUpdater");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", async (req, res) => {
    try {
        // Form Validation
        const { errors, isValid } = validateRegisterInput(req.body);
        
        // Check Validation
        if (!isValid) {
            return res.status(400).json(errors);
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ email: "Email already exists" });
        }

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            balance: req.body.balance,
            transactions: [],
            ownedStocks: []
        });

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);
        newUser.password = hash;

        const savedUser = await newUser.save();
        
        // Return user without sensitive information
        const userResponse = {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            balance: savedUser.balance,
            date: savedUser.date
        };
        
        res.json(userResponse);
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Server error during registration" });
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

        // Create JWT Payload
        const payload = {
            id: user.id,
            name: user.name,
            balance: user.balance,
            transactions: user.transactions,
            ownedStocks: user.ownedStocks
        };

        // Sign token
        jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 31556926 },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token: "Bearer " + token
                });
            }
        );

        // Update stock prices in background
        if (user.ownedStocks && user.ownedStocks.length > 0) {
            updateStockPrices(user.ownedStocks);
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// @route POST api/users/stockRequest
// @desc Validate stock purchase/sale request
// @access Private
router.post("/stockRequest", (req, res) => {
    const { errors, isValid } = validatePurchaseInput(req.body);
    
    if (!isValid) {
        return res.status(400).json(errors);
    }
    
    res.status(200).send("Request validated");
});

// @route POST api/users/buyStock
// @desc Process stock purchase
// @access Private
router.post("/buyStock", async (req, res) => {
    try {
        const { userId, symbol, quantity, stockInfo } = req.body;
        
        // Validate inputs
        if (!userId || !symbol || !quantity || !stockInfo) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const parsedInfo = stockInfoParser(stockInfo);
        let stock = await Stock.findOne({ ticker_symbol: symbol });
        stock = stockUpdater(parsedInfo, stock, symbol);
        
        const stockTotal = quantity * stock.price;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.balance < stockTotal) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // Process purchase
        user.balance -= stockTotal;
        
        // Record transaction
        user.transactions.push({
            transaction_type: "BUY",
            symbol: stock.ticker_symbol,
            stock_price: stock.price,
            stock_quantity: quantity
        });

        // Update owned stocks
        const existingStock = user.ownedStocks.find(s => s.symbol === stock.ticker_symbol);
        if (existingStock) {
            existingStock.quantity += parseInt(quantity, 10);
            existingStock.unit_price = stock.price;
            existingStock.open_price = stock.opening_price;
        } else {
            user.ownedStocks.push({
                symbol: stock.ticker_symbol,
                quantity: parseInt(quantity, 10),
                unit_price: stock.price,
                open_price: stock.opening_price
            });
        }

        const updatedUser = await user.save();
        
        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            balance: updatedUser.balance,
            transactions: updatedUser.transactions,
            ownedStocks: updatedUser.ownedStocks
        });
    } catch (err) {
        console.error("Buy stock error:", err);
        res.status(500).json({ error: "Error processing stock purchase" });
    }
});

// @route POST api/users/sellStock
// @desc Process stock sale
// @access Private
router.post("/sellStock", async (req, res) => {
    try {
        const { userId, symbol, quantity, stockInfo } = req.body;

        if (!userId || !symbol || !quantity || !stockInfo) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const parsedInfo = stockInfoParser(stockInfo);
        let stock = await Stock.findOne({ ticker_symbol: symbol });
        stock = stockUpdater(parsedInfo, stock, symbol);
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const ownedStock = user.ownedStocks.find(s => s.symbol === symbol);
        if (!ownedStock || ownedStock.quantity < quantity) {
            return res.status(400).json({ error: "Insufficient shares" });
        }

        const saleTotal = quantity * stock.price;
        user.balance += saleTotal;

        // Record transaction
        user.transactions.push({
            transaction_type: "SELL",
            symbol: stock.ticker_symbol,
            stock_price: stock.price,
            stock_quantity: quantity
        });

        // Update owned stocks
        ownedStock.quantity -= quantity;
        if (ownedStock.quantity === 0) {
            user.ownedStocks = user.ownedStocks.filter(s => s.symbol !== symbol);
        } else {
            ownedStock.unit_price = stock.price;
        }

        const updatedUser = await user.save();
        
        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            balance: updatedUser.balance,
            transactions: updatedUser.transactions,
            ownedStocks: updatedUser.ownedStocks
        });
    } catch (err) {
        console.error("Sell stock error:", err);
        res.status(500).json({ error: "Error processing stock sale" });
    }
});

// @route POST api/users/updateStocks
// @desc Update prices for all owned stocks
// @access Private
router.post("/updateStocks", async (req, res) => {
    try {
        const user = await User.findById(req.body.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.ownedStocks || user.ownedStocks.length === 0) {
            return res.status(400).json({ error: "No stocks to update" });
        }

        await updateStockPrices(user.ownedStocks);
        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            balance: updatedUser.balance,
            transactions: updatedUser.transactions,
            ownedStocks: updatedUser.ownedStocks
        });
    } catch (err) {
        console.error("Update stocks error:", err);
        res.status(500).json({ error: "Error updating stock prices" });
    }
});

// Helper function to update stock prices
async function updateStockPrices(ownedStocks) {
    const url = "https://www.alphavantage.co/query?";
    const func = "function=TIME_SERIES_DAILY&symbol=";
    const apiKey = "&apikey=5ETEDSPX3VTJD6TR";

    for (const stock of ownedStocks) {
        try {
            const response = await axios.get(url + func + stock.symbol + apiKey);
            const obj = response.data["Time Series (Daily)"];
            const dateStr = Object.keys(obj)[0];
            const info = stockInfoParser(obj[dateStr]);
            
            stock.unit_price = parseInt(info.price, 10);
            stock.open_price = parseInt(info.opening_price, 10);
        } catch (err) {
            console.error(`Error updating price for ${stock.symbol}:`, err);
        }
    }
}

module.exports = router;