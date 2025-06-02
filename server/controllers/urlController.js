// server/controllers/urlController.js
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const axios = require('axios');
const Summary = require('../models/Summary'); // Assuming your Summary model
const { summarizeText } = require('../utils/openai');

exports.urlSummarize = async (req, res) => {
  try {
    // 1. Extract URL and new options from req.body
    const { url, summaryType, summaryLength, focus } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ message: 'Please provide a URL.' });
    }

    // Basic URL validation
    try {
        new URL(url);
    } catch (_) {
        return res.status(400).json({ message: 'Invalid URL format provided.' });
    }

    // 2. Validate summaryType and summaryLength
    const validTypes = ['abstractive', 'extractive'];
    const validLengths = ['short', 'medium', 'long'];

    if (summaryType && !validTypes.includes(summaryType)) {
        return res.status(400).json({ message: 'Invalid summary type provided.' });
    }
    if (summaryLength && !validLengths.includes(summaryLength)) {
        return res.status(400).json({ message: 'Invalid summary length provided.' });
    }

    // 3. Fetch HTML using axios
    let html;
    try {
      const response = await axios.get(url, {
        timeout: 15000, // Increased timeout
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 NeuroBriefBot/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      html = response.data;
    } catch (fetchErr) {
      console.error('URL fetch error:', fetchErr.code || fetchErr.message);
      let statusCode = 400;
      let message = `Could not fetch URL.`;
      if (fetchErr.code === 'ECONNABORTED' || fetchErr.code === 'ETIMEDOUT') {
        statusCode = 408; // Request Timeout
        message = 'The request to the URL timed out.';
      } else if (fetchErr.response) {
        statusCode = fetchErr.response.status;
        message = `Could not fetch URL (Status: ${statusCode}). The page might be unavailable or access forbidden.`;
      } else if (fetchErr.request) {
        message = 'Could not fetch URL. No response received from the server.';
      }
      return res.status(statusCode).json({ message });
    }

    // 4. Parse & extract the main article text
    const dom = new JSDOM(html, { url }); // Pass the original URL to resolve relative links if Readability needs it
    const article = new Readability(dom.window.document).parse();

    if (!article || !article.textContent || article.textContent.trim().length < 100) { // Added a minimum length check
      return res.status(422).json({ message: 'Could not extract sufficient meaningful text from the page. The content might be too short, primarily non-textual, or protected.' });
    }

    // 5. Summarize, passing along options
    // Map summaryType to 'style' and summaryLength to 'length'
    const summary = await summarizeText(article.textContent, {
      style: summaryType || 'abstractive',
      length: summaryLength || 'medium',
      focus: focus || ''
    });

    // 6. Persist to DB
    const record = await Summary.create({
      user: req.user, // Assuming req.user is set by auth middleware
      inputType: 'url',
      input: url,
      summary,
      summaryOptions: {
        type: summaryType || 'abstractive',
        length: summaryLength || 'medium',
        focus: focus || ''
      }
    });

    return res.json({ summary, id: record._id });

  } catch (err) {
    console.error('URL processing error:', err);
    if (err.response && err.response.data) { // Axios error structure from OpenAI
        return res.status(err.response.status || 500).json({ message: err.response.data.error?.message || 'Error communicating with summarization service.' });
    }
    if (err.message && (err.message.includes('extract meaningful text') || err.message.includes('Readability'))) {
        return res.status(422).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error while processing URL.' });
  }
};
