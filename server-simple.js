const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;

// Build the app if dist doesn't exist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Building app...');
  exec('npm run build:web', (error, stdout, stderr) => {
    if (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
    console.log('Build completed');
    startServer();
  });
} else {
  startServer();
}

function startServer() {

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
  '.woff2': 'font/woff2'
};

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

  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // For SPA routing, serve index.html for non-asset requests
    if (!req.url.includes('.') && !req.url.startsWith('/_expo') && !req.url.startsWith('/assets')) {
      filePath = path.join(__dirname, 'dist', 'index.html');
      // If dist/index.html doesn't exist, serve fallback
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'public', 'index.html');
      }
    } else {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DushiLearn server running on port ${PORT}`);
});

}