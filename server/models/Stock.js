const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockSchema = new Schema({
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    company_name: {
        type: String,
        required: true
    },
    current_price: {
        type: Number,
        required: true
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    daily_high: Number,
    daily_low: Number,
    opening_price: Number,
    previous_close: Number,
    volume: Number
});

module.exports = mongoose.model("stocks", StockSchema);