// In App.js
import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

import './App.css';
import { Provider } from "react-redux";
import store from "./store";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/private-route/PrivateRoute";
import AdminRoute from "./components/private-route/AdminRoute";  // Make sure this import exists
import Dashboard from "./components/dashboard/Dashboard";
import History from "./components/dashboard/History";
import AdminDashboard from "./components/admin/AdminDashboard"; // Make sure this import exists


// Import new pages
import Learn from "./Pages/Learn";
import About from "./Pages/About";
import FAQ from "./Pages/FAQ";


// Check for token to keep user logged in
if (localStorage.jwtToken) {
  const token = localStorage.jwtToken;
  setAuthToken(token);
  const decoded = jwt_decode(token);
  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());
    window.location.href = "./login";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Switch>
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path="/history" component={History} />
              <AdminRoute exact path="/admin" component={AdminDashboard} />
              <Route exact path="/learn" component={Learn} />
              <Route exact path="/about" component={About} />
              <Route exact path="/faq" component={FAQ} />
            </Switch>
          </div>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
