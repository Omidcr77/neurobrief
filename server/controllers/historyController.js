// server/controllers/historyController.js
const Summary = require('../models/Summary');

/**
 * GET /api/summaries
 * Return all summaries for the logged-in user.
 */
exports.getAllSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.user })
      .select('-__v')               // hide mongoose internals
      .sort({ createdAt: -1 });     // newest first
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching summaries.' });
  }
};

/**
 * GET /api/summaries/:id
 * Return a single summary (with full input) by ID.
 */
exports.getSummaryById = async (req, res) => {
  try {
    const record = await Summary.findOne({
      _id: req.params.id,
      user: req.user
    });
    if (!record) return res.status(404).json({ message: 'Not found.' });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching summary.' });
  }
};

/**
 * DELETE /api/summaries/:id
 * Delete a summary by ID.
 */
exports.deleteSummary = async (req, res) => {
  try {
    const result = await Summary.deleteOne({
      _id: req.params.id,
      user: req.user
    });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: 'Not found or not yours.' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting summary.' });
  }
};
