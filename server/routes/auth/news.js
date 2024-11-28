const express = require("express");
const axios = require("axios");
const router = express.Router();

// In-memory cache
let newsCache = {
  data: null,
  timestamp: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const API_TIMEOUT = 10000; // 10 seconds timeout

// Test route to verify API key and connection
router.get("/test", async (req, res) => {
  try {
    console.log("Testing Alpha Vantage connection...");
    console.log("API Key:", process.env.ALPHA_VANTAGE_API_KEY);
    
    // Simple test query for a single stock quote
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: "AAPL",
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });
    
    console.log("Test response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Test failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Define the route to get stock market news
router.get("/", async (req, res) => {
  console.log("News request received");

  try {
    // Check cache first
    const now = Date.now();
    if (newsCache.data && newsCache.timestamp && (now - newsCache.timestamp < CACHE_DURATION)) {
      console.log("Returning cached news data");
      return res.json(newsCache.data);
    }

    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      console.error("Alpha Vantage API key is not set");
      return res.status(500).json({ error: "API key configuration error" });
    }

    console.log("Using API Key:", process.env.ALPHA_VANTAGE_API_KEY);

    const apiUrl = "https://www.alphavantage.co/query";
    console.log("Making request to Alpha Vantage API...");
    
    const params = {
      function: "NEWS_SENTIMENT",
      apikey: process.env.ALPHA_VANTAGE_API_KEY,
      topics: "technology,earnings", 
      limit: 10
    };
    
    console.log("Requesting news with params:", {
      ...params,
      apikey: "HIDDEN" // Don't log the API key
    }); 
    
    const response = await axios.get(apiUrl, { 
      params,
      timeout: API_TIMEOUT
    });

    console.log("Alpha Vantage raw response:", response.data); 

    // Check for API limit message
    if (response.data.Note) {
      console.log("API limit reached:", response.data.Note);
      return res.status(429).json({ 
        error: "API limit reached",
        message: response.data.Note
      });
    }

    // Check for valid feed data
    if (!response.data.feed || !Array.isArray(response.data.feed)) {
      console.log("Invalid or empty feed data:", response.data);
      return res.status(200).json({ 
        feed: [],
        message: "No news articles available at the moment."
      });
    }

    // Process and send the news feed
    const processedNews = response.data.feed.map(item => ({
      title: item.title || "No title",
      url: item.url || "#",
      summary: item.summary || "No summary available",
      timePublished: item.time_published || "",
      source: item.source || "Unknown",
      sentiment: item.overall_sentiment_label || "Unknown"
    }));

    // Update cache
    newsCache = {
      data: { feed: processedNews },
      timestamp: now
    };

    console.log(`Successfully processed ${processedNews.length} news articles`);
    res.json({ feed: processedNews });
  } catch (error) {
    console.error("Error fetching news:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: "Request timeout", 
        message: "The news service is taking too long to respond" 
      });
    }
    
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      return res.status(error.response.status || 500).json({ 
        error: "News service error", 
        message: error.response.data?.message || error.message 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch news", 
      message: error.message 
    });
  }
});

module.exports = router;
