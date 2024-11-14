import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import {
    GET_ERRORS,
    SET_CURRENT_USER,
    USER_LOADING,
    GET_ALL_USERS,
    UPDATE_USER
} from "./types";

// Register User
export const registerUser = (userData, history) => dispatch => {
    dispatch(setUserLoading());
    axios
        .post("/api/users/register", userData)
        .then(res => {
            history.push("/login"); // redirect to login on successful register
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response ? err.response.data : { error: "Registration failed" }
            })
        );
};

// Login - get user token
export const loginUser = userData => dispatch => {
    dispatch(setUserLoading());
    axios
        .post("/api/users/login", userData)
        .then(res => {
            // Save to localStorage
            const { token } = res.data;
            localStorage.setItem("jwtToken", token);

            // Set token to auth header
            setAuthToken(token);

            // Decode token to get user data
            const decoded = jwt_decode(token);

            // Set current user
            dispatch(setCurrentUser({
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                isAdmin: decoded.isAdmin,
                balance: decoded.balance,
                transactions: decoded.transactions,
                ownedStocks: decoded.ownedStocks
            }));
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response ? err.response.data : { error: "Login failed" }
            })
        );
};

// Get all users (admin only)
export const getAllUsers = () => dispatch => {
    dispatch(setUserLoading());
    axios
        .get("/server/api/users/all", {
            headers: {
                Authorization: localStorage.getItem("jwtToken")
            }
        })
        .then(res => {
            dispatch({
                type: GET_ALL_USERS,
                payload: res.data
            });
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response ? err.response.data : { error: "Failed to fetch users" }
            })
        );
};

// Update user (admin only)
export const updateUser = (userId, userData) => dispatch => {
    dispatch(setUserLoading());
    axios
        .put(`/api/users/${userId}`, userData, {
            headers: {
                Authorization: localStorage.getItem("jwtToken")
            }
        })
        .then(res => {
            dispatch({
                type: UPDATE_USER,
                payload: res.data
            });
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response ? err.response.data : { error: "Failed to update user" }
            })
        );
};

// Set logged in user
export const setCurrentUser = decoded => {
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
    // Remove token from localStorage
    localStorage.removeItem("jwtToken");
    // Remove auth header for future requests
    setAuthToken(false);
    // Set current user to empty object {} which will set isAuthenticated to false
    dispatch(setCurrentUser({}));
};

// Check token expiration
export const checkTokenExpiration = () => dispatch => {
    if (localStorage.jwtToken) {
        const token = localStorage.jwtToken;
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            // Token expired
            dispatch(logoutUser());
            window.location.href = "./login";
        }
    }
};