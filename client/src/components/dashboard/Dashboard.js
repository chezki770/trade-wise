import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { useHistory } from "react-router-dom";

const HeldStock = ({ symbol, shares, currentValue, openValue }) => {
  const performanceColor =
    currentValue > openValue ? "green" : currentValue < openValue ? "red" : "grey";

  return (
    <li style={{ color: performanceColor }}>
      {symbol} - {shares} shares (${currentValue * shares})
    </li>
  );
};

const Dashboard = ({ auth, logoutUser }) => {
  const history = useHistory();
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [portfolio] = useState([]); // Just keep portfolio as state without setter
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome message with a slight delay for the animation
    setTimeout(() => setShowWelcome(true), 100);

    // If user is not authenticated, redirect to login
    if (!auth.isAuthenticated) {
      history.push("/login");
    }
  }, [auth.isAuthenticated, history]);

  const onLogoutClick = (e) => {
    e.preventDefault();
    logoutUser();
  };

  const onUpdateClick = async (e) => {
    e.preventDefault();
    // Example: fetch stock data and update the portfolio
    // await dispatch(updateStocks(user));
    // setPortfolio(updatedUser.ownedStocks || []); // Update portfolio after action
  };

  const handleBuyClick = async (e) => {
    e.preventDefault();
    // Handle buying stock here
    // Example: await dispatch(buyStock(tradeRequest));
  };

  const handleSellClick = async (e) => {
    e.preventDefault();
    // Handle selling stock here
    // Example: await dispatch(sellStock(tradeRequest));
  };

  const portfolioList = portfolio.length
    ? portfolio.map((stock, index) => (
        <HeldStock
          symbol={stock.symbol}
          shares={stock.quantity}
          currentValue={stock.unit_price}
          openValue={stock.open_price}
          key={index}
        />
      ))
    : "No stocks owned yet.";

  const portfolioSum = portfolio.reduce(
    (sum, stock) => sum + stock.quantity * stock.unit_price,
    0
  );

  return (
    <div className="container">
      {/* Welcome Message */}
      <div className="row" style={{ marginTop: "2rem" }}>
        <div className="col s12 center-align">
          <div 
            className="card-panel teal lighten-2 white-text"
            style={{
              transform: `translateY(${showWelcome ? '0' : '-100px'})`,
              opacity: showWelcome ? 1 : 0,
              transition: 'all 0.5s ease-out'
            }}
          >
            <h4>Welcome, {auth.user ? auth.user.name : "Trader"}! 👋</h4>
            <p>Track your portfolio and trade stocks in real-time</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="row">
        <div className="col s12 center-align">
          <button
            onClick={onUpdateClick}
            className="btn waves-effect waves-light blue"
            style={{ marginRight: "10px" }}
          >
            <i className="material-icons left">refresh</i>
            refresh
          </button>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="row">
        <div className="col s6 center-align">
          <div className="card">
            <div className="card-content">
              <span className="card-title">
                <b>Portfolio (${portfolioSum.toFixed(2)})</b>
              </span>
              <ul className="collection">{portfolioList}</ul>
            </div>
          </div>
        </div>

        {/* Trading Section */}
        <div className="col s6 center-align">
          <div className="card">
            <div className="card-content">
              <span className="card-title">
                <b>Trading</b>
              </span>
              <h6>Cash Balance: ${0}</h6>
              <div className="input-field">
                <input
                  onChange={(e) => setSymbol(e.target.value)}
                  value={symbol}
                  id="symbol"
                  type="text"
                  className="validate"
                />
                <label htmlFor="symbol">Ticker Symbol</label>
              </div>
              <div className="input-field">
                <input
                  onChange={(e) => setQuantity(e.target.value)}
                  value={quantity}
                  id="quantity"
                  type="text"
                  className="validate"
                />
                <label htmlFor="quantity">Quantity</label>
              </div>
              <div className="card-action">
                <button
                  onClick={handleBuyClick}
                  className="btn waves-effect waves-light green"
                  style={{ marginRight: "10px" }}
                >
                  <i className="material-icons left">add_circle</i>
                  Buy
                </button>
                <button
                  onClick={handleSellClick}
                  className="btn waves-effect waves-light red"
                >
                  <i className="material-icons left">remove_circle</i>
                  Sell
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(Dashboard);
