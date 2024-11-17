import React, { Component } from "react";
import { Link } from "react-router-dom";

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark" style={{ background: "white" }}>
        <ul>
          <li>
            <Link
              className="black-text"
              to="/"
              style={{ fontFamily: "monospace" }}
            >
              Main
            </Link>
          </li>
          <li>
            <Link
              className="col s3 black-text"
              to="/AdminDashboard"
              style={{
                color: "grey",
                fontFamily: "monospace",
                fontWeight: "bold",
                padding: "16dp",
              }}
            >
              Admin
            </Link>
          </li>
          <li>
            <Link
              className="col s3 black-text"
              to="/Dashboard"
              style={{
                color: "grey",
                fontFamily: "monospace",
                fontWeight: "bold",
                padding: "16dp",
              }}
            >
              Portfolio
            </Link>
          </li>
          <li>
            <Link
              className="col s3 black-text"
              to="/History"
              style={{
                color: "grey",
                fontFamily: "monospace",
                fontWeight: "bold",
                padding: "16dp",
              }}
            >
              Transactions
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
                padding: "16dp",
              }}
            >
              Learn
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
                padding: "16dp",
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
                padding: "16dp",
              }}
            >
              FAQ
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
