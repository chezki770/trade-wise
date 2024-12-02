const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'failed'],
        default: 'completed'
    },
    executedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total before saving
tradeSchema.pre('save', function(next) {
    this.total = this.price * this.quantity;
    next();
});

// Indexes for better query performance
tradeSchema.index({ user: 1, executedAt: -1 });
tradeSchema.index({ symbol: 1, executedAt: -1 });
tradeSchema.index({ status: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
