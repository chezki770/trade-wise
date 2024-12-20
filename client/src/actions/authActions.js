// import axios from "axios";  // We'll uncomment this when we need it for API calls
import setAuthToken from "../utils/setAuthToken";
import { SET_CURRENT_USER, USER_LOADING } from "./types";

// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  
  // Remove auth header for future requests
  setAuthToken(false);
  
  // Set current user to empty object which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
