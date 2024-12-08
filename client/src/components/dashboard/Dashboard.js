import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../redux/actions/authActions";
import { buyStock, sellStock } from "../../redux/actions/stockActions";
import TradeModal from './TradeModal';
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
    promptVisible: false,
    promptMessage: "",
  };

  showPrompt = (message) => {
    this.setState({ promptVisible: true, promptMessage: message });
    setTimeout(() => {
      this.setState({ promptVisible: false });
    }, 3000); // Hide the prompt after 3 seconds
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.id]: e.target.value, stockError: "" });
  };

  toggleTradeModal = (tradeType, stock = null) => {
    this.setState({
      showTradeModal: !this.state.showTradeModal,
      tradeType,
      selectedStock: stock,
      stockError: ""
    });
  };
  

  handleLogout = (e) => {
    e.preventDefault();
    this.props.logoutUser(); 
  };

  handleTrade = (tradeInfo) => {
    const { user } = this.props.auth;

    if (this.state.tradeType === "buy") {
      this.props.buyStock(user, tradeInfo);
      this.showPrompt(`Successfully bought ${tradeInfo.quantity} shares of ${tradeInfo.symbol}!`);
    } else {
      this.props.sellStock(user, tradeInfo);
      this.showPrompt(`Successfully sold ${tradeInfo.quantity} shares of ${tradeInfo.symbol}!`);
    }

    this.setState({ showTradeModal: false });
  };

  showPromptMessage = () => {
    const { promptVisible, promptMessage } = this.state;

    return (
      promptVisible && (
        <div className="prompt-message">
          {promptMessage}
        </div>
      )
    );
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

  calculateDailyChangePercent = () => {
    const portfolioValue = this.calculatePortfolioValue();
    const dailyChange = this.calculateDailyChange();
    return portfolioValue === 0 ? 0 : (dailyChange / portfolioValue) * 100;
  };

  renderPortfolioSummary = () => {
    const portfolioValue = this.calculatePortfolioValue();
    const dailyChange = this.calculateDailyChange();
    const dailyChangePercent = this.calculateDailyChangePercent();
    const isPositiveChange = dailyChange >= 0;

    return (
      <div className="row">
        <div className="col s12 m6">
          <div className="summary-card account-balance-card">
            <div className="card-content">
              <span className="card-title">Account Balance</span>
              <h4>${this.props.auth.user.balance?.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col s12 m6">
          <div className="summary-card portfolio-value-card">
            <div className="card-content">
              <span className="card-title">Portfolio Value</span>
              <h4>${portfolioValue.toFixed(2)}</h4>
              <div className={`daily-change ${isPositiveChange ? 'positive' : 'negative'}`}>
                <i className="material-icons daily-change-icon">
                  {isPositiveChange ? 'trending_up' : 'trending_down'}
                </i>
                <span>
                  {isPositiveChange ? '+' : ''}${dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%) Today
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderPortfolioTable = () => {
    const { ownedStocks = [] } = this.props.auth.user;
    const { sortField, sortOrder } = this.state;
  
    return (
      <div className="portfolio-table-container">
        <div className="portfolio-header">
          <h4>Portfolio</h4>
          <div>
            <button
              className="btn red waves-effect waves-light"
              onClick={() => this.toggleTradeModal("sell", null)}
              style={{ marginRight: "10px" }}
            >
              <i className="material-icons left">remove</i>
              Sell Stock
            </button>
            <button
              className="btn green waves-effect waves-light"
              onClick={() => this.toggleTradeModal("buy", null)}
            >
              <i className="material-icons left">add</i>
              Buy New Stock
            </button>
          </div>
        </div>

        {ownedStocks.length === 0 ? (
          <div className="portfolio-empty-state">
            <p>No stocks owned. Click "Buy New Stock" to start trading!</p>
          </div>
        ) : (
          <table className="highlight">
            <thead>
              <tr>
                <th onClick={() => this.handleSort("symbol")}>Symbol</th>
                <th onClick={() => this.handleSort("quantity")}>Quantity</th>
                <th onClick={() => this.handleSort("unit_price")}>Unit Price</th>
                <th onClick={() => this.handleSort("total_value")}>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...ownedStocks].sort((a, b) => {
                if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
                if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
                return 0;
              }).map((stock) => (
                <tr key={stock.symbol}>
                  <td>{stock.symbol}</td>
                  <td>{stock.quantity}</td>
                  <td>${stock.unit_price.toFixed(2)}</td>
                  <td>${(stock.quantity * stock.unit_price).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn red"
                      onClick={() => this.toggleTradeModal("sell", stock)}
                    >
                      Sell
                    </button>
                    <button
                      className="btn light-green"
                      onClick={() => this.toggleTradeModal("buy", stock)}
                    >
                      Buy More
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  render() {
    const { user } = this.props.auth;
    const { promptVisible, promptMessage, showTradeModal, tradeType, selectedStock } = this.state;
  
    return (
      <div className="container">
        <div className="welcome-header">
          <h3>Welcome, {user.name}!</h3>
          <p>We're glad to have you back. Check out your portfolio and start trading!</p>
        </div>
        <div className="row">
          {this.renderPortfolioSummary()}
        </div>
        <div className="row">
          {this.renderPortfolioTable()}
        </div>
        <TradeModal
          show={showTradeModal}
          onClose={() => this.setState({ showTradeModal: false })}
          onTrade={this.handleTrade}
          tradeType={tradeType}
          initialSymbol={selectedStock?.symbol || ''}
          initialQuantity={selectedStock?.quantity || 0}
          userBalance={user.balance}
          ownedStocks={user.ownedStocks || []}
        />
        {promptVisible && (
          <div className="prompt-message">{promptMessage}</div>
        )}
      </div>
    );
  }
}

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  buyStock: PropTypes.func.isRequired,
  sellStock: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { buyStock, sellStock, logoutUser })(Dashboard);
