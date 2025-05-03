// server/controllers/urlController.js

const { JSDOM }        = require('jsdom');
const { Readability }  = require('@mozilla/readability');
const Summary          = require('../models/Summary');
const { summarizeText }= require('../utils/openai');

exports.urlSummarize = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'No URL provided.' });

    // 1. Fetch with timeout
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    const response   = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(422).json({ message: `Failed to fetch URL (status ${response.status})` });
    }

    // 2. Parse out the main article text
    const html      = await response.text();
    const dom       = new JSDOM(html, { url });
    const article   = new Readability(dom.window.document).parse();
    if (!article?.textContent) {
      return res.status(422).json({ message: 'Could not extract article content.' });
    }

    // 3. Summarize via OpenAI
    const summary = await summarizeText(article.textContent);

    // 4. Save & return
    const record = await Summary.create({
      user: req.user,
      inputType: 'url',
      input: url,
      summary
    });

    res.json({ summary, id: record._id });
  } catch (err) {
    console.error('URL processing error:', err);
    if (err.name === 'AbortError') {
      return res.status(408).json({ message: 'URL fetch timed out.' });
    }
    res.status(500).json({ message: 'URL processing error.' });
  }
};
