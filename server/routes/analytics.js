const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Trade = require('../models/Trade');
const { Parser } = require('json2csv');

// Helper function to parse date range
const getDateRange = (req) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  return { startDate, endDate };
};

// @route   GET api/analytics/user-stats
// @desc    Get user statistics
// @access  Admin only
router.get('/user-stats', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { startDate, endDate } = getDateRange(req);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: startDate, $lte: endDate } 
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get login activity for the past two weeks
    const twoWeeksAgo = new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekLogins = await User.countDocuments({
      lastLogin: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    });
    const thisWeekLogins = await User.countDocuments({
      lastLogin: { $gte: oneWeekAgo, $lte: endDate }
    });

    res.json({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      lastWeekLogins,
      thisWeekLogins
    });
  } catch (err) {
    console.error('Error in user-stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/analytics/user-growth
// @desc    Get user growth data over time
// @access  Admin only
router.get('/user-growth', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { startDate, endDate } = getDateRange(req);

    const users = await User.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('createdAt');

    // Group users by month
    const monthlyData = {};
    users.forEach(user => {
      const month = user.createdAt.toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const labels = Object.keys(monthlyData);
    const values = Object.values(monthlyData);

    res.json({ labels, values });
  } catch (err) {
    console.error('Error in user-growth:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/analytics/user-activity
// @desc    Get user activity distribution
// @access  Admin only
router.get('/user-activity', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { startDate, endDate } = getDateRange(req);

    const active = await User.countDocuments({
      lastLogin: { $gte: startDate, $lte: endDate }
    });
    const total = await User.countDocuments();
    const inactive = total - active;

    res.json({ active, inactive });
  } catch (err) {
    console.error('Error in user-activity:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/analytics/trading-stats
// @desc    Get trading statistics
// @access  Admin only
router.get('/trading-stats', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { startDate, endDate } = getDateRange(req);

    const trades = await Trade.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalTrades = trades.length;
    const successfulTrades = trades.filter(trade => trade.profit > 0).length;
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    const totalVolume = trades.reduce((sum, trade) => sum + (trade.volume || 0), 0);

    // Get most traded pairs
    const pairCounts = {};
    trades.forEach(trade => {
      pairCounts[trade.pair] = (pairCounts[trade.pair] || 0) + 1;
    });

    const mostTradedPairs = Object.entries(pairCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pair, count]) => ({ pair, count }));

    res.json({
      totalTrades,
      successfulTrades,
      averageProfit: totalTrades > 0 ? totalProfit / totalTrades : 0,
      totalVolume,
      mostTradedPairs
    });
  } catch (err) {
    console.error('Error in trading-stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/analytics/export
// @desc    Export analytics data
// @access  Admin only
router.get('/export', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { startDate, endDate } = getDateRange(req);

    const trades = await Trade.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('user', 'email');

    const users = await User.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('-password');

    const fields = [
      'type',
      'date',
      'user',
      'pair',
      'volume',
      'profit',
      'status'
    ];

    const data = trades.map(trade => ({
      type: 'Trade',
      date: trade.createdAt,
      user: trade.user.email,
      pair: trade.pair,
      volume: trade.volume,
      profit: trade.profit,
      status: trade.profit > 0 ? 'Profit' : 'Loss'
    }));

    users.forEach(user => {
      data.push({
        type: 'User Registration',
        date: user.createdAt,
        user: user.email,
        status: user.isActive ? 'Active' : 'Inactive'
      });
    });

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`analytics_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error in export:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
