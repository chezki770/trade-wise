import React from "react";
import "./style.css";

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Our Project</h1>
      <p className="about-paragraph">
        Welcome to our <strong>Stock Market Simulator</strong>! Our project is designed to help users
        learn and practice stock trading in a risk-free environment. Whether you're a beginner looking
        to understand the basics or an experienced trader honing your skills, this simulator offers a
        realistic and engaging way to explore the complexities of stock markets.
      </p>
      <p className="about-paragraph">
        Our mission is to empower users by providing educational tools, market data, and portfolio management
        features, making the learning process both fun and informative. Dive into the world of investments,
        explore strategies, and build your confidence with our easy-to-use platform.
      </p>
      <p className="about-quote">
        "Practice makes perfect—start your journey to financial literacy today!"
      </p>
    </div>
  );
};

export default About;
