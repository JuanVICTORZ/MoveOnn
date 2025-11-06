const express = require('express');
const router = express.Router();
const LLM = require('./service');

router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    const response = await LLM.chat({ message, userId });
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM chat error' });
  }
});

router.post('/report', async (req, res) => {
  try {
    const { userId, period } = req.body;
    const report = await LLM.generateReport({ userId, period });
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM report error' });
  }
});

router.post('/suggest', async (req, res) => {
  try {
    const { context } = req.body;
    const suggestions = await LLM.suggest({ context });
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM suggest error' });
  }
});

module.exports = router;
