const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static('dist'));
app.use('/assets', express.static('assets'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'DushiLearn', version: '1.0.0' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log('DushiLearn running on port ' + PORT);
});