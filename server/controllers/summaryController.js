// server/controllers/summaryController.js
const Summary = require('../models/Summary'); // Assuming you have a Summary model
const { summarizeText } = require('../utils/openai');

exports.textSummarize = async (req, res) => {
  try {
    const userId = req.user; // Set by auth middleware
    // Destructure new parameters: summaryType and summaryLength
    // Also retrieve existing 'text' and 'focus'
    const { text, summaryType, summaryLength, focus } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'No text provided.' });
    }

    // Validate summaryType and summaryLength if necessary
    const validTypes = ['abstractive', 'extractive'];
    const validLengths = ['short', 'medium', 'long'];

    if (summaryType && !validTypes.includes(summaryType)) {
        return res.status(400).json({ message: 'Invalid summary type provided.' });
    }
    if (summaryLength && !validLengths.includes(summaryLength)) {
        return res.status(400).json({ message: 'Invalid summary length provided.' });
    }

    // 1. Call OpenAI
    // Map summaryType to 'style' and summaryLength to 'length' for the openai utility
    const summary = await summarizeText(text, {
      style: summaryType || 'abstractive', // Default to abstractive if not provided
      length: summaryLength || 'medium',   // Default to medium if not provided
      focus: focus || ''                   // Default to empty string if not provided
    });

    // 2. Persist summary (optional, based on your application's needs)
    // Ensure your Summary model can store these new options if you want to track them
    const record = await Summary.create({
      user: userId,
      inputType: 'text',
      input: text, // Storing the first 500 chars for brevity, or full text if preferred
      summary,
      summaryOptions: { // Example of storing options used
        type: summaryType || 'abstractive',
        length: summaryLength || 'medium',
        focus: focus || ''
      }
    });

    // 3. Return result
    res.json({ summary, id: record._id });

  } catch (err) {
    console.error('Error in textSummarize controller:', err);
    // Check if the error is from OpenAI or a general server error
    if (err.response && err.response.data) { // Axios error structure from OpenAI
        return res.status(err.response.status || 500).json({ message: err.response.data.error?.message || 'Error communicating with summarization service.' });
    }
    res.status(500).json({ message: 'Server error during summarization.' });
  }
};

// Note: You would need similar updates for pdfSummarize and urlSummarize
// in their respective controllers (pdfController.js, urlController.js)
// to accept and pass summaryType, summaryLength, and focus.
// For example, in pdfController.js, these would likely come from req.body
// alongside the file.
