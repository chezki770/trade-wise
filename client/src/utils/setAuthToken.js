import axios from "axios";

// Set default base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:8080';

const setAuthToken = token => {
    if(token) {
        // Ensure the token starts with "Bearer "
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        // Store the full token in localStorage
        localStorage.setItem('jwtToken', authToken);
        
        // Apply authorization token to every request if logged in
        axios.defaults.headers.common["Authorization"] = authToken;
    } else {
        // Remove token from localStorage
        localStorage.removeItem('jwtToken');
        
        // Delete auth header
        delete axios.defaults.headers.common["Authorization"];
    }
};

export default setAuthToken;