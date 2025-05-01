require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns'); // you missed importing this earlier!
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false })); // ✅ add this

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = [];
let id = 1;

// POST: create short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  
  // Validate URL
  try {
    const parsedUrl = new URL(originalUrl);

    // Basic check: must be http/https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    // DNS check (optional but better validation)
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Store in memory
        const entry = { original_url: originalUrl, short_url: id };
        urlDatabase.push(entry);
        res.json(entry);
        id++;
      }
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// GET: redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrlId = parseInt(req.params.short_url);
  const entry = urlDatabase.find(item => item.short_url === shortUrlId);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
