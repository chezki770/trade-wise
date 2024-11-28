import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faGraduationCap, faChartPie, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons';

class Landing extends Component {
    render() {
        return (
            <div className="landing-container">
                <div className="landing-content">
                    <h1 className="landing-title">
                        Welcome to <span>Trade Wise</span>
                    </h1>
                    <p className="landing-subtitle">
                        Master the art of trading with our comprehensive platform. 
                        Practice trading strategies, learn from experts, and build your financial future.
                    </p>
                    
                    <div className="buttons-container">
                        <Link to="/signup" className="landing-btn btn blue">
                            Sign Up
                        </Link>
                        <Link to="/login" className="landing-btn btn">
                            Log In
                        </Link>
                    </div>

                    <div className="features-section">
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faChartLine} className="feature-icon" />
                            <h3 className="feature-title">Real-time Trading</h3>
                            <p className="feature-description">
                                Experience real-time market simulation with live data and authentic trading conditions.
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faGraduationCap} className="feature-icon" />
                            <h3 className="feature-title">Learn & Grow</h3>
                            <p className="feature-description">
                                Access comprehensive educational resources and expert trading insights.
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faChartPie} className="feature-icon" />
                            <h3 className="feature-title">Portfolio Analysis</h3>
                            <p className="feature-description">
                                Track and analyze your portfolio performance with advanced analytics tools.
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <FontAwesomeIcon icon={faHandHoldingDollar} className="feature-icon" />
                            <h3 className="feature-title">Risk-Free Practice</h3>
                            <p className="feature-description">
                                Practice trading strategies without risking real money in a safe environment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Landing;