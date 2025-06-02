const fs = require('fs');
const pdf = require('pdf-parse');
const Summary = require('../models/Summary');
const { summarizeText } = require('../utils/openai');

exports.pdfSummarize = async (req, res) => {
  try {
    // 1. Guard against no upload
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    // 2. Extract new options from req.body
    const { summaryType, summaryLength, focus } = req.body;

    // 3. Validate summaryType and summaryLength
    const validTypes = ['abstractive', 'extractive'];
    const validLengths = ['short', 'medium', 'long'];

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
      if (req.file && req.file.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting temp PDF file after text extraction failure:', unlinkErr);
          });
      }
      return res.status(422).json({ message: 'Could not extract text from this PDF. The document might be image-based or corrupted.' });
    }

    // 5. Summarize and persist - FIXED: Added input: fullText
    const summary = await summarizeText(fullText, {
      style: summaryType || 'abstractive',
      length: summaryLength || 'medium',
      focus: focus || ''
    });

    const record = await Summary.create({
      user: req.user,
      inputType: 'pdf',
      inputFileName: req.file.originalname,
      input: fullText, // ADDED THIS CRITICAL LINE
      summary,
      summaryOptions: {
        type: summaryType || 'abstractive',
        length: summaryLength || 'medium',
        focus: focus || ''
      }
    });

    // 6. Clean up the uploaded file
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temporary PDF file:', unlinkErr);
        });
    }

    return res.json({ summary, id: record._id });

  } catch (err) {
    console.error('PDF processing error:', err);
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp PDF file after general error:', unlinkErr);
        });
    }
    if (err.response && err.response.data) {
        return res.status(err.response.status || 500).json({ message: err.response.data.error?.message || 'Error communicating with summarization service.' });
    }
    if (err.message && (err.message.includes('extract text') || err.message.includes('PDF'))) {
        return res.status(422).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error while processing PDF.' });
  }
};