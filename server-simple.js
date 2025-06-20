const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
console.log('Starting DushiLearn server...');
console.log('PORT env var:', process.env.PORT);
console.log('Will bind to port:', PORT);

// Simple MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

// Build the app if dist doesn't exist
function buildApp() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path.join(__dirname, 'dist'))) {
      console.log('Dist folder exists, skipping build');
      resolve();
      return;
    }
    
    console.log('Building app...');
    exec('npm run build:web', (error, stdout, stderr) => {
      if (error) {
        console.error('Build failed:', error);
        reject(error);
      } else {
        console.log('Build completed successfully');
        resolve();
      }
    });
  });
}

function createServer() {
  const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check endpoints
    if (req.url === '/health' || req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        app: 'DushiLearn',
        timestamp: new Date().toISOString(),
        port: PORT
      }));
      return;
    }

    // Determine file path
    let filePath;
    if (req.url === '/') {
      filePath = path.join(__dirname, 'dist', 'index.html');
    } else {
      filePath = path.join(__dirname, 'dist', req.url);
    }

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // For SPA routing, serve index.html for routes that don't exist
        if (!req.url.includes('.') && !req.url.startsWith('/_expo') && !req.url.startsWith('/assets')) {
          filePath = path.join(__dirname, 'dist', 'index.html');
        } else {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
      }

      // Read and serve the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
  });

  // Error handling
  server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is already in use`);
      process.exit(1);
    }
  });

  // Start server
  server.listen(PORT, () => {
    console.log(`🌴 DushiLearn server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 App ready!`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  return server;
}

// Start the application
buildApp()
  .then(() => {
    createServer();
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });