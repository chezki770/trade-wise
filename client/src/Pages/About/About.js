import React from "react";
import Footer from "../../components/layout/Footer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./style.css";

const CustomArrow = ({ direction, onClick }) => (
  <button
    className={`custom-arrow ${direction}-arrow`}
    onClick={onClick}
    aria-label={`${direction} slide`}
  >
    <i className="material-icons">
      {direction === 'prev' ? 'arrow_back_ios' : 'arrow_forward_ios'}
    </i>
  </button>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <i className="material-icons feature-icon">{icon}</i>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

const About = () => {
  const features = [
    {
      icon: "show_chart",
      title: "Real-Time Trading",
      description: "Experience real-time market data and trading simulations with virtual currency."
    },
    {
      icon: "trending_up",
      title: "Portfolio Tracking",
      description: "Monitor your investments and track your performance over time."
    },
    {
      icon: "article",
      title: "Market News",
      description: "Stay informed with the latest market news and sentiment analysis."
    },
    {
      icon: "school",
      title: "Learning Resources",
      description: "Access educational materials and trading guides to improve your skills."
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="about-title">Welcome to Trade-Wise</h1>
          <p className="hero-subtitle">Your Gateway to Smart Trading</p>
          <div className="hero-description">
            <p>
              Trade-Wise is more than just a stock market simulator—it's your personal
              trading companion. We combine real-time market data, educational resources,
              and powerful tools to help you become a confident investor.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="section-title">What We Offer</h2>
          <div className="features-grid">
            <Slider {...sliderSettings}>
              {features.map((feature, index) => (
                <div key={index} className="carousel-slide">
                  <FeatureCard {...feature} />
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Mission Section */}
        <section className="mission-section">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <div className="mission-text">
              <p>
                We believe that financial literacy should be accessible to everyone.
                Our mission is to democratize stock market education by providing a
                risk-free environment where users can learn, practice, and master
                trading strategies.
              </p>
              <blockquote className="mission-quote">
                "Empowering the next generation of informed investors through
                hands-on learning and real-world market experience."
              </blockquote>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;
