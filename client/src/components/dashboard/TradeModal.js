import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './TradeModal.css';

const TradeModal = ({ 
  show, 
  onClose, 
  onTrade, 
  tradeType, 
  initialSymbol = '', 
  initialQuantity = 0,
  userBalance,
  ownedStocks
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Initial price fetch
  useEffect(() => {
    if (show && symbol) {
      fetchStockPrice();
    }
  }, [show, symbol]);

  const fetchStockPrice = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get the token from localStorage
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/stocks/price/${symbol}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.valid) {
          setPrice(data.currentPrice);
        } else {
          setError(data.error || 'Invalid stock symbol');
          setPrice(null);
        }
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          throw new Error(data.error || 'Failed to fetch stock price');
        }
      }
    } catch (err) {
      console.error('Stock price fetch error:', err);
      setError(err.message || 'Failed to fetch stock price');
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const validateTrade = () => {
    if (!symbol || !quantity || quantity <= 0) {
      setError('Please enter valid symbol and quantity');
      return false;
    }

    const totalCost = price * quantity;

    if (tradeType === 'buy') {
      if (totalCost > userBalance) {
        setError('Insufficient funds for this trade');
        return false;
      }
    } else {
      const ownedStock = ownedStocks.find(s => s.symbol === symbol);
      if (!ownedStock || ownedStock.quantity < quantity) {
        setError('Insufficient shares for this sale');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateTrade()) {
      return;
    }

    if (quantity > 100) { // Show confirmation for large trades
      setShowConfirm(true);
      return;
    }

    executeTrade();
  };

  const executeTrade = () => {
    setShowConfirm(false);
    onTrade({
      symbol: symbol.toUpperCase(),
      quantity: parseInt(quantity),
      price
    });
  };

  if (!show) return null;

  return (
    <div className="trade-modal">
      <div className="trade-modal-content">
        <h4>{tradeType === 'buy' ? 'Buy Stock' : 'Sell Stock'}</h4>
        
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={tradeType === 'sell'}
            />
            <label htmlFor="symbol" className={symbol ? 'active' : ''}>
              Stock Symbol
            </label>
          </div>

          <div className="input-field">
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
            <label htmlFor="quantity" className={quantity ? 'active' : ''}>
              Quantity
            </label>
          </div>

          {price && (
            <div className="price-preview">
              <p>Current Price: <span className="price">${price.toFixed(2)}</span></p>
              <p>Total Value: <span className="total">${(price * quantity).toFixed(2)}</span></p>
              {userBalance && tradeType === 'buy' && (
                <p>Remaining Balance After Trade: 
                  <span className={userBalance - price * quantity >= 0 ? 'green-text' : 'red-text'}>
                    ${(userBalance - price * quantity).toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          )}

          {error && <p className="red-text">{error}</p>}

          {loading ? (
            <div className="progress">
              <div className="indeterminate"></div>
            </div>
          ) : (
            <div className="modal-actions">
              <button type="submit" className="btn" disabled={loading || !!error}>
                {tradeType === 'buy' ? 'Buy' : 'Sell'}
              </button>
              <button type="button" className="btn grey" onClick={onClose}>
                Cancel
              </button>
            </div>
          )}
        </form>

        {showConfirm && (
          <div className="confirm-dialog">
            <h5>Confirm {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}</h5>
            <p>Are you sure you want to {tradeType} {quantity} shares of {symbol}?</p>
            <p>Total value: ${(price * quantity).toFixed(2)}</p>
            <div className="modal-actions">
              <button className="btn" onClick={executeTrade}>Confirm</button>
              <button className="btn grey" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TradeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTrade: PropTypes.func.isRequired,
  tradeType: PropTypes.oneOf(['buy', 'sell']).isRequired,
  initialSymbol: PropTypes.string,
  initialQuantity: PropTypes.number,
  userBalance: PropTypes.number,
  ownedStocks: PropTypes.array
};

export default TradeModal;
