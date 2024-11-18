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
    {
      question: "Is this project suitable for beginners?",
      answer: "Yes, this project includes educational materials and tools that are beginner-friendly.",
    },
    {
      question: "Are there any costs associated with using this project?",
      answer: "The project is free to use. However, there may be premium features introduced later.",
    },
    {
      question: "Can I simulate trades without real money?",
      answer: "Yes, the project includes a trading simulator to practice without financial risk.",
    },
    {
      question: "How can I track my progress?",
      answer: "You can view detailed reports and analytics on your trades and portfolio performance in the dashboard.",
    },
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <div className="faq-container">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3
              onClick={() => toggleExpand(index)}
              className={`faq-question ${expandedIndex === index ? "active" : ""}`}
            >
              {faq.question}
            </h3>
            <div
              className={`faq-answer ${expandedIndex === index ? "expanded" : ""}`}
            >
              {expandedIndex === index && <p>{faq.answer}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
