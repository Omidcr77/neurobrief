// server/controllers/adminController.js
const mongoose     = require('mongoose');
const { Parser }   = require('json2csv');
const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const Summary      = require('../models/Summary');

// 1. List & filter users
exports.listUsers = async (req, res) => {
  const { page = 1, limit = 20, q, role, status } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { name:  new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') }
    ];
  }
  if (role)   filter.role   = role;
  if (status) filter.status = status;

  const [users, total] = await Promise.all([
    User.find(filter)
        .select('-passwordHash')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
    User.countDocuments(filter)
  ]);

  res.json({ users, total });
};

// 2. Get single user
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

// 3. Update profile & role
exports.updateUser = async (req, res) => {
  const updates = {};
  ['name', 'email', 'role'].forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

// 4. Change status
exports.changeStatus = async (req, res) => {
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

// 5. **Hard Delete** (true delete, not just deactivate)
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.status(204).send();
};

// 6. Impersonate user
exports.impersonateUser = async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found.' });
  const token = jwt.sign(
    { id: target._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
};
// ─── 7. Built-in metrics (your old getMetrics) ──────────────────────
exports.getMetrics = async (req, res) => {
  try {
    // total users & summaries
    const [ userCount, summaryCount ] = await Promise.all([
      User.countDocuments(),
      Summary.countDocuments()
    ]);

    // breakdown by inputType
    const byType = await Summary.aggregate([
      { $group: { _id: '$inputType', count: { $sum: 1 } } }
    ]);
    const summariesByType = byType.reduce(
      (acc, { _id, count }) => ({ ...acc, [ _id ]: count }),
      {}
    );

    // last 7 days of summary counts
    const sevenDaysAgo = new Date(Date.now() - 6*24*60*60*1000);
    const dailyAgg = await Summary.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);
    // fill in zeros for missing days
    const dailySummaryCounts = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - (6 - i)*24*60*60*1000);
      const key = d.toISOString().slice(0,10);
      const found = dailyAgg.find(x => x._id === key);
      dailySummaryCounts.push({ date: key, count: found ? found.count : 0 });
    }

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

// ─── 8. User-activity report (registrations per day) ────────────────
exports.userActivity = async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 6*24*60*60*1000);
  const agg = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
    }},
    { $sort: { '_id': 1 } }
  ]);
  res.json({ dailyRegistrations: agg });
};

// ─── 9. Summary-trends report ────────────────────────────────────────
exports.summaryTrends = async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 6*24*60*60*1000);
  const agg = await Summary.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: {
        _id: {
          date:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          length: '$length',
          style:  '$style'
        },
        count: { $sum: 1 }
    }},
    { $sort: { '_id.date': 1 } }
  ]);
  res.json({ trends: agg });
};

// ─── 10. CSV/Excel exports ────────────────────────────────────────────
exports.exportData = async (req, res) => {
  const { type } = req.params;
  let docs;
  if (type === 'users') {
    docs = await User.find().select('-passwordHash -__v').lean();
  } else if (type === 'summaries') {
    docs = await Summary.find().lean();
  } else {
    return res.status(400).json({ message: 'Invalid export type.' });
  }

  const fields = Object.keys(docs[0] || {});
  const parser = new Parser({ fields });
  const csv    = parser.parse(docs);

  res.header('Content-Type', 'text/csv');
  res.attachment(`${type}.csv`); 
  res.send(csv);
};
