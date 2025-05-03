// server/utils/openai.js
require('dotenv').config();            // if you ever load envs here

// Import the default OpenAI class
const OpenAI = require('openai').default || require('openai');
// Instantiate with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Summarize a given text using GPT.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function summarizeText(text) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that provides concise, factual summaries.' },
      { role: 'user',   content: `Summarize the following text in 3–5 bullet points:\n\n${text}` }
    ],
    max_tokens: 200,
    temperature: 0.3
  });

  // The API returns: { choices: [{ message: { content: '...' } }, …] }
  return completion.choices[0].message.content.trim();
}

module.exports = { summarizeText };
