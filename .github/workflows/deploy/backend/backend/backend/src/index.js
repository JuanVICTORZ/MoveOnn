const express = require('express');
const bodyParser = require('body-parser');
const llmRoutes = require('./llm_adapter/routes');

const app = express();
app.use(bodyParser.json());

app.use('/api/llm', llmRoutes);

// simple health
app.get('/health', (req, res) => res.json({status: 'ok'}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Move ON backend listening on ${PORT}`));
