const express = require("express");
const router = express.Router();
const axios = require("axios");

// Cache configuration to reduce API calls
const stockCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // Cache data for 5 minutes

// Fetch stock data with caching
async function fetchStockData(symbol) {
    const now = Date.now();
    if (stockCache.has(symbol) && now - stockCache.get(symbol).timestamp < CACHE_DURATION) {
        return stockCache.get(symbol).data;
    }

    const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
            function: "TIME_SERIES_DAILY",
            symbol: symbol,
            apikey: process.env.ALPHA_VANTAGE_API_KEY // Ensure you set this in .env
        }
    });

    if (!response.data["Time Series (Daily)"]) {
        throw new Error(response.data.Note || "Invalid stock data or API limit reached");
    }

    const latestDate = Object.keys(response.data["Time Series (Daily)"])[0];
    const stockInfo = response.data["Time Series (Daily)"][latestDate];

    // Cache the data
    stockCache.set(symbol, { data: stockInfo, timestamp: now });
    return stockInfo;
}

// Route to validate stock symbol and get price
router.get("/price/:symbol", async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const stockInfo = await fetchStockData(symbol);

        const currentPrice = (parseFloat(stockInfo["2. high"]) + parseFloat(stockInfo["3. low"])) / 2;

        res.json({
            valid: true,
            currentPrice,
            openPrice: parseFloat(stockInfo["1. open"])
        });
    } catch (error) {
        res.status(400).json({
            valid: false,
            error: error.message
        });
    }
});

module.exports = router;