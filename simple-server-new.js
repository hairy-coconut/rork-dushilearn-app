const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function serveFile(filePath, res) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Remove leading slash
  if (pathname.startsWith('/')) {
    pathname = pathname.slice(1);
  }
  
  // If empty, serve index.html
  if (!pathname) {
    pathname = 'index.html';
  }
  
  // Try to serve static files from dist
  const distPath = path.join(__dirname, 'dist', pathname);
  if (serveFile(distPath, res)) {
    return;
  }
  
  // Try to serve assets
  const assetPath = path.join(__dirname, 'assets', pathname);
  if (serveFile(assetPath, res)) {
    return;
  }
  
  // Health check
  if (pathname === 'health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', app: 'DushiLearn', version: '1.0.0' }));
    return;
  }
  
  // For all other routes, serve the main index.html (SPA routing)
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (serveFile(indexPath, res)) {
    return;
  }
  
  // 404 fallback
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #00CED1, #FF6B35, #FFD700);
          color: white;
          min-height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .container {
          background: rgba(255,255,255,0.1);
          padding: 2rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌴 DushiLearn</h1>
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" style="color: white; text-decoration: underline;">Go Home</a>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`🌴 DushiLearn server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📱 Your React Native web app is ready!`);
  console.log(`\n📋 Deployment files ready in /dist folder`);
  console.log(`🚀 Deploy to production: Upload /dist folder to your hosting provider`);
});

module.exports = server;