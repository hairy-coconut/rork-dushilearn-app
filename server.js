const express = require('express');
const path = require('path');
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/_expo', express.static(path.join(__dirname, 'dist/_expo')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'dist/favicon.ico')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'DushiLearn', version: '1.0.0' });
});

// API routes (for future backend integration)
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'DushiLearn API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve the React Native web app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌴 DushiLearn server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📱 App ready for users!`);
});

module.exports = app;