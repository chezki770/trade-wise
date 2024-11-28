import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";

import {
    GET_ERRORS,
    BUY_STOCK,
    SELL_STOCK,
    UPDATE_STOCKS
} from "./types";

const BASE_URL = "https://www.alphavantage.co/query?";
const API_KEY = "&apikey=5ETEDSPX3VTJD6TR";

// Helper function to fetch stock info
const fetchStockInfo = async (symbol) => {
    try {
        const response = await axios.get(`${BASE_URL}function=TIME_SERIES_DAILY&symbol=${symbol}${API_KEY}`);
        const data = response.data["Time Series (Daily)"];
        if (!data) throw new Error("Invalid symbol or no data available");

        const latestDate = Object.keys(data)[0];
        const stockInfo = data[latestDate];

        if (!stockInfo) throw new Error("Failed to retrieve stock data for the latest date");

        return stockInfo;
    } catch (err) {
        throw new Error(`Stock API Error: ${err.message}`);
    }
};

// Buy Stock Action
export const buyStock = (userData, tradeInfo) => async (dispatch) => {
    try {
        // Set Authorization Header
        const token = localStorage.getItem("jwtToken");
        if (token) setAuthToken(token);

        // Validate and fetch stock info
        const stockInfo = await fetchStockInfo(tradeInfo.symbol);

        const tradeData = {
            userId: userData.id,
            symbol: tradeInfo.symbol,
            quantity: tradeInfo.quantity.toString(),
            stockInfo
        };

        // Make the purchase request
        const response = await axios.post("/api/users/buyStock", tradeData);
        dispatch(returnPurchase(response.data));
    } catch (err) {
        dispatch({
            type: GET_ERRORS,
            payload: err.message || "An error occurred while buying the stock"
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
        const response = await axios.post("/server/api/users/sellStock", tradeData);
        dispatch(returnSale(response.data));
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
        const response = await axios.post("/server/api/users/updateStocks", data);
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
