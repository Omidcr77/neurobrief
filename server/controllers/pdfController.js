// server/controllers/pdfController.js
const fs = require('fs');
const pdf = require('pdf-parse');
const Summary = require('../models/Summary'); // Assuming your Summary model
const { summarizeText } = require('../utils/openai');

exports.pdfSummarize = async (req, res) => {
  try {
    // 1. Guard against no upload
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    // 2. Extract new options from req.body (sent via FormData on the client)
    // The client-side SummarizePage.js appends these to the FormData
    const { summaryType, summaryLength, focus } = req.body;

    // 3. Validate summaryType and summaryLength
    const validTypes = ['abstractive', 'extractive'];
    const validLengths = ['short', 'medium', 'detailed'];

    if (summaryType && !validTypes.includes(summaryType)) {
        return res.status(400).json({ message: 'Invalid summary type provided.' });
    }
    if (summaryLength && !validLengths.includes(summaryLength)) {
        return res.status(400).json({ message: 'Invalid summary length provided.' });
    }

    // 4. Read and extract text from PDF
    let dataBuffer;
    try {
        dataBuffer = fs.readFileSync(req.file.path);
    } catch (readError) {
        console.error('Error reading PDF file:', readError);
        // Clean up uploaded file if reading fails
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp PDF file after read error:', unlinkErr);
            });
        }
        return res.status(500).json({ message: 'Error reading PDF file.' });
    }

    const pdfData = await pdf(dataBuffer);
    const fullText = pdfData.text?.trim();

    if (!fullText) {
      // Clean up uploaded file if no text could be extracted
      if (req.file && req.file.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting temp PDF file after text extraction failure:', unlinkErr);
          });
      }
      return res.status(422).json({ message: 'Could not extract text from this PDF. The document might be image-based or corrupted.' });
    }

    // 5. Summarize and persist
    // Map summaryType to 'style' and summaryLength to 'length' for the openai utility
    const summary = await summarizeText(fullText, {
      style: summaryType || 'abstractive', // Default to abstractive
      length: summaryLength || 'medium',   // Default to medium
      focus: focus || ''                   // Default to empty string
    });

    const record = await Summary.create({
      user: req.user, // Assuming req.user is set by auth middleware
      inputType: 'pdf',
      inputFileName: req.file.originalname, // Store original filename
      // input: req.file.path, // Storing the path might be temporary; consider storing filename or a reference
      summary,
      summaryOptions: {
        type: summaryType || 'abstractive',
        length: summaryLength || 'medium',
        focus: focus || ''
      }
    });

    // 6. Clean up the uploaded file after successful processing
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temporary PDF file:', unlinkErr);
        });
    }

    return res.json({ summary, id: record._id });

  } catch (err) {
    console.error('PDF processing error:', err);
    // Clean up uploaded file in case of an unexpected error during summarization or DB operation
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp PDF file after general error:', unlinkErr);
        });
    }
    if (err.response && err.response.data) { // Axios error structure from OpenAI
        return res.status(err.response.status || 500).json({ message: err.response.data.error?.message || 'Error communicating with summarization service.' });
    }
    if (err.message && (err.message.includes('extract text') || err.message.includes('PDF'))) {
        return res.status(422).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error while processing PDF.' });
  }
};
