import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";
import './AdminDashboard.css';

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      filteredUsers: [],
      searchTerm: "",
      loading: true,
      error: null,
      deleteError: null,
      adminPromoteError: null,
      showDeleteConfirm: false,
      showPromoteConfirm: false,
      userToDelete: null,
      userToPromote: null,
      statistics: {
        totalUsers: 0,
        activeUsers: 0,
        totalTrades: 0,
        tradingVolume: 0,
        avgTradeSize: 0
      },
      recentTrades: [],
      systemMetrics: {
        serverStatus: 'operational',
        apiCallsToday: 0,
        apiCallsLimit: 500,
        lastUpdated: null
      }
    };
  }

  componentDidMount() {
    if (this.props.auth.user.isAdmin) {
      this.fetchUsers();
      this.fetchStatistics();
      this.fetchRecentTrades();
      this.fetchSystemMetrics();
      // Set up auto-refresh every 5 minutes
      this.refreshInterval = setInterval(() => {
        this.fetchStatistics();
        this.fetchSystemMetrics();
      }, 300000);
    }
  }

  componentWillUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  fetchUsers = () => {
    const token = localStorage.getItem("jwtToken");
    
    axios
      .get("/api/users/all", {
        headers: {
          Authorization: token
        }
      })
      .then(res => {
        console.log("Users data:", res.data);
        this.setState({
          users: res.data,
          filteredUsers: res.data,
          loading: false
        });
      })
      .catch(err => {
        console.error("Error fetching users:", err.response || err);
        this.setState({
          error: err.response?.data?.error || "Error fetching users",
          loading: false
        });
      });
  };

  fetchStatistics = () => {
    const token = localStorage.getItem("jwtToken");
    axios
      .get("/api/analytics/user-stats", {
        headers: { Authorization: token }
      })
      .then(res => {
        this.setState({ statistics: res.data });
      })
      .catch(err => {
        console.error("Error fetching statistics:", err);
      });
  };

  fetchRecentTrades = () => {
    const token = localStorage.getItem("jwtToken");
    axios
      .get("/api/analytics/recent-trades", {
        headers: { Authorization: token }
      })
      .then(res => {
        this.setState({ recentTrades: res.data });
      })
      .catch(err => {
        console.error("Error fetching recent trades:", err);
      });
  };

  fetchSystemMetrics = () => {
    const token = localStorage.getItem("jwtToken");
    axios
      .get("/api/analytics/system-metrics", {
        headers: { Authorization: token }
      })
      .then(res => {
        this.setState({ 
          systemMetrics: {
            ...res.data,
            lastUpdated: new Date()
          }
        });
      })
      .catch(err => {
        console.error("Error fetching system metrics:", err);
      });
  };

  handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = this.state.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );

    this.setState({
      searchTerm: e.target.value,
      filteredUsers
    });
  };

  showDeleteConfirmation = (user) => {
    this.setState({
      showDeleteConfirm: true,
      userToDelete: user,
      deleteError: null
    });
  };

  hideDeleteConfirmation = () => {
    this.setState({
      showDeleteConfirm: false,
      userToDelete: null,
      deleteError: null
    });
  };

  showPromoteConfirmation = (user) => {
    this.setState({
      showPromoteConfirm: true,
      userToPromote: user,
      adminPromoteError: null
    });
  };

  hidePromoteConfirmation = () => {
    this.setState({
      showPromoteConfirm: false,
      userToPromote: null,
      adminPromoteError: null
    });
  };

  handleDeleteUser = () => {
    const { userToDelete } = this.state;
    const token = localStorage.getItem("jwtToken");
    
    axios
      .delete(`/api/users/${userToDelete._id}`, {
        headers: {
          Authorization: token
        }
      })
      .then(response => {
        const updatedUsers = this.state.users.filter(user => user._id !== userToDelete._id);
        this.setState({
          users: updatedUsers,
          filteredUsers: updatedUsers.filter(user =>
            user.name.toLowerCase().includes(this.state.searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(this.state.searchTerm.toLowerCase())
          ),
          showDeleteConfirm: false,
          userToDelete: null,
          deleteError: null
        });
      })
      .catch(err => {
        this.setState({
          deleteError: err.response?.data?.error || "Error deleting user"
        });
      });
  };

  handlePromoteToAdmin = () => {
    const { userToPromote } = this.state;
    const token = localStorage.getItem("jwtToken");

    // Use the proxy by just specifying the path
    axios
      .put(`/api/users/${userToPromote._id}`, 
        { isAdmin: true },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      )
      .then(response => {
        console.log('Promotion response:', response);
        // Update user in state
        const updatedUsers = this.state.users.map(user => 
          user._id === userToPromote._id ? { ...user, isAdmin: true } : user
        );
        
        this.setState({
          users: updatedUsers,
          filteredUsers: updatedUsers.filter(user =>
            user.name.toLowerCase().includes(this.state.searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(this.state.searchTerm.toLowerCase())
          ),
          showPromoteConfirm: false,
          userToPromote: null,
          adminPromoteError: null
        });
      })
      .catch(err => {
        console.error('Error promoting user:', err);
        console.error('Error response:', err.response);
        this.setState({
          adminPromoteError: err.response?.data?.error || "Error promoting user to admin",
          showPromoteConfirm: true // Keep modal open on error
        });
      });
  };

  render() {
    const { 
      loading, 
      error, 
      filteredUsers, 
      showDeleteConfirm, 
      showPromoteConfirm,
      statistics,
      recentTrades,
      systemMetrics
    } = this.state;

    if (!this.props.auth.user.isAdmin) {
      return (
        <div className="container">
          <h4>Unauthorized Access</h4>
          <p>You must be an admin to view this page.</p>
        </div>
      );
    }

    if (loading) {
      return <div className="container">Loading...</div>;
    }

    if (error) {
      return (
        <div className="container">
          <h4>Error</h4>
          <p className="red-text">{error}</p>
          <button 
            className="btn waves-effect waves-light"
            onClick={this.fetchUsers}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        
        {/* Statistics Overview */}
        <div className="statistics-panel">
          <h3>Platform Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Users</h4>
              <p>{statistics.totalUsers}</p>
              <small>Active: {statistics.activeUsers}</small>
            </div>
            <div className="stat-card">
              <h4>Trading Activity</h4>
              <p>{statistics.totalTrades} trades</p>
              <small>Volume: ${statistics.tradingVolume.toLocaleString()}</small>
            </div>
            <div className="stat-card">
              <h4>API Usage</h4>
              <p>{systemMetrics.apiCallsToday} / {systemMetrics.apiCallsLimit}</p>
              <small>Calls Today</small>
            </div>
            <div className="stat-card">
              <h4>System Status</h4>
              <p className={`status-${systemMetrics.serverStatus}`}>
                {systemMetrics.serverStatus}
              </p>
              <small>Last Updated: {systemMetrics.lastUpdated?.toLocaleTimeString()}</small>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="recent-trades-panel">
          <h3>Recent Trades</h3>
          <div className="trades-table">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(trade => (
                  <tr key={trade._id}>
                    <td>{new Date(trade.executedAt).toLocaleString()}</td>
                    <td>{trade.user.email}</td>
                    <td className={trade.type}>{trade.type}</td>
                    <td>{trade.symbol}</td>
                    <td>{trade.quantity}</td>
                    <td>${trade.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management Section */}
        <div className="user-management-panel">
          <h3>User Management</h3>
          <div className="row">
            <div className="input-field col s12">
              <input
                type="text"
                id="search"
                value={this.state.searchTerm}
                onChange={this.handleSearch}
                placeholder="Search by name or email..."
                className="validate"
              />
              <label htmlFor="search" className="active">Search Users</label>
            </div>
          </div>

          {/* User count */}
          <div className="row">
            <div className="col s12">
              <p className="grey-text">
                Showing {filteredUsers.length} of {this.state.users.length} users
              </p>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && this.state.userToDelete && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
              <div className="modal-content" style={{ backgroundColor: 'white', width: '80%', maxWidth: '500px', margin: '100px auto', padding: '20px', borderRadius: '4px' }}>
                <h5>Confirm Delete</h5>
                <p>Are you sure you want to delete user {this.state.userToDelete.name} ({this.state.userToDelete.email})?</p>
                {this.state.deleteError && <p className="red-text">{this.state.deleteError}</p>}
                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  <button
                    onClick={this.hideDeleteConfirmation}
                    className="btn-flat waves-effect"
                    style={{ marginRight: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={this.handleDeleteUser}
                    className="btn waves-effect waves-light red"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Promote to Admin Confirmation Modal */}
          {showPromoteConfirm && this.state.userToPromote && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
              <div className="modal-content" style={{ backgroundColor: 'white', width: '80%', maxWidth: '500px', margin: '100px auto', padding: '20px', borderRadius: '4px' }}>
                <h5>Confirm Promote to Admin</h5>
                <p>Are you sure you want to promote {this.state.userToPromote.name} ({this.state.userToPromote.email}) to admin status?</p>
                {this.state.adminPromoteError && <p className="red-text">{this.state.adminPromoteError}</p>}
                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  <button
                    onClick={this.hidePromoteConfirmation}
                    className="btn-flat waves-effect"
                    style={{ marginRight: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={this.handlePromoteToAdmin}
                    className="btn waves-effect waves-light blue"
                  >
                    Promote to Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Grid */}
          <div className="row">
            {filteredUsers.length === 0 ? (
              <div className="col s12">
                <p>No users found matching your search.</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div className="col s12 m6" key={user._id}>
                  <div className="card">
                    <div className="card-content">
                      <span className="card-title">{user.name}</span>
                      <p className="grey-text">{user.email}</p>
                      <div style={{ marginTop: "10px" }}>
                        <p>Balance: ${user.balance.toFixed(2)}</p>
                        <p>Stocks Owned: {user.ownedStocks.length}</p>
                        <p>Transactions: {user.transactions.length}</p>
                        <p>Admin Status: {user.isAdmin ? 'Yes' : 'No'}</p>
                        <p>Account Created: {new Date(user.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="card-action">
                      {/* Don't show actions for the current admin */}
                      {user._id !== this.props.auth.user.id && (
                        <>
                          <button
                            onClick={() => this.showDeleteConfirmation(user)}
                            className="btn-small waves-effect waves-light red"
                            style={{ marginRight: '10px' }}
                          >
                            Delete User
                          </button>
                          {!user.isAdmin && (
                            <button
                              onClick={() => this.showPromoteConfirmation(user)}
                              className="btn-small waves-effect waves-light blue"
                            >
                              Make Admin
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
}

AdminDashboard.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(AdminDashboard);