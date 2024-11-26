import {
    BUY_STOCK,
    SELL_STOCK,
    UPDATE_STOCKS
} from "../actions/types";

/**
 * @typedef {Object} StockState
 * @property {Object} user - User data including portfolio
 * @property {Array} transactions - List of stock transactions
 * @property {boolean} loading - Loading state for async operations
 * @property {Object|null} error - Error state
 * @property {number} lastUpdated - Timestamp of last update
 */

/**
 * Initial state for stock reducer
 * @type {StockState}
 */
const initialState = {
    user: {
        portfolio: [],
        balance: 0
    },
    transactions: [],
    loading: false,
    error: null,
    lastUpdated: null
};

/**
 * Stock reducer
 * @param {StockState} state - Current state
 * @param {Object} action - Redux action
 * @returns {StockState} New state
 */
export default function stockReducer(state = initialState, action) {
    switch(action.type) {
        case BUY_STOCK:
            return {
                ...state,
                user: action.payload,
                loading: false,
                error: null,
                lastUpdated: Date.now(),
                transactions: [
                    ...state.transactions,
                    { type: 'BUY', ...action.payload.transaction }
                ]
            };
            
        case SELL_STOCK:
            return {
                ...state,
                user: action.payload,
                loading: false,
                error: null,
                lastUpdated: Date.now(),
                transactions: [
                    ...state.transactions,
                    { type: 'SELL', ...action.payload.transaction }
                ]
            };
            
        case UPDATE_STOCKS:
            return {
                ...state,
                user: action.payload,
                loading: false,
                error: null,
                lastUpdated: Date.now()
            };
            
        case `${BUY_STOCK}_PENDING`:
        case `${SELL_STOCK}_PENDING`:
        case `${UPDATE_STOCKS}_PENDING`:
            return {
                ...state,
                loading: true,
                error: null
            };
            
        case `${BUY_STOCK}_REJECTED`:
        case `${SELL_STOCK}_REJECTED`:
        case `${UPDATE_STOCKS}_REJECTED`:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
            
        default:
            return state;
    }
}