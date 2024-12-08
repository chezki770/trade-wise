import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../redux/actions/authActions";
import logo from "../../assets/trade_wise_logo.webp";
import MarketStatus from "./MarketStatus";

class Navbar extends Component {
  onLogoutClick = (e) => {
    e.preventDefault();
    this.props.logoutUser();
  };

  componentDidMount() {
    const M = window.M;
    if (M) {
      const elems = document.querySelectorAll('.sidenav');
      M.Sidenav.init(elems, {});
    }
  }

  render() {
    const { isAuthenticated, user } = this.props.auth;

    // Guest (not logged in) navigation links
    const guestLinks = (
      <>
        <li>
          <Link
            className="col s3 black-text"
            to="/register"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            Register
          </Link>
        </li>
        <li>
          <Link
            className="col s3 black-text"
            to="/login"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            Login
          </Link>
        </li>
      </>
    );

    // Authenticated user navigation links
    const authLinks = (
      <>
        {user && user.isAdmin && (
          <li>
            <Link
              className="col s3 black-text"
              to="/admin"
              style={{
                color: "grey",
                fontFamily: "monospace",
                fontWeight: "bold",
                padding: "16px",
              }}
            >
              Admin
            </Link>
          </li>
        )}
        <li>
          <Link
            className="col s3 black-text"
            to="/dashboard"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            className="col s3 black-text"
            to="/news"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            News
          </Link>
        </li>
        <li>
          <Link
            className="col s3 black-text"
            to="/about"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            About
          </Link>
        </li> 
        <li>
          <Link
            className="col s3 black-text"
            to="/faq"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            FAQ
          </Link>
        </li>
        <li>
          <Link
            className="col s3 black-text"
            to="/learn"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            Learn
          </Link>
        </li>
        <li>
          <Link
            className="col s3 black-text"
            to="/research"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            Research
          </Link>
        </li>
        <li>
          <Link
            className="col s3 black-text"
            to="/history"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
            }}
          >
            Transactions
          </Link>
        </li>
        <li>
          <a
            href="#!"
            onClick={this.onLogoutClick}
            className="col s3 black-text"
            style={{
              color: "grey",
              fontFamily: "monospace",
              fontWeight: "bold",
              padding: "16px",
              cursor: "pointer",
            }}
          >
            Logout
          </a>
        </li>
      </>
    );

    return (
      <div className="navbar-fixed">
        <nav className="z-depth-0">
          <div className="nav-wrapper white">
            <Link
              to="/"
              style={{
                fontFamily: "monospace"
              }}
              className="col s5 brand-logo center black-text"
            >
              <img src={logo} alt="logo" style={{ height: '64px', marginRight: '10px' }} />
              Trade Wise
            </Link>
            <MarketStatus />
            <a href="#!" data-target="mobile-nav" className="sidenav-trigger right">
              <i className="material-icons black-text">menu</i>
            </a>
            <ul className="right hide-on-med-and-down">
              {isAuthenticated ? authLinks : guestLinks}
            </ul>
          </div>
        </nav>
        <ul className="sidenav" id="mobile-nav">
          {isAuthenticated ? authLinks : guestLinks}
        </ul>
      </div>
    );
  }
}

Navbar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(Navbar);
