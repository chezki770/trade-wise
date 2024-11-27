import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { buyStock, sellStock, updateStocks } from "../../actions/stockActions";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: "",
      quantity: "",
      errors: {},
      showTradeModal: false,
      tradeType: "buy", // or "sell"
      selectedStock: null,
      stockError: ""
    };
  }

  componentDidMount() {
    // Update stock prices periodically
    this.updateInterval = setInterval(() => {
      if (this.props.auth.user.ownedStocks?.length > 0) {
        this.props.updateStocks(this.props.auth.user);
      }
    }, 60000); // Update every minute
  }

  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value, stockError: "" });
  };

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  showTradeModal = (type, stock = null) => {
    this.setState({
      showTradeModal: true,
      tradeType: type,
      selectedStock: stock,
      symbol: stock ? stock.symbol : "",
      quantity: "",
      stockError: ""
    });
  };

  hideTradeModal = () => {
    this.setState({
      showTradeModal: false,
      symbol: "",
      quantity: "",
      selectedStock: null,
      stockError: ""
    });
  };

  handleTrade = e => {
    e.preventDefault();
    const { symbol, quantity, tradeType } = this.state;
    const { user } = this.props.auth;

    if (!symbol || !quantity) {
      this.setState({ stockError: "Please fill in all fields" });
      return;
    }

    const tradeInfo = {
      symbol: symbol.toUpperCase(),
      quantity: parseInt(quantity)
    };

    if (tradeType === "buy") {
      this.props.buyStock(user, tradeInfo);
    } else {
      this.props.sellStock(user, tradeInfo);
    }

    this.hideTradeModal();
  };

  calculatePortfolioValue = () => {
    const { ownedStocks = [] } = this.props.auth.user;
    return ownedStocks.reduce((total, stock) => {
      return total + (stock.quantity * stock.unit_price);
    }, 0);
  };

  calculateDailyChange = () => {
    const { ownedStocks = [] } = this.props.auth.user;
    return ownedStocks.reduce((total, stock) => {
      const dailyChange = (stock.unit_price - stock.open_price) * stock.quantity;
      return total + dailyChange;
    }, 0);
  };

  render() {
    const { user } = this.props.auth;
    const { showTradeModal, tradeType, stockError } = this.state;
    const portfolioValue = this.calculatePortfolioValue();
    const dailyChange = this.calculateDailyChange();
    const dailyChangePercent = (dailyChange / (portfolioValue - dailyChange)) * 100;

    return (
      <div className="container">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Welcome back,</b> {user.name}
            </h4>
            
            {/* Portfolio Summary */}
            <div className="row">
              <div className="col s12 m6">
                <div className="card blue-grey darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Account Balance</span>
                    <h4>${user.balance?.toFixed(2)}</h4>
                  </div>
                </div>
              </div>
              <div className="col s12 m6">
                <div className="card blue-grey darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Portfolio Value</span>
                    <h4>${portfolioValue.toFixed(2)}</h4>
                    <p className={dailyChange >= 0 ? "green-text" : "red-text"}>
                      {dailyChange >= 0 ? "+" : ""}{dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%) Today
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Buttons */}
            <div className="row">
              <div className="col s12">
                <button
                  onClick={() => this.showTradeModal("buy")}
                  className="btn waves-effect waves-light blue"
                  style={{ marginRight: "10px" }}
                >
                  Buy Stocks
                </button>
                <button
                  onClick={() => this.showTradeModal("sell")}
                  className="btn waves-effect waves-light red"
                >
                  Sell Stocks
                </button>
              </div>
            </div>

            {/* Portfolio Table */}
            <div className="row">
              <div className="col s12">
                <h5>Your Portfolio</h5>
                <table className="striped">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Shares</th>
                      <th>Avg Price</th>
                      <th>Current Price</th>
                      <th>Total Value</th>
                      <th>Daily Change</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.ownedStocks?.map(stock => {
                      const totalValue = stock.quantity * stock.unit_price;
                      const dailyStockChange = (stock.unit_price - stock.open_price) * stock.quantity;
                      const dailyStockChangePercent = ((stock.unit_price - stock.open_price) / stock.open_price) * 100;

                      return (
                        <tr key={stock.symbol}>
                          <td>{stock.symbol}</td>
                          <td>{stock.quantity}</td>
                          <td>${stock.unit_price.toFixed(2)}</td>
                          <td>${stock.unit_price.toFixed(2)}</td>
                          <td>${totalValue.toFixed(2)}</td>
                          <td className={dailyStockChange >= 0 ? "green-text" : "red-text"}>
                            {dailyStockChange >= 0 ? "+" : ""}{dailyStockChange.toFixed(2)}
                            <br />
                            ({dailyStockChangePercent.toFixed(2)}%)
                          </td>
                          <td>
                            <button
                              onClick={() => this.showTradeModal("sell", stock)}
                              className="btn-small waves-effect waves-light red"
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trade Modal */}
            {showTradeModal && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', width: '80%', maxWidth: '500px', margin: '100px auto', padding: '20px', borderRadius: '4px' }}>
                  <h5>{tradeType === "buy" ? "Buy Stocks" : "Sell Stocks"}</h5>
                  <form noValidate onSubmit={this.handleTrade}>
                    <div className="input-field">
                      <input
                        onChange={this.onChange}
                        value={this.state.symbol}
                        id="symbol"
                        type="text"
                        disabled={!!this.state.selectedStock}
                      />
                      <label htmlFor="symbol" className={this.state.symbol ? "active" : ""}>Stock Symbol</label>
                    </div>
                    <div className="input-field">
                      <input
                        onChange={this.onChange}
                        value={this.state.quantity}
                        id="quantity"
                        type="number"
                      />
                      <label htmlFor="quantity" className={this.state.quantity ? "active" : ""}>Quantity</label>
                    </div>
                    {stockError && <div className="red-text">{stockError}</div>}
                    <div className="modal-footer" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={this.hideTradeModal}
                        className="btn-flat waves-effect"
                        style={{ marginRight: '10px' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`btn waves-effect waves-light ${tradeType === "buy" ? "blue" : "red"}`}
                      >
                        {tradeType === "buy" ? "Buy" : "Sell"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  buyStock: PropTypes.func.isRequired,
  sellStock: PropTypes.func.isRequired,
  updateStocks: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser, buyStock, sellStock, updateStocks }
)(Dashboard);
=======
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

