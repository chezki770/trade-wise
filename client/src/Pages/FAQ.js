import React, { useState } from "react";
import "./FAQ.css";

const FAQ = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: "What is this project about?",
      answer: "This project helps users learn about stock trading and portfolio management.",
    },
    {
      question: "How do I get started?",
      answer: "To get started, create an account and explore the features available in your dashboard.",
    },
    {
      question: "What features are available?",
      answer: "You can manage your portfolio, track your transactions, and view educational content.",
    },
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <div>
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 onClick={() => toggleExpand(index)} style={{ cursor: "pointer" }}>
              {faq.question}
            </h3>
            {expandedIndex === index && <p>{faq.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
