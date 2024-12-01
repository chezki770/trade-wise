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
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// @route GET api/stocks/info/:symbol
// @desc Get stock information
// @access Private
router.get('/info/:symbol', authenticateJWT, checkApiKey, async (req, res) => {
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
// @access Private
router.get('/price/:symbol', authenticateJWT, checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    console.log('Fetching stock data for symbol:', symbol);
    
    const response = await axios.get(`${ALPHA_VANTAGE_BASE_URL}`, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    console.log('Alpha Vantage API response:', response.data);

    const quote = response.data['Global Quote'];
    
    // Check if the quote is empty (invalid symbol)
    if (!quote || Object.keys(quote).length === 0) {
      return res.status(404).json({ error: 'Invalid stock symbol' });
    }

    const stockData = {
      valid: true,
      symbol: quote['01. symbol'],
      currentPrice: parseFloat(quote['05. price']),
      openPrice: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
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
// @access Private
router.get('/news/:symbol', authenticateJWT, checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    // Fetch both company overview and news in parallel
    const [overviewResponse, newsResponse] = await Promise.all([
      axios.get(
        `${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      ),
      axios.get(
        `${ALPHA_VANTAGE_BASE_URL}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      )
    ]);

    const news = [];

    // Add company overview if available
    if (overviewResponse.data && overviewResponse.data.Description) {
      news.push({
        type: 'overview',
        title: `About ${overviewResponse.data.Name} (${symbol})`,
        summary: overviewResponse.data.Description,
        sector: overviewResponse.data.Sector,
        industry: overviewResponse.data.Industry,
        marketCap: overviewResponse.data.MarketCapitalization,
        peRatio: overviewResponse.data.PERatio,
        dividendYield: overviewResponse.data.DividendYield,
        date: new Date().toLocaleDateString(),
      });
    }

    // Add news articles if available
    if (newsResponse.data && newsResponse.data.feed) {
      const newsArticles = newsResponse.data.feed
        .slice(0, 5) // Get top 5 news articles
        .map(article => ({
          type: 'news',
          title: article.title,
          summary: article.summary,
          url: article.url,
          source: article.source,
          date: new Date(article.time_published).toLocaleDateString(),
          sentiment: article.overall_sentiment_label
        }));
      
      news.push(...newsArticles);
    }

    if (news.length === 0) {
      return res.status(404).json({ error: 'No information found for this symbol' });
    }

    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching news',
      details: error.response?.data?.error || error.message
    });
  }
});

// @route GET api/stocks/history/:symbol
// @desc Get stock price history
// @access Private
router.get('/history/:symbol', authenticateJWT, checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol is required' });
    }

    console.log(`Fetching historical data for symbol: ${symbol}`);
    const response = await axios.get(
      `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.data || !response.data['Time Series (Daily)']) {
      return res.status(404).json({ error: 'No historical data found for this symbol' });
    }

    const timeSeriesData = response.data['Time Series (Daily)'];
    const historicalData = Object.entries(timeSeriesData)
      .slice(0, 30) // Get last 30 days
      .map(([date, data]) => ({
        date,
        price: parseFloat(data['4. close'])
      }))
      .reverse(); // Show oldest to newest

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ 
      error: 'Error fetching historical data',
      details: error.message 
    });
  }
});

module.exports = router;
