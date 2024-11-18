// src/Pages/FAQ.js
import React from "react";

const FAQ = () => {
  return (
    <div>
      <h1>Frequently Asked Questions</h1>
      <div className="faq-item">
        <h3>What is this project about?</h3>
        <p>This project helps users learn about stock trading and portfolio management.</p>
      </div>
      <div className="faq-item">
        <h3>How do I get started?</h3>
        <p>To get started, create an account and explore the features available in your dashboard.</p>
      </div>
      <div className="faq-item">
        <h3>What features are available?</h3>
        <p>You can manage your portfolio, track your transactions, and view educational content.</p>
      </div>
      {/* Add more questions and answers as needed */}
    </div>
  );
};

export default FAQ;
