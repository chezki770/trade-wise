import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import './StockResearch.css';

const StockResearch = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStockData = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError('');
    try {
      const stockResponse = await axios.get(`/api/stocks/info/${symbol}`);
      const newsResponse = await axios.get(`/api/stocks/news/${symbol}`);
      
      setStockData(stockResponse.data);
      setNews(newsResponse.data);
    } catch (err) {
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {news.length > 0 && (
            <div className="row">
              <div className="col s12">
                <h5>Latest News</h5>
                {news.map((article, index) => (
                  <div className="card" key={index}>
                    <div className="card-content">
                      <span className="card-title">{article.title}</span>
                      <p className="grey-text">{article.date}</p>
                      <p>{article.summary}</p>
                      <div className="card-action">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="blue-text"
                        >
                          Read More
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(null, {})(StockResearch);
