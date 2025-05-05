const mongoose = require('mongoose');
const User     = require('../models/User');
const Summary  = require('../models/Summary');

exports.getMetrics = async (req, res) => {
  try {
    // 1. Total counts
    const userCount    = await User.countDocuments();
    const summaryCount = await Summary.countDocuments();

    // 2. Summaries by type
    const byTypeAgg = await Summary.aggregate([
      { $group: { _id: '$inputType', count: { $sum: 1 } } }
    ]);
    // shape into an object { text: xx, pdf: yy, url: zz }
    const summariesByType = byTypeAgg.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, { text: 0, pdf: 0, url: 0 });

    // 3. Daily summaries over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyAgg = await Summary.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // fill in missing dates with zero counts
    const dailySummaryCounts = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const found = dailyAgg.find(x => x._id === key);
      dailySummaryCounts.push({
        date: key,
        count: found ? found.count : 0
      });
    }

    // 4. Respond
    res.json({
      userCount,
      summaryCount,
      summariesByType,
      dailySummaryCounts
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ message: 'Server error fetching admin metrics.' });
  }
};
