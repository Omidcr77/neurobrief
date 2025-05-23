// server/controllers/pdfController.js
const fs      = require('fs');
const pdf     = require('pdf-parse');
const Summary = require('../models/Summary');
const { summarizeText } = require('../utils/openai');

exports.pdfSummarize = async (req, res) => {
  try {
    // 1️⃣ Guard against no upload
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    const { length, focus, style } = req.body; // ← new options

    // 2️⃣ Read and extract
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData    = await pdf(dataBuffer);
    const fullText   = pdfData.text?.trim();

    if (!fullText) {
      return res.status(422).json({ message: 'Could not extract text from this PDF.' });
    }

    // 3️⃣ Summarize and persist
const summary = await summarizeText(
     fullText,      { length, focus, style }                                // ← forward options here
   );    const record  = await Summary.create({
      user: req.user,
      inputType: 'pdf',
      input: req.file.path,
      summary
    });

    return res.json({ summary, id: record._id });
  } catch (err) {
    console.error('PDF processing error:', err);
    return res.status(500).json({ message: 'Server error while processing PDF.' });
  }
};
