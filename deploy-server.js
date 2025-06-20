const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/_expo', express.static(path.join(__dirname, '_expo')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'DushiLearn', version: '1.0.0' });
});

// Serve React Native app for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌴 DushiLearn running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});