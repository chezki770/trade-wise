import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NewsPage.css";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (dateString) => {
    try {
      // Format: YYYYMMDDTHHMMSS
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(9, 11);
      const minute = dateString.substring(11, 13);
      
      const date = new Date(year, month - 1, day, hour, minute);
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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("Fetching news...");
        const baseURL = process.env.NODE_ENV === 'production' 
          ? '/api/news'
          : 'http://localhost:8080/api/news';

        const response = await axios.get(baseURL);
        console.log("News response:", response.data);

        if (response.data && Array.isArray(response.data.feed)) {
          setNews(response.data.feed);
        } else {
          console.error("Invalid data format:", response.data);
          setError("No news articles available at the moment.");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="news-container">
        <h2>Market News</h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading latest market news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-container">
        <h2>Market News</h2>
        <div className="error-message">
          <i className="material-icons">error_outline</i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="news-container">
        <h2>Market News</h2>
        <div className="no-news">
          <i className="material-icons">inbox</i>
          <p>No news articles available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-container">
      <h2>Market News</h2>
      <div className="news-grid">
        {news.map((article, index) => (
          <div key={index} className="news-card">
            <div className="news-content">
              <div className="news-meta">
                <span className="news-source">{article.source}</span>
                {article.timePublished && (
                  <span className="news-time">{formatDate(article.timePublished)}</span>
                )}
              </div>
              <h3 className="news-title">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h3>
              <p className="news-summary">{article.summary}</p>
            </div>
            {article.sentiment && (
              <div className={`sentiment-badge ${article.sentiment.toLowerCase()}`}>
                {article.sentiment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
