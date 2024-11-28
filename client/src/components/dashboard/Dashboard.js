import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../redux/actions/authActions";
import { buyStock, sellStock } from "../../redux/actions/stockActions";
import "./Dashboard.css";

class Dashboard extends Component {
  state = {
    symbol: "",
    quantity: "",
    errors: {},
    showTradeModal: false,
    tradeType: "buy", // or "sell"
    selectedStock: null,
    stockError: "",
    sortField: "symbol", // Default sort by symbol
    sortOrder: "asc", // Default ascending order
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.id]: e.target.value, stockError: "" });
  };

  toggleTradeModal = (type, stock = null) => {
    this.setState((prevState) => ({
      showTradeModal: !prevState.showTradeModal,
      tradeType: type || prevState.tradeType,
      selectedStock: stock || null,
      symbol: stock ? stock.symbol : "",
      quantity: "",
      stockError: "",
    }));
  };

  handleLogout = (e) => {
    e.preventDefault();
    this.props.logoutUser();
  };

  handleTrade = (e) => {
    e.preventDefault();
    const { symbol, quantity, tradeType } = this.state;
    const { user } = this.props.auth;

    if (!symbol || !quantity) {
      this.setState({ stockError: "Please fill in all fields" });
      return;
    }

    const tradeInfo = {
      symbol: symbol.toUpperCase(),
      quantity: parseInt(quantity),
    };

    if (tradeType === "buy") {
      this.props.buyStock(user, tradeInfo);
    } else {
      this.props.sellStock(user, tradeInfo);
    }

    this.toggleTradeModal();
  };

  handleSort = (field) => {
    this.setState((prevState) => ({
      sortField: field,
      sortOrder: prevState.sortField === field && prevState.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  calculatePortfolioValue = () => {
    const { ownedStocks = [] } = this.props.auth.user;
    return ownedStocks.reduce((total, stock) => total + stock.quantity * stock.unit_price, 0);
  };

  calculateDailyChange = () => {
    const { ownedStocks = [] } = this.props.auth.user;
    return ownedStocks.reduce((total, stock) => {
      return total + (stock.unit_price - stock.open_price) * stock.quantity;
    }, 0);
  };

  renderPortfolioSummary = () => {
    const portfolioValue = this.calculatePortfolioValue();
    const dailyChange = this.calculateDailyChange();
    const dailyChangePercent = (dailyChange / (portfolioValue - dailyChange)) * 100;

    return (
      <div className="row">
        <div className="col s12 m6">
          <div className="card blue-grey darken-1">
            <div className="card-content white-text">
              <span className="card-title">Account Balance</span>
              <h4>${this.props.auth.user.balance?.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col s12 m6">
          <div className="card blue-grey darken-1">
            <div className="card-content white-text">
              <span className="card-title">Portfolio Value</span>
              <h4>${portfolioValue.toFixed(2)}</h4>
              <p className={dailyChange >= 0 ? "green-text" : "red-text"}>
                {dailyChange >= 0 ? "+" : ""}
                {dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%) Today
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderPortfolioTable = () => {
    const { ownedStocks = [] } = this.props.auth.user;
    const { sortField, sortOrder } = this.state;

    const sortedStocks = [...ownedStocks].sort((a, b) => {
      const fieldA = sortField === "totalValue" ? a.quantity * a.unit_price : a[sortField];
      const fieldB = sortField === "totalValue" ? b.quantity * b.unit_price : b[sortField];

      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return (
      <div className="row">
        <div className="col s12">
          <h5>Your Portfolio</h5>
          <div className="row">
            <div className="col s12 m6">
              <label>Sort By</label>
              <select
                className="browser-default"
                onChange={(e) => this.handleSort(e.target.value)}
                value={this.state.sortField}
              >
                <option value="symbol">Symbol</option>
                <option value="quantity">Shares</option>
                <option value="unit_price">Unit Price</option>
                <option value="totalValue">Total Value</option>
              </select>
            </div>
          </div>
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
              {sortedStocks.map((stock) => {
                const totalValue = stock.quantity * stock.unit_price;
                const dailyStockChange = (stock.unit_price - stock.open_price) * stock.quantity;
                const dailyStockChangePercent =
                  ((stock.unit_price - stock.open_price) / stock.open_price) * 100;

                return (
                  <tr key={stock.symbol}>
                    <td>{stock.symbol}</td>
                    <td>{stock.quantity}</td>
                    <td>${stock.unit_price.toFixed(2)}</td>
                    <td>${stock.unit_price.toFixed(2)}</td>
                    <td>${totalValue.toFixed(2)}</td>
                    <td className={dailyStockChange >= 0 ? "green-text" : "red-text"}>
                      {dailyStockChange >= 0 ? "+" : ""}
                      {dailyStockChange.toFixed(2)}
                      <br />
                      ({dailyStockChangePercent.toFixed(2)}%)}
                    </td>
                    <td>
                      <button
                        onClick={() => this.toggleTradeModal("sell", stock)}
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
    );
  };

  renderTradeModal = () => {
    const { tradeType, stockError, symbol, quantity, selectedStock } = this.state;

    if (!this.state.showTradeModal) return null;

    return (
      <div
        className="modal"
        style={{
          display: "block",
          backgroundColor: "rgba(0,0,0,0.5)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "white",
            width: "80%",
            maxWidth: "500px",
            margin: "100px auto",
            padding: "20px",
            borderRadius: "4px",
          }}
        >
          <h5>{tradeType === "buy" ? "Buy Stocks" : "Sell Stocks"}</h5>
          <form noValidate onSubmit={this.handleTrade}>
            <div className="input-field">
              <input
                onChange={this.handleInputChange}
                value={symbol}
                id="symbol"
                type="text"
                disabled={!!selectedStock}
              />
              <label htmlFor="symbol" className={symbol ? "active" : ""}>
                Stock Symbol
              </label>
            </div>
            <div className="input-field">
              <input
                onChange={this.handleInputChange}
                value={quantity}
                id="quantity"
                type="number"
              />
              <label htmlFor="quantity" className={quantity ? "active" : ""}>
                Quantity
              </label>
            </div>
            {stockError && <div className="red-text">{stockError}</div>}
            <div className="modal-footer" style={{ marginTop: "20px" }}>
              <button
                type="button"
                onClick={this.toggleTradeModal}
                className="btn-flat waves-effect"
                style={{ marginRight: "10px" }}
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
    );
  };

  componentDidUpdate(prevProps) {
    // Check if the user's stocks have been updated
    if (this.props.auth.user.ownedStocks !== prevProps.auth.user.ownedStocks) {
      // Force a re-render of the table
      this.forceUpdate();
    }
  }

  render() {
    const { user } = this.props.auth;

    return (
      <div className="container">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Welcome back,</b> {user.name}
            </h4>

            {this.renderPortfolioSummary()}

            {/* Trade Buttons */}
            <div className="row">
              <div className="col s12">
                <button
                  onClick={() => this.toggleTradeModal("buy")}
                  className="btn waves-effect waves-light blue"
                  style={{ marginRight: "10px" }}
                >
                  Buy Stocks
                </button>
                <button
                  onClick={() => this.toggleTradeModal("sell")}
                  className="btn waves-effect waves-light red"
                >
                  Sell Stocks
                </button>
              </div>
            </div>

            {this.renderPortfolioTable()}

            {this.renderTradeModal()}
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
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser, buyStock, sellStock })(Dashboard);
