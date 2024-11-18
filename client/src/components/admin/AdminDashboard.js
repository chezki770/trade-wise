import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";

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
      userToPromote: null
    };
  }

  componentDidMount() {
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

    axios
      .put(`/api/users/${userToPromote._id}`, 
        { isAdmin: true },
        {
          headers: {
            Authorization: token
          }
        }
      )
      .then(response => {
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
        this.setState({
          adminPromoteError: err.response?.data?.error || "Error promoting user to admin"
        });
      });
  };

  render() {
    const { 
      filteredUsers, 
      loading, 
      error, 
      searchTerm, 
      showDeleteConfirm, 
      showPromoteConfirm,
      userToDelete,
      userToPromote,
      deleteError,
      adminPromoteError 
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
      <div className="container">
        <h4>
          <b>Admin Dashboard</b>
        </h4>
        
        {/* Search Bar */}
        <div className="row">
          <div className="input-field col s12">
            <input
              type="text"
              id="search"
              value={searchTerm}
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
        {showDeleteConfirm && userToDelete && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            <div className="modal-content" style={{ backgroundColor: 'white', width: '80%', maxWidth: '500px', margin: '100px auto', padding: '20px', borderRadius: '4px' }}>
              <h5>Confirm Delete</h5>
              <p>Are you sure you want to delete user {userToDelete.name} ({userToDelete.email})?</p>
              {deleteError && <p className="red-text">{deleteError}</p>}
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
        {showPromoteConfirm && userToPromote && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            <div className="modal-content" style={{ backgroundColor: 'white', width: '80%', maxWidth: '500px', margin: '100px auto', padding: '20px', borderRadius: '4px' }}>
              <h5>Confirm Promote to Admin</h5>
              <p>Are you sure you want to promote {userToPromote.name} ({userToPromote.email}) to admin status?</p>
              {adminPromoteError && <p className="red-text">{adminPromoteError}</p>}
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