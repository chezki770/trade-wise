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
    console.log("Registering user with data:", userData); // Debug log

    axios
        .post("/api/users/register", userData)
        .then(res => {
            console.log("Registration successful:", res.data); // Debug log
            
            // Create login data from registration
            const loginData = {
                email: userData.email,
                password: userData.password
            };
            
            // Automatically log in after successful registration
            dispatch(loginUser(loginData, history));
        })
        .catch(err => {
            console.error("Registration error:", err); // Debug log
            dispatch({
                type: GET_ERRORS,
                payload: err.response ? err.response.data : { error: "Registration failed" }
            });
        });
};

// Login - get user token
export const loginUser = (userData, history) => dispatch => {
    dispatch(setUserLoading());
    console.log("Attempting login with:", userData); // Debug log

    axios
        .post("/api/users/login", userData)
        .then(res => {
            console.log("Login response:", res.data); // Debug log
            
            // Save to localStorage
            const { token } = res.data;
            localStorage.setItem("jwtToken", token);

            // Set token to auth header
            setAuthToken(token);    

            // Decode token to get user data
            const decoded = jwt_decode(token);
            console.log("Decoded token:", decoded); // Debug log

            // Set current user
            const userPayload = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                isAdmin: decoded.isAdmin,
                balance: decoded.balance,
                transactions: decoded.transactions,
                ownedStocks: decoded.ownedStocks
            };

            console.log("Setting current user with:", userPayload); // Debug log
            dispatch(setCurrentUser(userPayload));

            // Redirect based on user role
            if (history) {
                if (decoded.isAdmin) {
                    history.push("/admin");
                } else {
                    history.push("/dashboard");
                }
            }
        })
        .catch(err => {
            console.error("Login error:", err); // Debug log
            dispatch({
                type: GET_ERRORS,
                payload: err.response ? err.response.data : { error: "Login failed" }
            });
        });
};

// Get all users (admin only)
export const getAllUsers = () => dispatch => {
    dispatch(setUserLoading());
    axios
        .get("/api/users/all", {
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
    console.log("Setting current user in reducer:", decoded); // Debug log
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