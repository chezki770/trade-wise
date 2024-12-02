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

const StockResearch = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('jwtToken');
    console.log('Current token:', token);
    return token || '';
  };

  const fetchStockData = async () => {
    if (!symbol) return;
    
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
      console.log('Request config:', config);

      const [stockResponse, newsResponse, historyResponse] = await Promise.all([
        axios.get(`/api/stocks/info/${symbol}`, config),
        axios.get(`/api/stocks/news/${symbol}`, config),
        axios.get(`/api/stocks/history/${symbol}`, config)
      ]);
      
      setStockData(stockResponse.data);
      setNews(newsResponse.data);
      setHistoricalData(historyResponse.data);
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
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="card red lighten-4">
              <div className="card-content red-text">
                {error}
              </div>
            </div>
          )}

          {stockData && (
            <div className="row">
              <div className="col s12">
                <div className="card">
                  <div className="card-content">
                    <span className="card-title">{stockData.symbol} Stock Information</span>
                    <div className="row">
                      <div className="col s12 m6">
                        <p><strong>Price:</strong> ${stockData.price}</p>
                        <p>
                          <strong>Change:</strong>
                          <span className={stockData.change >= 0 ? 'green-text' : 'red-text'}>
                            {stockData.change >= 0 ? '+' : ''}{stockData.change}%
                          </span>
                        </p>
                      </div>
                      <div className="col s12 m6">
                        <p><strong>Volume:</strong> {stockData.volume.toLocaleString()}</p>
                        <p><strong>High:</strong> ${stockData.high}</p>
                        <p><strong>Low:</strong> ${stockData.low}</p>
                      </div>
                    </div>

                    {/* Price History Chart */}
                    {historicalData.length > 0 && (
                      <div className="row">
                        <div className="col s12">
                          <h5>30-Day Price History</h5>
                          <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                              <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 12 }}
                                  interval="preserveStartEnd"
                                  angle={-45}
                                  textAnchor="end"
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {news && news.length > 0 && (
            <div className="row">
              <div className="col s12">
                <div className="card">
                  <div className="card-content">
                    <span className="card-title">Company Information & News</span>
                    <div className="news-container">
                      {news.map((item, index) => (
                        item.type === 'overview' ? (
                          // Company Overview
                          <div key={index} className="company-info">
                            <h6>{item.title}</h6>
                            <p className="summary">{item.summary}</p>
                            <div className="metrics">
                              {item.sector && (
                                <div className="metric">
                                  <span className="metric-label">Sector</span>
                                  <span className="metric-value">{item.sector}</span>
                                </div>
                              )}
                              {item.industry && (
                                <div className="metric">
                                  <span className="metric-label">Industry</span>
                                  <span className="metric-value">{item.industry}</span>
                                </div>
                              )}
                              {item.marketCap && (
                                <div className="metric">
                                  <span className="metric-label">Market Cap</span>
                                  <span className="metric-value">
                                    ${(parseInt(item.marketCap) / 1e9).toFixed(2)}B
                                  </span>
                                </div>
                              )}
                              {item.peRatio && (
                                <div className="metric">
                                  <span className="metric-label">P/E Ratio</span>
                                  <span className="metric-value">{parseFloat(item.peRatio).toFixed(2)}</span>
                                </div>
                              )}
                              {item.dividendYield && (
                                <div className="metric">
                                  <span className="metric-label">Dividend Yield</span>
                                  <span className="metric-value">
                                    {(parseFloat(item.dividendYield) * 100).toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // News Article
                          <div key={index} className={`news-item ${item.image_url ? 'has-image' : ''}`}>
                            <div className="news-content">
                              <h6>{item.title}</h6>
                              <div className="meta-info">
                                <span className="source">{item.source}</span>
                                <span>{item.date}</span>
                                {item.sentiment && (
                                  <span className={`sentiment ${item.sentiment.toLowerCase()}`}>
                                    {item.sentiment}
                                  </span>
                                )}
                              </div>
                              <p className="summary">{item.summary}</p>
                              {item.url && (
                                <div className="actions">
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-small waves-effect waves-light"
                                  >
                                    Read Full Article
                                  </a>
                                </div>
                              )}
                            </div>
                            {item.image_url && (
                              <div className="news-image-container">
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="news-image"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/news-placeholder.jpg';
                                    e.target.className = 'news-image fallback';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(null, {})(StockResearch);
