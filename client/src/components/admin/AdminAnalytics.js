import React, { Component } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import DateRangePicker from 'react-date-range';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

class AdminAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        lastWeekLogins: 0,
        thisWeekLogins: 0,
      },
      tradingStats: {
        totalTrades: 0,
        successfulTrades: 0,
        averageProfit: 0,
        totalVolume: 0,
        mostTradedPairs: [],
      },
      dateRange: {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date(),
      },
      userGrowthData: {
        labels: [],
        datasets: [],
      },
      userActivityData: {
        labels: ['Active', 'Inactive'],
        datasets: [],
      },
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchAnalyticsData();
  }

  fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const { startDate, endDate } = this.state.dateRange;
      
      const [userStats, userGrowth, userActivity, tradingStats] = await Promise.all([
        axios.get('/api/analytics/user-stats', {
          headers: { Authorization: token },
          params: { startDate, endDate }
        }),
        axios.get('/api/analytics/user-growth', {
          headers: { Authorization: token },
          params: { startDate, endDate }
        }),
        axios.get('/api/analytics/user-activity', {
          headers: { Authorization: token },
          params: { startDate, endDate }
        }),
        axios.get('/api/analytics/trading-stats', {
          headers: { Authorization: token },
          params: { startDate, endDate }
        })
      ]);

      this.setState({
        userStats: userStats.data,
        tradingStats: tradingStats.data,
        userGrowthData: {
          labels: userGrowth.data.labels,
          datasets: [{
            label: 'New Users',
            data: userGrowth.data.values,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        userActivityData: {
          labels: ['Active', 'Inactive'],
          datasets: [{
            data: [userActivity.data.active, userActivity.data.inactive],
            backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
          }]
        },
        loading: false
      });
    } catch (err) {
      this.setState({
        error: err.response?.data?.error || 'Error fetching analytics data',
        loading: false
      });
    }
  };

  handleDateRangeChange = (startDate, endDate) => {
    this.setState({ dateRange: { startDate, endDate }}, () => {
      this.fetchAnalyticsData();
    });
  };

  exportData = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const { startDate, endDate } = this.state.dateRange;
      
      const response = await axios.get('/api/analytics/export', {
        headers: { Authorization: token },
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      this.setState({
        error: 'Error exporting data'
      });
    }
  };

  render() {
    const { loading, error, userStats, tradingStats, userGrowthData, userActivityData, dateRange } = this.state;

    if (loading) {
      return <div className="analytics-container">Loading analytics data...</div>;
    }

    if (error) {
      return <div className="analytics-container">Error: {error}</div>;
    }

    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>Analytics Dashboard</h2>
          <div className="date-range-picker">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={this.handleDateRangeChange}
            />
            <button className="export-btn" onClick={this.exportData}>
              Export Data
            </button>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{userStats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p>{userStats.activeUsers}</p>
          </div>
          <div className="stat-card">
            <h3>New Users This Month</h3>
            <p>{userStats.newUsersThisMonth}</p>
          </div>
          <div className="stat-card">
            <h3>Total Trades</h3>
            <p>{tradingStats.totalTrades}</p>
          </div>
          <div className="stat-card">
            <h3>Success Rate</h3>
            <p>{((tradingStats.successfulTrades / tradingStats.totalTrades) * 100).toFixed(1)}%</p>
          </div>
          <div className="stat-card">
            <h3>Average Profit</h3>
            <p>${tradingStats.averageProfit.toFixed(2)}</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart">
            <h3>User Growth Over Time</h3>
            <Line
              data={userGrowthData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Monthly User Growth'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>

          <div className="chart">
            <h3>User Activity Distribution</h3>
            <Pie
              data={userActivityData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>

          <div className="chart">
            <h3>User Engagement Metrics</h3>
            <Bar
              data={{
                labels: ['Last Week', 'This Week'],
                datasets: [{
                  label: 'Login Activity',
                  data: [userStats.lastWeekLogins || 0, userStats.thisWeekLogins || 0],
                  backgroundColor: 'rgba(75, 192, 192, 0.5)',
                  borderColor: 'rgb(75, 192, 192)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default AdminAnalytics;
