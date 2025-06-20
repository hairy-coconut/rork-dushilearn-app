const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Disable Express etag to avoid caching issues
app.disable('etag');

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'DushiLearn', version: '1.0.0' });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'DushiLearn API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle all routes by serving the appropriate HTML file or fallback to index.html
app.get('*', (req, res) => {
  let filePath;
  
  // Remove leading slash and handle root
  const cleanPath = req.path === '/' ? 'index' : req.path.slice(1);
  
  // Try to find the corresponding HTML file
  const possiblePaths = [
    path.join(__dirname, 'dist', `${cleanPath}.html`),
    path.join(__dirname, 'dist', cleanPath, 'index.html'),
    path.join(__dirname, 'dist', 'index.html') // fallback
  ];
  
  // Find the first existing file
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      break;
    }
  }
  
  if (filePath) {
    res.sendFile(filePath);
  } else {
    res.status(404).sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
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