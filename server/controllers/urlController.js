// server/controllers/urlController.js
const { JSDOM }        = require('jsdom');
const { Readability }  = require('@mozilla/readability');
const axios            = require('axios');
const Summary          = require('../models/Summary');
const { summarizeText }= require('../utils/openai');

exports.urlSummarize = async (req, res) => {
  try {
    const { url, length, focus, style } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'Please provide a URL.' });
    }

    // 1️⃣ Fetch HTML using axios (10s timeout, follow redirects, browser UA)
    let html;
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 5,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/115.0 Safari/537.36'
        }
      });
      html = response.data;
    } catch (fetchErr) {
      console.error('URL fetch error:', fetchErr.code || fetchErr.message);
      const statusCode = fetchErr.code === 'ECONNABORTED'
        ? 408
        : fetchErr.response
        ? fetchErr.response.status
        : 400;
      return res
        .status(statusCode)
        .json({ message: `Could not fetch URL (${fetchErr.code || fetchErr.message}).` });
    }

    // 2️⃣ Parse & extract the main article text
    const dom     = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article || !article.textContent) {
      return res.status(422).json({ message: 'Could not extract meaningful text from the page.' });
    }

    // 3️⃣ Summarize, passing along length/focus/style
    const summary = await summarizeText(article.textContent, { length, focus, style });

    // 4️⃣ Persist to DB
    const record = await Summary.create({
      user: req.user,
      inputType: 'url',
      input: url,
      summary
    });

    return res.json({ summary, id: record._id });
  } catch (err) {
    console.error('URL processing error:', err);
    return res.status(500).json({ message: 'Server error while processing URL.' });
  }
};
