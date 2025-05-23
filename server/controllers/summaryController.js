const Summary = require('../models/Summary');
const { summarizeText } = require('../utils/openai');

exports.textSummarize = async (req, res) => {
  try {
    const userId = req.user;           // set by auth middleware
    const { text, length, focus, style } = req.body;


    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'No text provided.' });
    }

    // 1. Call OpenAI
const summary = await summarizeText(text, { length, focus, style });

    // 2. Persist summary
    const record = await Summary.create({
      user: userId,
      inputType: 'text',
      input: text,
      summary
    });

    // 3. Return result
    res.json({ summary, id: record._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during summarization.' });
  }
};
