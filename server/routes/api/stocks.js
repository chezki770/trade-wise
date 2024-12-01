const express = require('express');
const router = express.Router();
const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = process.env.ALPHAVANTAGE_BASE_URL;

// Middleware to check API key
const checkApiKey = (req, res, next) => {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.error('Alpha Vantage API key is not set');
    return res.status(500).json({ 
      error: 'Server configuration error: API key not set',
      details: 'Please set the ALPHAVANTAGE_API_KEY environment variable'
    });
  }
  next();
};

// @route GET api/stocks/info/:symbol
// @desc Get stock information
// @access Public
router.get('/info/:symbol', checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    console.log(`Fetching stock data for symbol: ${symbol}`);
    const response = await axios.get(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    console.log('Alpha Vantage API response:', response.data);

    if (!response.data || !response.data['Global Quote']) {
      return res.status(404).json({ error: 'No data found for this symbol' });
    }

    const quote = response.data['Global Quote'];
    const stockData = {
      symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
    };

    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching stock data',
      details: error.response?.data?.error || error.message
    });
  }
});

// @route GET api/stock/price/:symbol
// @desc Get stock price information
// @access Public
router.get('/price/:symbol', checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    console.log(`Fetching stock data for symbol: ${symbol}`);
    const response = await axios.get(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    console.log('Alpha Vantage API response:', response.data);

    if (!response.data || !response.data['Global Quote']) {
      return res.status(404).json({ error: 'No data found for this symbol' });
    }

    const quote = response.data['Global Quote'];
    const stockData = {
      valid: true,
      symbol,
      currentPrice: parseFloat(quote['05. price']),
      openPrice: parseFloat(quote['02. open']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low'])
    };

    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ 
      error: 'Error fetching stock data',
      details: error.message 
    });
  }
});

// @route GET api/stocks/news/:symbol
// @desc Get stock news and overview
// @access Public
router.get('/news/:symbol', checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    console.log(`Fetching company overview for symbol: ${symbol}`);
    const response = await axios.get(
      `${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.data || !response.data.Description) {
      return res.status(404).json({ error: 'No company information found for this symbol' });
    }

    const news = [{
      title: `About ${response.data.Name} (${symbol})`,
      summary: response.data.Description,
      sector: response.data.Sector,
      industry: response.data.Industry,
      marketCap: response.data.MarketCapitalization,
      peRatio: response.data.PERatio,
      dividendYield: response.data.DividendYield,
      date: new Date().toLocaleDateString(),
    }];

    res.json(news);
  } catch (error) {
    console.error('Error fetching company overview:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching company information',
      details: error.response?.data?.error || error.message
    });
  }
});

module.exports = router;
