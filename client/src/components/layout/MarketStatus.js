import React, { Component } from 'react';

class MarketStatus extends Component {
  state = {
    isMarketOpen: false
  };

  checkMarketStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;

    // Market is closed on weekends (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) {
      return false;
    }

    // Market is open from 9:30 AM to 4:00 PM EST
    // Converting to EST (UTC-5)
    const estHourOffset = -5;
    const localOffset = now.getTimezoneOffset() / 60;
    const hourDiff = localOffset + estHourOffset;
    
    const estHours = hours + hourDiff;
    const estTime = ((estHours + 24) % 24) * 100 + minutes;

    return estTime >= 930 && estTime <= 1600;
  };

  componentDidMount() {
    // Initial check
    this.setState({ isMarketOpen: this.checkMarketStatus() });

    // Update every minute
    this.interval = setInterval(() => {
      this.setState({ isMarketOpen: this.checkMarketStatus() });
    }, 60000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const { isMarketOpen } = this.state;
    return (
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        padding: '0 15px',
        color: isMarketOpen ? '#4CAF50' : '#f44336',
        fontWeight: 'bold'
      }}>
        <span style={{ 
          height: '10px', 
          width: '10px', 
          borderRadius: '50%', 
          backgroundColor: isMarketOpen ? '#4CAF50' : '#f44336',
          display: 'inline-block',
          marginRight: '8px'
        }}></span>
        Market {isMarketOpen ? 'Open' : 'Closed'}
      </div>
    );
  }
}

export default MarketStatus;
