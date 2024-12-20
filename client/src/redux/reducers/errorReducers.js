import { GET_ERRORS } from "../actions/types";

const initialState = {};

// Export the named function
export default function errorReducer(state = initialState, action) {
    switch (action.type) {
        case GET_ERRORS:
            return action.payload;
        default:
            return state;
    }
}
