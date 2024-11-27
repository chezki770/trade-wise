// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import classnames from "classnames";
// import { connect } from "react-redux";

// import { logoutUser } from  "../../actions/authActions";
// import { buyStock, sellStock, updateStocks } from "../../actions/stockActions";

// function HeldStock({ symbol, shares, currentValue, openValue }) {
//   let performanceColor = "";
//   if(currentValue > openValue) performanceColor = "green";
//   else if (currentValue < openValue) performanceColor = "red";
//   else performanceColor = "grey";

//   return (
//     <li style={{ color: performanceColor }}>{symbol} - {shares} shares ({currentValue*shares})</li>
//   );
// }

// class Dashboard extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             symbol: "",
//             quantity: "",
//             balance: this.props.auth.user.balance,
//             portfolio: this.props.auth.user.ownedStocks,
//             errors: {}
//         };
//     }

//     componentDidMount() {
//       const { user } = this.props.auth;
//       this.setState({
//         balance: user.balance,
//         portfolio: user.ownedStocks
//       });
//     }

//     onLogoutClick = e => {
//         e.preventDefault();
//         this.props.logoutUser();
//     };

//     // onUpdateClick = e => {
//     //   e.preventDefault();

//     //   let user = "";
//     //   if(!this.props.stock.user.data) { user = this.props.auth.user; }
//     //   else { user = this.props.stock.user.data; }

//     //   this.props.updateStocks(user);
//     //   let result = this.props.stock.user.data;
//     //   if(result) {
//     //     this.props.auth.user = result;
//     //     this.setState({
//     //       portfolio: result.ownedStocks
//     //     });
//     //   }
//     // }

//     onUpdateClick = (e) => {
//       e.preventDefault();
    
//       console.log("onUpdateClick triggered"); // Log the start of the function
    
//       let user = "";
//       if (!this.props.stock.user.data) {
//         user = this.props.auth.user;
//         console.log("No stock user data found. Using auth user:", user); // Log fallback case
//       } else {
//         user = this.props.stock.user.data;
//         console.log("Stock user data found:", user); // Log when stock user data exists
//       }
    
//       this.props.updateStocks(user);
//       console.log("updateStocks called with user:", user); // Log the call to updateStocks
    
//       let result = this.props.stock.user.data;
//       console.log("Result from stock user data:", result); // Log the result from stock.user.data
    
//       if (result) {
//         console.log("Result exists. Updating auth user and state."); // Log if result exists
//         this.props.auth.user = result;
    
//         this.setState({
//           portfolio: result.ownedStocks,
//         }, () => {
//           console.log("State updated. New portfolio:", this.state.portfolio); // Log after state update
//         });
//       } else {
//         console.log("No result found. State unchanged."); // Log if no result
//       }
//     };
    

//     processRequest = async (user, tradeRequest, stockRequest) => {
//       return new Promise((resolve, reject) => {
//         let result = stockRequest(user, tradeRequest);
//         setTimeout(function() {
//           resolve(result);
//         }, 5000);
//       }).then(result => {
//         return result;
//       });
//     };

//     onBuyClick = async e => {
//       e.preventDefault();

//       let tradeRequest = {
//           symbol: this.state.symbol,
//           quantity: this.state.quantity 
//       };
//       let user = "";
//       if(!this.props.stock.user.data) { user = this.props.auth.user; }
//       else { user = this.props.stock.user.data; }

//       await this.processRequest(user, tradeRequest, this.props.buyStock);
//       let result = this.props.stock.user.data;
//       if(result) {
//         this.props.auth.user = result;
//         this.setState({
//           balance: result.balance,
//           portfolio: result.ownedStocks,
//         });
//       }
//     }

//     onSellClick = async e => {
//       e.preventDefault();

//       let tradeRequest = {
//         symbol: this.state.symbol,
//         quantity: this.state.quantity 
//       };

//       let user = "";
//       if(!this.props.stock.user.data) { user = this.props.auth.user; }
//       else { user = this.props.stock.user.data; }

