import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./redux/actions/authActions";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./App.css";
import { Provider } from "react-redux";
import store from "./redux/store";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/private-route/PrivateRoute";
import AdminRoute from "./components/private-route/AdminRoute";
import Dashboard from "./components/dashboard/Dashboard";
import History from "./components/dashboard/History";
import AdminDashboard from "./components/admin/AdminDashboard";
import StockResearch from "./components/stock-research/StockResearch";

// Import pages
import Learn from "./Pages/Learn/learn.js";
import About from "./Pages/About/About.js";
import FAQ from "./Pages/FAQ/faq.js";
import NewsPage from "./components/news/NewsPage";

// Utility function to check and set the current user on app load
const checkTokenAndAuthenticate = () => {
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
};

// App component as an arrow functional component
const App = () => {
  useEffect(() => {
    checkTokenAndAuthenticate();
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <ToastContainer />
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/learn" component={Learn} />
            <Route exact path="/about" component={About} />
            <Route exact path="/faq" component={FAQ} />
            <Route exact path="/news" component={NewsPage} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/research" component={StockResearch} />
            <PrivateRoute exact path="/history" component={History} />
            <AdminRoute exact path="/admin" component={AdminDashboard} />
          </Switch>
        </div>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
