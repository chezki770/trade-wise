const mongoose = require('mongoose');

const apiUsageSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  responseStatus: {
    type: Number,
    required: true,
  },
  provider: {
    type: String,
    enum: ['ALPHA_VANTAGE', 'INTERNAL'],
    required: true,
  },
});

// Index for efficient querying by date
apiUsageSchema.index({ timestamp: 1 });
apiUsageSchema.index({ provider: 1, timestamp: 1 });

module.exports = mongoose.model('ApiUsage', apiUsageSchema);