//       await this.processRequest(user, tradeRequest, this.props.sellStock);
//       let result = this.props.stock.user.data;
//       if(result) {
//         this.props.auth.user = result;
//         this.setState({
//           balance: result.balance,
//           portfolio: result.ownedStocks,
//         });
//       }
//     }

//     onChange = e => {
//       this.setState({ [e.target.id]: e.target.value });
//     };

//     render() {
//         const { errors } = this.state;
//         let portfolio = undefined;
//         let portfolioSum = 0;
//         if(this.state.portfolio != null) {
//           portfolio = this.state.portfolio.map((stock, ii) => {
//             portfolioSum += stock.quantity*stock.unit_price;
//             return(
//               <HeldStock 
//                 symbol={stock.symbol}
//                 shares={stock.quantity}
//                 currentValue={stock.unit_price}
//                 openValue={stock.open_price}
//                 key={ii}
//               />
//             );
//           });
//         } else { portfolio = "No stocks owned yet."; }

//         return (
//           <div style={{ height: "75vh" }} className="container valign-wrapper">
//             <div className="row">
//               <div className="col s6 center-align">
//                 <h4>
//                   <b>Portfolio(${portfolioSum})</b>
//                 </h4>
//                 <ul>
//                   {portfolio}
//                 </ul>
//               </div>
//               <div className="col s6 center-align">
//                 <h4>
//                   Cash: (${this.state.balance})
//                 </h4>
//                 <input
//                   onChange={this.onChange}
//                   value={this.state.symbol}
//                   error={errors.symbol}
//                   id="symbol"
//                   type="text"
//                   placeholder="Ticker Symbol"
//                   className={classnames("", {
//                     invalid: errors.symbol
//                   })} 
//                 />
//                 <input
//                   onChange={this.onChange}
//                   value={this.state.quantity}
//                   error={errors.quantity}
//                   id="quantity"
//                   type="text"
//                   placeholder="Quantity"
//                   className={classnames("", {
//                     invalid: errors.quantity
//                   })}
//                 />                        
//                 <button
//                   style={{
//                     width: "100px",
//                     borderRadius: "3px",
//                     letterSpacing: "1.5px",
//                     marginTop: "1rem"
//                   }}
//                   onClick={this.onBuyClick}
//                   className="btn btn-large waves-effect waves-light hoverable blue accent-3"
//                 >
//                   Buy
//                 </button>
//                 <button
//                   style={{
//                     width: "100px",
//                     borderRadius: "3px",
//                     letterSpacing: "1.5px",
//                     marginTop: "1rem"
//                   }}
//                   onClick={this.onSellClick}
//                   className="btn btn-large waves-effect waves-light hoverable blue accent-3"
//                 >
//                   Sell
//                 </button>
//                 <button
//                   style={{
//                     width: "150px",
//                     borderRadius: "3px",
//                     letterSpacing: "1.5px",
//                     marginTop: "1rem"
//                   }}
//                   onClick={this.onUpdateClick}
//                   className="btn btn-large waves-effect waves-light hoverable blue accent-3"
//                 >
//                   Update Prices
//                 </button>
//                 <button
//                   style={{
//                     width: "150px",
//                     borderRadius: "3px",
//                     letterSpacing: "1.5px",
//                     marginTop: "1rem"
//                   }}
//                   onClick={this.onLogoutClick}
//                   className="btn btn-large waves-effect waves-light hoverable blue accent-3"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//     }
// }

// Dashboard.propTypes = {
//     logoutUser: PropTypes.func.isRequired,
//     buyStock: PropTypes.func.isRequired,
//     sellStock: PropTypes.func.isRequired,
//     updateStocks: PropTypes.func.isRequired,
//     auth: PropTypes.object.isRequired,
//     user: PropTypes.object.isRequired
// };

// const mapStateToProps = state => ({
//     auth: state.auth,
//     stock: state.stock
// });

// export default connect(
//     mapStateToProps,
//     { logoutUser, buyStock, sellStock, updateStocks }
// )(Dashboard);

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