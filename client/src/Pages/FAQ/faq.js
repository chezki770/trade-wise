import React, { useState } from "react";
import "./styles.css";

const FAQ = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: "What is Trade-Wise?",
      answer: "Trade-Wise is a comprehensive trading education platform that helps users learn about stock market trading, portfolio management, and investment strategies. We provide curated video courses, real-time market data, and portfolio tracking tools."
    },
    {
      question: "How do I get started with trading?",
      answer: "Start by visiting our Learning Center, which offers structured courses from basic to advanced levels. Begin with the 'Stock Market Basics' section to understand fundamental concepts, then progress to more advanced topics like technical analysis and S&P 500 trading strategies."
    },
    {
      question: "What educational resources are available?",
      answer: "We offer three main educational sections: 1) Stock Market Basics - covering fundamental concepts, 2) Full Trading Courses - comprehensive trading strategies, and 3) S&P 500 - specific guidance on index investing. Each section includes carefully curated video content from expert traders."
    },
    {
      question: "Is Trade-Wise suitable for beginners?",
      answer: "Absolutely! We've designed our platform with beginners in mind. Our Stock Market Basics section provides step-by-step guidance, and our interface is user-friendly. We also offer a risk-free paper trading feature to practice without using real money."
    },
    {
      question: "How can I track my portfolio performance?",
      answer: "Trade-Wise provides a comprehensive dashboard where you can monitor your portfolio performance, track individual stocks, and analyze your trading history. You can view detailed charts, performance metrics, and set up custom alerts."
    },
    {
      question: "What market data and analysis tools are available?",
      answer: "We provide real-time market data, stock charts, technical indicators, and news updates. Our platform includes tools for technical analysis, fundamental research, and portfolio analytics to help you make informed trading decisions."
    },
    {
      question: "How do I practice trading without risk?",
      answer: "Use our paper trading feature to practice with virtual money in real market conditions. This allows you to test strategies, learn from mistakes, and gain confidence before trading with real funds."
    },
    {
      question: "What are the key features of Trade-Wise?",
      answer: "Key features include: Educational video library, Real-time market data, Portfolio tracking, Paper trading simulator, Technical analysis tools, Market news updates, and Performance analytics."
    },
    {
      question: "How often is the educational content updated?",
      answer: "We regularly update our educational content to reflect current market conditions and trading strategies. Our video library is continuously expanded with new content from expert traders and market analysts."
    },
    {
      question: "Is there a mobile version available?",
      answer: "Yes, Trade-Wise is fully responsive and works on all devices. You can access all features, including educational content and portfolio tracking, from your smartphone or tablet."
    }
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <div className="faq-container">
      <header className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about Trade-Wise and trading</p>
      </header>
      
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${expandedIndex === index ? "active" : ""}`}
          >
            <div
              className="faq-question"
              onClick={() => toggleExpand(index)}
            >
              <h3>{faq.question}</h3>
              <span className="faq-icon">{expandedIndex === index ? "−" : "+"}</span>
            </div>
            <div
              className={`faq-answer ${expandedIndex === index ? "expanded" : ""}`}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
