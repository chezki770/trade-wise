import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTimeframe: '1M', // '1D', '1W', '1M', '3M', '1Y', 'ALL'
      chartData: [],
    };
  }

  componentDidMount() {
    this.generateChartData();
  }

  generateChartData = () => {
    // In a real app, this would fetch historical data from an API
    // For demo, we'll generate sample data
    const { transactions = [] } = this.props.auth.user;
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Generate cumulative portfolio value over time
    let portfolioValue = 0;
    const chartData = sortedTransactions.map(transaction => {
      const amount = transaction.stock_price * transaction.stock_quantity;
      portfolioValue += transaction.transaction_type === "BUY" ? -amount : amount;
      
      return {
        date: new Date(transaction.date).toLocaleDateString(),
        value: portfolioValue,
        type: transaction.transaction_type,
        symbol: transaction.symbol,
      };
    });

    this.setState({ chartData });
  };

  render() {
    const { user } = this.props.auth;
    const { chartData } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Trading History</b>
            </h4>

            {/* Portfolio Performance Graph */}
            <div className="row">
              <div className="col s12">
                <div className="card">
                  <div className="card-content">
                    <span className="card-title">Portfolio Performance</span>
                    <div style={{ width: '100%', height: 400 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8884d8" 
                            name="Portfolio Value"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="row">
              <div className="col s12">
                <div className="card">
                  <div className="card-content">
                    <span className="card-title">Transaction History</span>
                    <table className="striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Symbol</th>
                          <th>Shares</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.transactions?.slice().reverse().map((transaction, index) => {
                          const total = transaction.stock_price * transaction.stock_quantity;
                          return (
                            <tr key={index}>
                              <td>{new Date(transaction.date).toLocaleString()}</td>
                              <td>
                                <span className={transaction.transaction_type === "BUY" ? "green-text" : "red-text"}>
                                  {transaction.transaction_type}
                                </span>
                              </td>
                              <td>{transaction.symbol}</td>
                              <td>{transaction.stock_quantity}</td>
                              <td>${transaction.stock_price.toFixed(2)}</td>
                              <td className={transaction.transaction_type === "BUY" ? "red-text" : "green-text"}>
                                {transaction.transaction_type === "BUY" ? "-" : "+"}${total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="row">
              <div className="col s12 m4">
                <div className="card blue-grey darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Total Trades</span>
                    <h4>{user.transactions?.length || 0}</h4>
                  </div>
                </div>
              </div>
              <div className="col s12 m4">
                <div className="card blue-grey darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Buy Orders</span>
                    <h4>
                      {user.transactions?.filter(t => t.transaction_type === "BUY").length || 0}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col s12 m4">
                <div className="card blue-grey darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Sell Orders</span>
                    <h4>
                      {user.transactions?.filter(t => t.transaction_type === "SELL").length || 0}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

History.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(History);