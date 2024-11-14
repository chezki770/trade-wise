const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
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
