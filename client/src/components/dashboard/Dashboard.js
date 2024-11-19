import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { connect } from "react-redux";
import NewsCarousel from "./NewsCarousel";
import { logoutUser } from "../../actions/authActions";
import { buyStock, sellStock, updateStocks } from "../../actions/stockActions";

function HeldStock({ symbol, shares, currentValue, openValue }) {
  let performanceColor = "";
  if (currentValue > openValue) performanceColor = "green";
  else if (currentValue < openValue) performanceColor = "red";
  else performanceColor = "grey";

  return (
    <li style={{ color: performanceColor }}>
      {symbol} - {shares} shares (${currentValue * shares})
    </li>
  );
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: "",
      quantity: "",
      balance: this.props.auth.user.balance,
      portfolio: this.props.auth.user.ownedStocks,
      errors: {},
    };
  }

  componentDidMount() {
    const { user } = this.props.auth;
    this.setState({
      balance: user.balance,
      portfolio: user.ownedStocks,
    });
  }

  onLogoutClick = (e) => {
    e.preventDefault();
    this.props.logoutUser();
  };

  onUpdateClick = (e) => {
    e.preventDefault();

    let user = this.props.stock.user.data || this.props.auth.user;

    this.props.updateStocks(user);
    const result = this.props.stock.user.data;
    if (result) {
      this.props.auth.user = result;
      this.setState({
        portfolio: result.ownedStocks,
      });
    }
  };

  processRequest = async (user, tradeRequest, stockRequest) => {
    return new Promise((resolve) => {
      const result = stockRequest(user, tradeRequest);
      setTimeout(() => resolve(result), 5000);
    });
  };

  onBuyClick = async (e) => {
    e.preventDefault();

    const tradeRequest = {
      symbol: this.state.symbol,
      quantity: this.state.quantity,
    };
    const user = this.props.stock.user.data || this.props.auth.user;

    await this.processRequest(user, tradeRequest, this.props.buyStock);
    const result = this.props.stock.user.data;
    if (result) {
      this.props.auth.user = result;
      this.setState({
        balance: result.balance,
        portfolio: result.ownedStocks,
      });
    }
  };

  onSellClick = async (e) => {
    e.preventDefault();

    const tradeRequest = {
      symbol: this.state.symbol,
      quantity: this.state.quantity,
    };
    const user = this.props.stock.user.data || this.props.auth.user;

    await this.processRequest(user, tradeRequest, this.props.sellStock);
    const result = this.props.stock.user.data;
    if (result) {
      this.props.auth.user = result;
      this.setState({
        balance: result.balance,
        portfolio: result.ownedStocks,
      });
    }
  };

  onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  render() {
    const { errors, balance, portfolio } = this.state;
    let portfolioSum = 0;

    const portfolioList =
      portfolio?.length > 0
        ? portfolio.map((stock, ii) => {
            portfolioSum += stock.quantity * stock.unit_price;
            return (
              <HeldStock
                symbol={stock.symbol}
                shares={stock.quantity}
                currentValue={stock.unit_price}
                openValue={stock.open_price}
                key={ii}
              />
            );
          })
        : "No stocks owned yet.";

    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row">
          <div className="col s6 center-align">
            <h4>
              <b>Portfolio (${portfolioSum})</b>
            </h4>
            <ul>{portfolioList}</ul>
          </div>
          <div className="col s6 center-align">
            <h4>Cash: (${balance})</h4>
            <input
              onChange={this.onChange}
              value={this.state.symbol}
              error={errors.symbol}
              id="symbol"
              type="text"
              placeholder="Ticker Symbol"
              className={classnames("", {
                invalid: errors.symbol,
              })}
            />
            <input
              onChange={this.onChange}
              value={this.state.quantity}
              error={errors.quantity}
              id="quantity"
              type="text"
              placeholder="Quantity"
              className={classnames("", {
                invalid: errors.quantity,
              })}
            />
            <button onClick={this.onBuyClick} className="btn gray accent-3">
              Buy
            </button>
            <button onClick={this.onSellClick} className="btn gray accent-3">
              Sell
            </button>
            <button onClick={this.onUpdateClick} className="btn gray accent-3">
              Update Prices
            </button>
            <button onClick={this.onLogoutClick} className="btn gray accent-3">
              Logout
            </button>
          </div>
        </div>
        <NewsCarousel />
      </div>
    );  
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  buyStock: PropTypes.func.isRequired,
  sellStock: PropTypes.func.isRequired,
  updateStocks: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  stock: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  stock: state.stock,
});

export default connect(mapStateToProps, {
  logoutUser,
  buyStock,
  sellStock,
  updateStocks,
})(Dashboard);
