import React, { useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './StockResearch.css';

// Configure axios baseURL
axios.defaults.baseURL = 'http://localhost:8080';

const StockResearch = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [price, setPrice] = useState(null);

  // Get the token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('jwtToken');
    console.log('Current token:', token);
    return token || '';
  };

  const fetchStockPrice = async (searchSymbol) => {
    if (!searchSymbol) return;
    
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      console.log('Making API calls with token:', token);

      const config = {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      };

      const priceResponse = await axios.get(`/api/stocks/price/${searchSymbol}`, config);
      if (priceResponse.data.valid) {
        setPrice(priceResponse.data.currentPrice);
        setError('');
        return true;
      } else {
        setError(priceResponse.data.error || 'Invalid stock symbol');
        setPrice(null);
        return false;
      }
    } catch (err) {
      console.error('Stock price fetch error:', err);
      setError(err.message || 'Failed to fetch stock price');
      setPrice(null);
      return false;
    }
  };

  const fetchStockData = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      };

      // First validate the symbol by fetching price
      const isValid = await fetchStockPrice(symbol);
      if (!isValid) {
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [historyResponse, newsResponse] = await Promise.all([
        axios.get(`/api/stocks/history/${symbol}`, config),
        axios.get(`/api/stocks/news/${symbol}`, config)
      ]);
      
      if (historyResponse.data.valid) {
        setHistoricalData(historyResponse.data.data);
      }

      if (newsResponse.data.valid) {
        setNews(newsResponse.data.data);
      }
    } catch (err) {
      console.error('API Error Details:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        config: err.config
      });
      setError('Failed to fetch stock data. Please try again.');
      console.error('Error fetching stock data:', err);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStockData();
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } catch (err) {
      return "";
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col s12 center-align">
          <h4>Stock Research</h4>
          
          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="card-content">
                  <form onSubmit={handleSubmit}>
                    <div className="input-field">
                      <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="Enter stock symbol (e.g., AAPL)"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn waves-effect waves-light"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Search'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="card-panel red lighten-4 red-text text-darken-4">
              {error}
            </div>
          )}

          {price !== null && !error && (
            <div className="row">
              <div className="col s12">
                <div className="card">
                  <div className="card-content">
                    <h5>{symbol} Stock Information</h5>
                    <div className="stock-info">
                      <p><strong>Current Price:</strong> ${price.toFixed(2)}</p>
                    </div>

                    {/* Price History Chart */}
                    {historicalData.length > 0 && (
                      <div className="chart-container" style={{ height: '400px', marginTop: '20px' }}>
                        <h6>30-Day Price History</h6>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              domain={['auto', 'auto']}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              formatter={(value) => ['$' + value.toFixed(2), 'Price']}
                              labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#2196F3" 
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* News Section */}
          {news.length > 0 && (
            <div className="stock-news-section">
              <h3>Latest News for {symbol}</h3>
              <div className="stock-news-grid">
                {news.map((article, index) => (
                  <a 
                    key={index} 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="stock-news-link"
                  >
                    <div className="stock-news-card">
                      {article.image && (
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="stock-news-image" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-news-image.jpg';
                          }}
                        />
                      )}
                      <div className="stock-news-content">
                        <h5 className="stock-news-title">{article.title}</h5>
                        <p className="stock-news-summary">{article.summary}</p>
                        <div className="stock-news-meta">
                          <span className="stock-news-source">{article.source}</span>
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!loading && news.length === 0 && symbol && (
            <div className="no-stock-news">
              <i className="material-icons">article</i>
              <p>No news articles available for {symbol}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(null, {})(StockResearch);