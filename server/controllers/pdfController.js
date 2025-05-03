// server/controllers/pdfController.js

const fs      = require('fs');
const pdf     = require('pdf-parse');
const Summary = require('../models/Summary');
const { summarizeText } = require('../utils/openai');

exports.pdfSummarize = async (req, res) => {
  try {
    // 1. Read the uploaded file into a buffer
    const dataBuffer = fs.readFileSync(req.file.path);

    // 2. Extract text
    const pdfData = await pdf(dataBuffer);
    const fullText = pdfData.text;

    if (!fullText || fullText.trim().length === 0) {
      return res.status(422).json({ message: 'Could not extract any text from PDF.' });
    }

    // 3. Summarize via OpenAI
    const summary = await summarizeText(fullText);

    // 4. Persist to MongoDB
    const record = await Summary.create({
      user: req.user,
      inputType: 'pdf',
      input: req.file.path,
      summary
    });

    // 5. Return result
    res.json({ summary, id: record._id });
  } catch (err) {
    console.error('PDF processing error:', err);
    res.status(500).json({ message: 'PDF processing error.' });
  }
};
 