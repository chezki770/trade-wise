import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import { showSuccessToast, showErrorToast, showDetailedErrorToast } from "../../utils/notifications";

import {
    GET_ERRORS,
    BUY_STOCK,
    SELL_STOCK,
    UPDATE_STOCKS,
    SET_CURRENT_USER
} from "./types";

// Helper function to fetch stock info
const fetchStockInfo = async (symbol) => {
    try {
        console.log(`Fetching stock info for symbol: ${symbol}`);

        const response = await axios.get(`/api/stocks/price/${symbol}`);
        console.log(`Response received from API for ${symbol}:`, response);

        const stockInfo = response.data;
        console.log(`Parsed stock info for ${symbol}:`, stockInfo);

        if (!stockInfo) {
            console.error(`Failed to retrieve stock data for ${symbol}`);
            throw new Error("Failed to retrieve stock data");
        }

        return stockInfo;
    } catch (err) {
        console.error(`Error occurred while fetching stock info for ${symbol}: ${err.message}`);
        throw new Error(`Stock API Error: ${err.message}`);
    }
};

// client/src/redux/actions/stockActions.js
export const buyStock = (userData, tradeInfo) => async (dispatch) => {
    try {
        console.log("Starting buyStock action...");
        console.log("User Data:", userData);
        console.log("Trade Info:", tradeInfo);

        // Set Authorization Header
        const token = localStorage.getItem("jwtToken");
        if (token) {
            console.log("JWT Token found, setting authorization header...");
            setAuthToken(token);
        }

        console.log("Fetching stock data...");
        // Use our backend endpoint instead of calling Alpha Vantage directly
        const response = await axios.get(`/api/stocks/price/${tradeInfo.symbol}`);

        if (!response.data || !response.data.valid) {
            showDetailedErrorToast(
                "Unable to fetch stock data at this time",
                `Invalid response for symbol: ${tradeInfo.symbol}`
            );
            throw new Error("Invalid stock data received");
        }

        const stockInfo = {
            "1. open": response.data.openPrice.toString(),
            "2. high": response.data.currentPrice.toString(),
            "3. low": response.data.currentPrice.toString(),
            "4. close": response.data.currentPrice.toString(),
            "5. volume": "0"
        };

        const tradeData = {
            userId: userData.id,
            symbol: tradeInfo.symbol,
            quantity: tradeInfo.quantity.toString(),
            stockInfo
        };

        console.log("Sending buy request with trade data:", tradeData);
        const buyResponse = await axios.post("/api/users/buyStock", tradeData);
        
        console.log("Buy request successful:", buyResponse.data);
        dispatch(returnPurchase(buyResponse.data));
        
        // Update user data after successful purchase
        const updatedUserResponse = await axios.get("/api/users/current");
        dispatch({
            type: SET_CURRENT_USER,
            payload: updatedUserResponse.data
        });

        showSuccessToast(`Successfully bought ${tradeInfo.quantity} shares of ${tradeInfo.symbol}`);

    } catch (err) {
        console.error("Error occurred in buyStock:", err);
        console.log("Error details:", err.message);
        
        let errorMessage = "Failed to buy stock. ";
        let technicalDetails = null;
        
        if (err.response) {
            // Server responded with an error
            if (err.response.status === 400) {
                errorMessage += "Invalid request parameters.";
                technicalDetails = err.response.data.message;
            } else if (err.response.status === 401) {
                errorMessage += "Authentication error. Please log in again.";
                technicalDetails = "Token expired or invalid";
            } else if (err.response.status === 403) {
                errorMessage += "You don't have permission to perform this action.";
                technicalDetails = "Insufficient permissions";
            } else if (err.response.status === 404) {
                errorMessage += "Stock or resource not found.";
                technicalDetails = `Resource not found: ${err.response.data.message || 'Unknown'}`;
            } else if (err.response.status === 429) {
                errorMessage += "Too many requests. Please try again later.";
                technicalDetails = "Rate limit exceeded";
            } else if (err.response.status >= 500) {
                errorMessage += "Server error. Please try again later.";
                technicalDetails = `Server error: ${err.response.status}`;
            } else {
                errorMessage += err.response.data.message || "An unexpected error occurred.";
                technicalDetails = `Status: ${err.response.status}`;
            }
        } else if (err.request) {
            errorMessage += "No response from server. Please check your internet connection.";
            technicalDetails = "Network request failed";
        } else {
            errorMessage += err.message || "An unexpected error occurred.";
            technicalDetails = err.stack;
        }

        showDetailedErrorToast(errorMessage, technicalDetails);
        
        dispatch({
            type: GET_ERRORS,
            payload: err.response?.data || { message: errorMessage, technicalDetails }
        });
    }
};

