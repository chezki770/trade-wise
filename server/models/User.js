const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the held stock schema
const heldStockSchema = new Schema({
    symbol: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit_price: {
        type: Number,
        required: true
    },
    open_price: {
        type: Number,
        required: true
    }
});

// Define the transaction schema
const transactionSchema = new Schema({
    transaction_type: {
        type: String, // BUY or SELL
        required: true,
        enum: ['BUY', 'SELL']  // Restrict to these values
    },
    symbol: {
        type: String,
        required: true
    },
    stock_price: {
        type: Number,
        required: true
    },
    stock_quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Define the main user schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    balance: {
        type: Number,
        default: 100000.00
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    // Add transactions and ownedStocks directly to the schema
    transactions: {
        type: [transactionSchema],
        default: []
    },
    ownedStocks: {
        type: [heldStockSchema],
        default: []
    }
});

// The issue was using virtual(). Instead, we include the arrays directly in the schema above.
// Remove the virtual definition as it's not needed anymore:
// UserSchema.virtual("transactions", {
//     transactions: [ transactionSchema ],
//     ownedStocks: [ heldStockSchema ]
// });

// Create and export the model
const User = mongoose.model("users", UserSchema);
module.exports = User;