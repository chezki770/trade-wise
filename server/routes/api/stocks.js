const express = require('express');
const router = express.Router();
const axios = require('axios');
const passport = require("passport");

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

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      console.error('Authentication failed:', info);
      return res.status(401).json({ error: 'Unauthorized', details: info });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// @route GET api/stocks/price/:symbol
// @desc Get stock price information
// @access Private
router.get('/price/:symbol', authenticateJWT, checkApiKey, async (req, res) => {
  console.log('Processing stock price request for symbol:', req.params.symbol);
  console.log('User:', req.user.name); // Log the authenticated user
  
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    console.log('Fetching stock data for symbol:', symbol);
    
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const quote = response.data['Global Quote'];
    
    // Check if we have valid price data
    if (quote && quote['05. price']) {
      res.json({
        valid: true,
        currentPrice: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change'] || 0),
        changePercent: parseFloat((quote['10. change percent'] || '0%').replace('%', ''))
      });
    } else {
      res.json({ 
        valid: false,
        error: 'Invalid stock symbol'
      });
    }
  } catch (err) {
    console.error('Error fetching stock price:', err);
    res.status(500).json({ 
      valid: false,
      error: 'Server error fetching stock price'
    });
  }
});

// @route GET api/stocks/history/:symbol
// @desc Get historical stock data
// @access Private
router.get('/history/:symbol', authenticateJWT, checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    
    if (!timeSeries) {
      return res.json({ 
        valid: false,
        error: 'No historical data available'
      });
    }

    // Convert the data into an array format suitable for charts
    const historicalData = Object.entries(timeSeries)
      .slice(0, 30) // Get last 30 days
      .map(([date, values]) => ({
        date,
        price: parseFloat(values['4. close'])
      }))
      .reverse();

    res.json({
      valid: true,
      data: historicalData
    });
  } catch (err) {
    console.error('Error fetching historical data:', err);
    res.status(500).json({ 
      valid: false,
      error: 'Server error fetching historical data'
    });
  }
});

// @route GET api/stocks/news/:symbol
// @desc Get news for a stock
// @access Private
router.get('/news/:symbol', authenticateJWT, checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    if (!response.data.feed) {
      return res.json({ 
        valid: false,
        error: 'No news available'
      });
    }

    // Process and format the news data
    const newsData = response.data.feed.map(item => ({
      title: item.title,
      url: item.url,
      source: item.source,
      summary: item.summary,
      publishedAt: item.time_published,
      sentiment: item.overall_sentiment_label,
      image: item.banner_image || item.source_domain_image || null
    })).slice(0, 10); // Get top 10 news items

    res.json({
      valid: true,
      data: newsData
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ 
      valid: false,
      error: 'Server error fetching news data'
    });
  }
});

module.exports = router;
