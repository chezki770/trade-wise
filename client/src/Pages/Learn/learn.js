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
      />
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
      title: "Stock Market For Beginners 2024",
      description: "A comprehensive guide to understanding the stock market basics in 2024.",
      videoId: "Xn7KWR9EOGM",
    },
    {
      title: "Understanding Stock Market Terms",
      description: "Learn essential stock market terminology and concepts.",
      videoId: "ZCFkWDdmXG8",
    },
    {
      title: "Stock Market Basics for Beginners",
      description: "Master the fundamentals of stock market investing.",
      videoId: "np9jGxjBXYg",
    },
    {
      title: "Stock Market for Beginners Guide",
      description: "Step-by-step guide for new investors in the stock market.",
      videoId: "dD_NmI6dZGs",
    },
  ];

  const fullTradingCourses = [
    {
      title: "How to Start Investing",
      description: "Complete guide on how to start your investment journey.",
      videoId: "gFQNPmLKj1k",
    },
    {
      title: "Professional Trading Course",
      description: "Learn professional trading strategies and techniques.",
      videoId: "TprZXy-lNlE",
    },
    {
      title: "Complete Trading Course",
      description: "Master trading with this comprehensive course.",
      videoId: "y7iVTTH5tOA",
    },
  ];

  const spSection = [
    {
      title: "S&P 500 Explained",
      description: "Understanding the S&P 500 index and its importance.",
      videoId: "dD_NmI6dZGs",
    },
    {
      title: "How to Invest in S&P 500",
      description: "Learn the best strategies for investing in the S&P 500.",
      videoId: "gFQNPmLKj1k",
    },
    {
      title: "S&P 500 Investment Strategy",
      description: "Develop a winning S&P 500 investment strategy.",
      videoId: "TprZXy-lNlE",
    },
    {
      title: "S&P 500 Index Funds",
      description: "Understanding S&P 500 index funds and their benefits.",
      videoId: "y7iVTTH5tOA",
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
        <h2>S&P 500 Trading</h2>
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
