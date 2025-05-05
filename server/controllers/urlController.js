// server/controllers/urlController.js
const { JSDOM }        = require('jsdom');
const { Readability }  = require('@mozilla/readability');
const Summary          = require('../models/Summary');
const { summarizeText }= require('../utils/openai');

exports.urlSummarize = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'Please provide a URL.' });
    }

    // 1️⃣ Fetch with timeout
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        return res.status(408).json({ message: 'URL fetch timed out.' });
      }
      console.error('DNS/fetch error:', fetchErr);
      return res.status(400).json({ message: 'Could not reach that host. Please check the URL.' });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return res
        .status(422)
        .json({ message: `Failed to fetch page (status ${response.status}).` });
    }

    // 2️⃣ Extract main content
    const html    = await response.text();
    const dom     = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article?.textContent) {
      return res.status(422).json({ message: 'Could not extract meaningful text from page.' });
    }

    // 3️⃣ Summarize & persist
    const summary = await summarizeText(article.textContent);
    const record  = await Summary.create({
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
