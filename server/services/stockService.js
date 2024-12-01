const axios = require('axios');

// Cache configuration
const stockCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const stockService = {
    async fetchStockData(symbol) {
        const now = Date.now();
        if (stockCache.has(symbol) && now - stockCache.get(symbol).timestamp < CACHE_DURATION) {
            console.log('Returning cached data for', symbol);
            return stockCache.get(symbol).data;
        }

        console.log('Fetching fresh data for', symbol);
        const response = await axios.get("https://www.alphavantage.co/query", {
            params: {
                function: "TIME_SERIES_DAILY",
                symbol: symbol,
                apikey: process.env.ALPHA_VANTAGE_API_KEY
            }
        });

        // Validate response
        if (response.data["Error Message"]) {
            throw new Error(response.data["Error Message"]);
        }

        if (!response.data["Time Series (Daily)"]) {
            throw new Error(response.data.Note || "Invalid stock data or API limit reached");
        }

        const latestDate = Object.keys(response.data["Time Series (Daily)"])[0];
        const stockInfo = response.data["Time Series (Daily)"][latestDate];

        // Cache the data
        stockCache.set(symbol, { data: stockInfo, timestamp: now });
        return stockInfo;
    },

    async getPortfolioData(ownedStocks) {
        return Promise.all(
            ownedStocks.map(async stock => {
                const currentData = await this.fetchStockData(stock.symbol);
                const currentPrice = (parseFloat(currentData["2. high"]) + parseFloat(currentData["3. low"])) / 2;
                return {
                    ...stock.toObject(),
                    currentPrice,
                    value: currentPrice * stock.quantity
                };
            })
        );
    }
};

module.exports = stockService;