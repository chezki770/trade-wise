import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { useSelector, useDispatch } from "react-redux";
// import { logoutUser, } from "../../redux/actions/authActions";
// import { buyStock, sellStock, updateStocks } from "../../redux/actions/stockActions";

const HeldStock = ({ symbol, shares, currentValue, openValue }) => {
  const performanceColor =
    currentValue > openValue ? "green" : currentValue < openValue ? "red" : "grey";

  return (
    <li style={{ color: performanceColor }}>
      {symbol} - {shares} shares (${currentValue * shares})
    </li>
  );
};

const Dashboard = () => {
  // Local state
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [balance, setBalance] = useState( 0);
  const [portfolio, setPortfolio] = useState([]);
  const [errors, setErrors] = useState({});

  // // Accessing Redux store state
  // const auth = useSelector((state) => state.auth);
  // const stock = useSelector((state) => state.stock);

  // const dispatch = useDispatch();


  // useEffect(() => {
  //   // Update local state when auth state changes
  //   if (auth?.user) {
  //     setBalance(auth.user.balance || 0);
  //     setPortfolio(auth.user.ownedStocks || []);
  //   }
  // }, [auth]);

  const onLogoutClick = (e) => {
    e.preventDefault();
    // dispatch(logoutUser());
  };

  const onUpdateClick = async (e) => {
    e.preventDefault();

    // const user = stock?.user?.data || auth?.user || {};
    // await dispatch(updateStocks(user));

    // const updatedUser = stock?.user?.data;
    // if (updatedUser) {
    //   setPortfolio(updatedUser.ownedStocks || []);
    // }
  };

  // const processRequest = async (user, tradeRequest, action) => {
  //   return new Promise((resolve) => {
  //     const result = dispatch(action(user, tradeRequest));
  //     setTimeout(() => resolve(result), 5000);
  //   });
  // };

  const handleBuyClick = async (e) => {
    e.preventDefault();

    // const tradeRequest = { symbol, quantity };
    // const user = stock?.user?.data || auth?.user || {};

    // await processRequest(user, tradeRequest, buyStock);

    // const updatedUser = stock?.user?.data;
    // if (updatedUser) {
    //   setBalance(updatedUser.balance || 0);
    //   setPortfolio(updatedUser.ownedStocks || []);
    // }
  };

  const handleSellClick = async (e) => {
    e.preventDefault();

    // const tradeRequest = { symbol, quantity };
    // const user = stock?.user?.data || auth?.user || {};

    // await processRequest(user, tradeRequest, sellStock);

    // const updatedUser = stock?.user?.data;
    // if (updatedUser) {
    //   setBalance(updatedUser.balance || 0);
    //   setPortfolio(updatedUser.ownedStocks || []);
    // }
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
    <div style={{ height: "75vh" }} className="container valign-wrapper">
      <div className="row">
        <div className="col s6 center-align">
          <h4>
            <b>Portfolio (${portfolioSum.toFixed(2)})</b>
          </h4>
          <ul>{portfolioList}</ul>
        </div>
        <div className="col s6 center-align">
          <h4>Cash: (${balance.toFixed(2)})</h4>
          <input
            onChange={(e) => setSymbol(e.target.value)}
            value={symbol}
            id="symbol"
            type="text"
            placeholder="Ticker Symbol"
            className={classnames("", { invalid: errors.symbol })}
          />
          <input
            onChange={(e) => setQuantity(e.target.value)}
            value={quantity}
            id="quantity"
            type="text"
            placeholder="Quantity"
            className={classnames("", { invalid: errors.quantity })}
          />
          <button
            style={{
              width: "100px",
              borderRadius: "3px",
              letterSpacing: "1.5px",
              marginTop: "1rem",
            }}
            onClick={handleBuyClick}
            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          >
            Buy
          </button>
          <button
            style={{
              width: "100px",
              borderRadius: "3px",
              letterSpacing: "1.5px",
              marginTop: "1rem",
            }}
            onClick={handleSellClick}
            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          >
            Sell
          </button>
          <button
            style={{
              width: "150px",
              borderRadius: "3px",
              letterSpacing: "1.5px",
              marginTop: "1rem",
            }}
            onClick={onUpdateClick}
            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          >
            Update Prices
          </button>
          <button
            style={{
              width: "150px",
              borderRadius: "3px",
              letterSpacing: "1.5px",
              marginTop: "1rem",
            }}
            onClick={onLogoutClick}
            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  auth: PropTypes.object,
  stock: PropTypes.object,
};

export default Dashboard;
