// server/utils/openai.js
require('dotenv').config();            // if you ever load envs here

const instructions = []


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
async function summarizeText(text, { length='medium', focus='', style='abstractive' } = {}) {
  // 1. Build your instruction array
  const instructions = [];

  // — Style
  if (style === 'extractive') {
    instructions.push("Provide an extractive summary by quoting the most important sentences.");
  } else if (style === 'bullets') {
    instructions.push("Summarize in clear bullet points.");
  } else {
    instructions.push("Write an abstractive summary in fluent prose.");
  }

  // — Length
  if (length === 'short') {
    instructions.push("Keep it under 50 words.");
  } else if (length === 'detailed') {
    instructions.push("Include abundant detail (at least 200 words).");
  } else {
    instructions.push("Aim for roughly 100 words.");
  }

  // — Focus areas
  if (focus && focus.trim()) {
    instructions.push(`Focus especially on: ${focus}.`);
  }

  // 2. Combine into a single prompt
  const userPrompt = [
    instructions.join(' '),
    "",
    "Here’s the text to summarize:",
    text
  ].join('\n');

  // 3. Adjust max_tokens for “detailed”
  const maxTokens = length === 'detailed' ? 600 : length === 'short' ? 100 : 300;

  // 4. Call OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that provides summaries.' },
      { role: 'user',   content: userPrompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.3
  });

  return completion.choices[0].message.content.trim();
}


module.exports = { summarizeText };
