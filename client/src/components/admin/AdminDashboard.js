import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    // Only fetch if user is admin
    if (this.props.auth.user.isAdmin) {
      this.fetchUsers();
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

  render() {
    const { users, loading, error } = this.state;

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
      <div className="container">
        <h4>
          <b>Admin Dashboard</b>
        </h4>
        <div className="row">
          {users.map(user => (
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
              </div>
            </div>
          ))}
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