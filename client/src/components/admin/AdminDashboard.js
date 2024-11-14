import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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
    axios
      .get("/server/api/users/all", {
        headers: {
          Authorization: localStorage.getItem("jwtToken")
        }
      })
      .then(res => {
        this.setState({
          users: res.data,
          loading: false
        });
      })
      .catch(err => {
        this.setState({
          error: "Error fetching users",
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
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    return (
      <div className="container">
        <h4>
          <b>Admin Dashboard</b>
        </h4>
        <div className="row">
          {users.map(user => (
            <div className="col s12 m6" key={user._id}>
              <Card>
                <CardHeader>
                  <h5>{user.name}</h5>
                  <p className="grey-text">{user.email}</p>
                </CardHeader>
                <CardContent>
                  <p>Balance: ${user.balance}</p>
                  <p>Stocks Owned: {user.ownedStocks.length}</p>
                  <p>Transactions: {user.transactions.length}</p>
                  <p>Account Created: {new Date(user.date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
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

// Add to routes/api/users.js
// New endpoint to get all users (admin only)
router.get("/all", passport.authenticate("jwt", { session: false }), (req, res) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  User.find({})
    .select("-password") // Exclude password field
    .then(users => res.json(users))
    .catch(err => res.status(400).json({ error: "Error fetching users" }));
});

// Modify App.js to add admin route
// Add this to your imports
import AdminDashboard from "./components/admin/AdminDashboard";

// Add this to your Switch component in App.js
<Switch>
  {/* ... existing routes ... */}
  <PrivateRoute exact path="/admin" component={AdminDashboard} />
</Switch>

// Modify Navbar.js to add admin link (only visible to admins)
// Add this inside your navbar list
{auth.user.isAdmin && (
  <li>
    <Link
      className="col s3 black-text"
      to="/admin"
      style={{
        color: "grey",
        fontFamily: "monospace",
        fontWeight: "bold",
        padding: "16dp"
      }}
    >
      Admin
    </Link>
  </li>
)}

// Modify authActions.js to include isAdmin in payload
// In the loginUser action, modify the decoded payload:
const payload = {
  id: user[0]._id,
  name: user[0].name,
  isAdmin: user[0].isAdmin, 
  balance: user[0].balance,
  transactions: user[0].transactions,
  ownedStocks: user[0].ownedStocks
};