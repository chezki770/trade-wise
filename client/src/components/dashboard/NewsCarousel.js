import React, { useEffect, useState } from "react";
import Slider from "react-slick"; // Assuming react-slick is used for carousel

const NewsCarousel = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news"); // Adjust API endpoint as needed
        const data = await response.json();
        console.log("News Data Fetched:", data);
        if (data.feed) {
          setNews(data.feed);
        } else {
          console.error("Unexpected API response structure:", data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  return news.length > 0 ? (
    <Slider>
      {news.map((article, index) => (
        <div key={index}>
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read More
          </a>
        </div>
      ))}
    </Slider>
  ) : (
    <p>No news available</p>
  );
};

export default NewsCarousel;
