const stockService = require('../services/stockService');

const stockController = {
    async getDailyStockData(req, res) {
        try {
            const symbol = req.params.symbol.toUpperCase();
            const stockInfo = await stockService.fetchStockData(symbol);
            res.json({ "Time Series (Daily)": { [new Date().toISOString().split('T')[0]]: stockInfo } });
        } catch (error) {
            console.error("Stock API Error:", error);
            res.status(400).json({
                error: error.message
            });
        }
    },

    async getStockPrice(req, res) {
        try {
            const symbol = req.params.symbol.toUpperCase();
            const stockInfo = await stockService.fetchStockData(symbol);

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
    },

    async getPortfolio(req, res) {
        try {
            const portfolioData = await stockService.getPortfolioData(req.user.ownedStocks);
            res.json(portfolioData);
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch portfolio data",
                details: error.message
            });
        }
    }
};

module.exports = stockController;