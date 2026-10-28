const llmService = require('../services/llmService');
const ragService = require('../services/ragService');

const generateAI = async (req, res) => {
  try {
    const { prompt, systemPrompt, jsonMode } = req.body;
    const response = await llmService.generateCompletion({ prompt, systemPrompt, jsonMode });
    return res.json({ response });
  } catch (error) {
    return res.status(500).json({ message: 'AI generation failed' });
  }
};

const ragAI = async (req, res) => {
  try {
    const { query, systemPrompt, jsonMode } = req.body;
    const ragResult = await ragService.answerWithRAG({ query, systemPrompt, jsonMode });
    return res.json(ragResult);
  } catch (error) {
    return res.status(500).json({ message: 'RAG completion failed' });
  }
};

const chatAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await llmService.generateCompletion({ prompt });
    return res.json({ answer: response });
  } catch (error) {
    return res.status(500).json({ message: 'AI chat failed' });
  }
};

module.exports = { generateAI, ragAI, chatAI };
