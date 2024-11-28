import React from 'react';
import './Footer.css';

const Footer = () => {
  const socialLinks = [
    {
      name: 'LinkedIn - Ariel',
      url: 'https://www.linkedin.com/in/ariel-zeberg-81044a29b/',
      icon: 'fab fa-linkedin'
    },
    {
      name: 'GitHub - Ariel',
      url: 'https://github.com/ArielZeberg',
      icon: 'fab fa-github'
    },
    {
      name: 'LinkedIn - Yehezkel',
      url: 'https://www.linkedin.com/in/yehezkel-markovitch/',
      icon: 'fab fa-linkedin'
    },
    {
      name: 'GitHub - Yehezkel',
      url: 'https://github.com/chezki770',
      icon: 'fab fa-github'
    }
  ];

  const groupedLinks = socialLinks.reduce((acc, link) => {
    const person = link.name.split(' - ')[1];
    if (!acc[person]) {
      acc[person] = [];
    }
    acc[person].push(link);
    return acc;
  }, {});

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="contact-section">
          <h2 className="section-title">Get in Touch</h2>
          <p className="contact-text">
            Have questions or suggestions? We'd love to hear from you!
          </p>
        </div>
        <div className="developers-links">
          {Object.entries(groupedLinks).map(([person, links]) => (
            <div key={person} className="developer-section">
              <h3 className="developer-name">{person}</h3>
              <div className="social-links">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    title={link.name}
                  >
                    <i className={link.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="footer-text"> {new Date().getFullYear()} Trade-Wise. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
