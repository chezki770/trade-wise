import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./styles.css";

const VideoCard = ({ title, description, videoId }) => (
  <div className="video-card">
    <div className="video-container">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
    <div className="video-info">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

const Learn = () => {
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const stockMarketBasics = [
    {
      title: "Stock Market for Beginners",
      description: "A comprehensive guide to understanding the stock market basics.",
      videoId: "Xn7KWR9EOGQ",
    },
    {
      title: "How The Stock Market Works",
      description: "Learn essential stock market terminology and concepts.",
      videoId: "ZCFkWDdmXG8",
    },
    {
      title: "Stock Market Fundamentals",
      description: "Understanding the fundamentals of stock market investing.",
      videoId: "qhHOmZVAqBE",
    },
    {
      title: "Getting Started with Stocks",
      description: "Step-by-step guide for new investors in the stock market.",
      videoId: "7SxPS1Zy9-Y",
    },
  ];

  const fullTradingCourses = [
    {
      title: "Technical Analysis Basics",
      description: "Complete guide to technical analysis and chart patterns.",
      videoId: "eynxyoKgpng",
    },
    {
      title: "Advanced Trading Strategies",
      description: "Learn advanced trading strategies and techniques.",
      videoId: "CAHAl3kN4EE",
    },
    {
      title: "Trading Psychology Essentials",
      description: "Master the psychology of trading and investing.",
      videoId: "WY1wV_NIRtw",
    },
  ];

  const spSection = [
    {
      title: "Understanding the S&P 500",
      description: "Understanding the S&P 500 index and its importance.",
      videoId: "p7HKvqRI_Bo",
    },
    {
      title: "S&P 500 Investment Strategies",
      description: "Learn the best strategies for investing in the S&P 500.",
      videoId: "HYsqKUQ6yKk",
    },
    {
      title: "Mastering S&P 500 Investing",
      description: "Complete guide to investing in S&P 500.",
      videoId: "fwe-PjrX23o",
    },
  ];

  return (
    <div className="learn-container">
      <div className="hero-section">
        <h1>Learn Trading</h1>
        <p>Master the art of trading with our curated educational resources</p>
      </div>

      <section className="video-section">
        <h2>Stock Market Basics</h2>
        <Slider {...sliderSettings}>
          {stockMarketBasics.map((video, index) => (
            <VideoCard key={index} {...video} />
          ))}
        </Slider>
      </section>

      <section className="video-section">
        <h2>Full Trading Courses</h2>
        <Slider {...sliderSettings}>
          {fullTradingCourses.map((video, index) => (
            <VideoCard key={index} {...video} />
          ))}
        </Slider>
      </section>

      <section className="video-section">
        <h2>S&P 500 Guide</h2>
        <Slider {...sliderSettings}>
          {spSection.map((video, index) => (
            <VideoCard key={index} {...video} />
          ))}
        </Slider>
      </section>

      <section className="additional-resources">
        <h2>Additional Resources</h2>
        <div className="resources-grid">
          <div className="resource-card">
            <h3>Trading Books</h3>
            <p>Explore our recommended reading list for traders.</p>
          </div>
          <div className="resource-card">
            <h3>Market Analysis</h3>
            <p>Learn how to analyze market trends and patterns.</p>
          </div>
          <div className="resource-card">
            <h3>Trading Tools</h3>
            <p>Discover essential tools for successful trading.</p>
          </div>
          <div className="resource-card">
            <h3>Community</h3>
            <p>Join our trading community and learn from others.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Learn;
