import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";

import {
    GET_ERRORS,
    BUY_STOCK,
    SELL_STOCK,
    UPDATE_STOCKS,
    SET_CURRENT_USER
} from "./types";

// Helper function to fetch stock info
// const fetchStockInfo = async (symbol) => {
//     try {
//         const response = await axios.get(`/api/stock/price/${symbol}`);
//         const stockInfo = response.data;
        
//         if (!stockInfo) throw new Error("Failed to retrieve stock data");
        
//         return stockInfo;
//     } catch (err) {
//         throw new Error(`Stock API Error: ${err.message}`);
//     }
// };

const fetchStockInfo = async (symbol) => {
    try {
        console.log(`Fetching stock info for symbol: ${symbol}`);

        const response = await axios.get(`/api/stock/price/${symbol}`);
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
        const response = await axios.get(`/api/stock/price/${tradeInfo.symbol}`);

        if (!response.data || !response.data.valid) {
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

    } catch (err) {
        console.error("Error occurred in buyStock:", err);
        console.log("Error details:", err.message);
        
        dispatch({
            type: GET_ERRORS,
            payload: err.response?.data || {
                error: err.message || "Failed to complete stock purchase"
            }
        });
    }
};



// Sell Stock Action
export const sellStock = (userData, tradeInfo) => async (dispatch) => {
    try {
        // Validate and fetch stock info
        const stockInfo = await fetchStockInfo(tradeInfo.symbol);

        const tradeData = {
            userId: userData.id,
            symbol: tradeInfo.symbol,
            quantity: tradeInfo.quantity.toString(),
            stockInfo
        };

        // Make the sell request
        const sellResponse = await axios.post("/api/users/sellStock", tradeData);
        console.log("Sell request successful:", sellResponse.data);
        dispatch(returnSale(sellResponse.data));
        
        // Update user data after successful sale
        const updatedUserResponse = await axios.get("/api/users/current");
        dispatch({
            type: SET_CURRENT_USER,
            payload: updatedUserResponse.data
        });

    } catch (err) {
        dispatch({
            type: GET_ERRORS,
            payload: err.message || "An error occurred while selling the stock"
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
        dispatch({
            type: GET_ERRORS,
            payload: err.message || "An error occurred while updating stocks"
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