// Sell Stock Action
export const sellStock = (userData, tradeInfo) => async (dispatch) => {
    try {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            setAuthToken(token);
        }

        const response = await axios.get(`/api/stocks/price/${tradeInfo.symbol}`);
        
        if (!response.data || !response.data.valid) {
            showDetailedErrorToast(
                "Unable to fetch stock data at this time",
                `Invalid response for symbol: ${tradeInfo.symbol}`
            );
            throw new Error("Invalid stock data received");
        }

        const stockInfo = {
            "1. open": response.data.openPrice.toString(),
            "2. high": response.data.currentPrice.toString(),
            "3. low": response.data.currentPrice.toString(),
            "4. close": response.data.currentPrice.toString(),
            "5. volume": "0"
        };

        const tradeData = {
            userId: userData.id,
            symbol: tradeInfo.symbol,
            quantity: tradeInfo.quantity.toString(),
            stockInfo
        };

        const sellResponse = await axios.post("/api/users/sellStock", tradeData);
        dispatch(returnSale(sellResponse.data));

        // Update user data after successful sale
        const updatedUserResponse = await axios.get("/api/users/current");
        dispatch({
            type: SET_CURRENT_USER,
            payload: updatedUserResponse.data
        });

        showSuccessToast(`Successfully sold ${tradeInfo.quantity} shares of ${tradeInfo.symbol}`);

    } catch (err) {
        console.error(err);
        let errorMessage = "Failed to sell stock. ";
        let technicalDetails = null;
        
        if (err.response) {
            // Server responded with an error
            if (err.response.status === 400) {
                errorMessage += "Invalid request parameters.";
                technicalDetails = err.response.data.message;
            } else if (err.response.status === 401) {
                errorMessage += "Authentication error. Please log in again.";
                technicalDetails = "Token expired or invalid";
            } else if (err.response.status === 403) {
                errorMessage += "You don't have permission to perform this action.";
                technicalDetails = "Insufficient permissions";
            } else if (err.response.status === 404) {
                errorMessage += "Stock or resource not found.";
                technicalDetails = `Resource not found: ${err.response.data.message || 'Unknown'}`;
            } else if (err.response.status === 429) {
                errorMessage += "Too many requests. Please try again later.";
                technicalDetails = "Rate limit exceeded";
            } else if (err.response.status >= 500) {
                errorMessage += "Server error. Please try again later.";
                technicalDetails = `Server error: ${err.response.status}`;
            } else {
                errorMessage += err.response.data.message || "An unexpected error occurred.";
                technicalDetails = `Status: ${err.response.status}`;
            }
        } else if (err.request) {
            errorMessage += "No response from server. Please check your internet connection.";
            technicalDetails = "Network request failed";
        } else {
            errorMessage += err.message || "An unexpected error occurred.";
            technicalDetails = err.stack;
        }

        showDetailedErrorToast(errorMessage, technicalDetails);
        
        dispatch({
            type: GET_ERRORS,
            payload: err.response?.data || { message: errorMessage, technicalDetails }
        });
    }
};

// Update Stocks Action
export const updateStocks = (userData) => async (dispatch) => {
    try {
        const data = { id: userData.id };
        const response = await axios.post("/api/users/updateStocks", data);
        dispatch(returnUpdate(response.data));
    } catch (err) {
        let errorMessage = "Failed to update stocks. ";
        let technicalDetails = null;
        
        if (err.response) {
            // Server responded with an error
            if (err.response.status === 400) {
                errorMessage += "Invalid request parameters.";
                technicalDetails = err.response.data.message;
            } else if (err.response.status === 401) {
                errorMessage += "Authentication error. Please log in again.";
                technicalDetails = "Token expired or invalid";
            } else if (err.response.status === 403) {
                errorMessage += "You don't have permission to perform this action.";
                technicalDetails = "Insufficient permissions";
            } else if (err.response.status === 404) {
                errorMessage += "Stock or resource not found.";
                technicalDetails = `Resource not found: ${err.response.data.message || 'Unknown'}`;
            } else if (err.response.status === 429) {
                errorMessage += "Too many requests. Please try again later.";
                technicalDetails = "Rate limit exceeded";
            } else if (err.response.status >= 500) {
                errorMessage += "Server error. Please try again later.";
                technicalDetails = `Server error: ${err.response.status}`;
            } else {
                errorMessage += err.response.data.message || "An unexpected error occurred.";
                technicalDetails = `Status: ${err.response.status}`;
            }
        } else if (err.request) {
            errorMessage += "No response from server. Please check your internet connection.";
            technicalDetails = "Network request failed";
        } else {
            errorMessage += err.message || "An unexpected error occurred.";
            technicalDetails = err.stack;
        }

        showDetailedErrorToast(errorMessage, technicalDetails);
        
        dispatch({
            type: GET_ERRORS,
            payload: err.response?.data || { message: errorMessage, technicalDetails }
        });
    }
};

// Action Creators
export const returnPurchase = (userData) => ({
    type: BUY_STOCK,
    payload: userData
});

export const returnSale = (userData) => ({
    type: SELL_STOCK,
    payload: userData
});

export const returnUpdate = (userData) => ({
    type: UPDATE_STOCKS,
    payload: userData
});
