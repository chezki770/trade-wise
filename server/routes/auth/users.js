const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const mongoose = require("mongoose");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

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
        
        // Create JWT Payload for immediate login
        const payload = {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            isAdmin: savedUser.isAdmin,
            balance: savedUser.balance,
            transactions: savedUser.transactions,
            ownedStocks: savedUser.ownedStocks
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
        console.log("Update route accessed", {
            userId: req.params.id,
            updateData: req.body,
            requestingUser: req.user._id
        });

        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Unauthorized: Admin access required" });
        }

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update user fields
        if (typeof req.body.isAdmin === 'boolean') {
            user.isAdmin = req.body.isAdmin;
        }

        // Save the updated user
        const updatedUser = await user.save();
        console.log("User updated successfully:", updatedUser);

        // Return the updated user (excluding password)
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

module.exports = router;