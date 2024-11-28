const Validator = require("validator");
const isEmpty = require("is-empty");

function isValidTickerSymbol(symbol) {
    // Check if symbol is 1-5 uppercase letters
    return /^[A-Z]{1,5}$/.test(symbol);
}

module.exports = function validatePurchaseInput(data) {
    let errors = {};

    // Convert empty fields to empty strings for validation
    data.symbol = !isEmpty(data.symbol?.toString()) ? data.symbol.toString().toUpperCase() : "";
    
    // Handle quantity separately since it's a number
    const quantity = data.quantity !== undefined && data.quantity !== null ? 
        Number(data.quantity) : null;

    // Symbol validation
    if (isEmpty(data.symbol)) {
        errors.symbol = "A ticker symbol is required";
    } else if (!isValidTickerSymbol(data.symbol)) {
        errors.symbol = "Invalid ticker symbol format (1-5 uppercase letters)";
    }

    // Quantity validation
    if (quantity === null) {
        errors.quantity = "Quantity is required";
    } else if (isNaN(quantity)) {
        errors.quantity = "Quantity must be a number";
    } else if (!Number.isInteger(quantity)) {
        errors.quantity = "Quantity must be a whole number";
    } else if (quantity <= 0) {
        errors.quantity = "Quantity must be greater than zero";
    } else if (quantity > 1000000) {
        errors.quantity = "Quantity exceeds maximum allowed (1,000,000)";
    }

    // Log validation results for debugging
    console.log("Validation Input:", { 
        symbol: data.symbol, 
        quantity: quantity,
        originalQuantity: data.quantity 
    });
    console.log("Validation Errors:", errors);

    return {
        errors,
        isValid: isEmpty(errors)
    };
};