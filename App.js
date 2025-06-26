import React, { useState, useEffect } from 'react';
import { TextField, Button, Card, CardContent, Typography, Grid, Snackbar } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LoggingMiddleware from './LoggingMiddleware';

const theme = createTheme();

const App = () => {
  const [urlEntries, setUrlEntries] = useState([{ id: uuidv4(), longUrl: '', validity: '', shortcode: '' }]);
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    LoggingMiddleware('App Initialized', 'INFO');
  }, []);

  const handleChange = (index, field, value) => {
    const entries = [...urlEntries];
    entries[index][field] = value;
    setUrlEntries(entries);
  };

  const addEntry = () => {
    if (urlEntries.length < 5) {
      setUrlEntries([...urlEntries, { id: uuidv4(), longUrl: '', validity: '', shortcode: '' }]);
    } else {
      setSnackbar({ open: true, message: 'Maximum of 5 URLs allowed.' });
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleShorten = async () => {
    const results = [];

    for (const entry of urlEntries) {
      const { longUrl, validity, shortcode } = entry;

      if (!validateUrl(longUrl)) {
        setSnackbar({ open: true, message: `Invalid URL: ${longUrl}` });
        LoggingMiddleware(`Invalid URL detected: ${longUrl}`, 'ERROR');
        continue;
      }

      const payload = {
        longUrl,
        validity: validity ? parseInt(validity) : 30,
        shortcode: shortcode || undefined,
      };

      const uniqueCode = shortcode || uuidv4().slice(0, 6);
      const shortUrl = `http://localhost:3000/${uniqueCode}`;
      const now = new Date();
      const expiry = new Date(now.getTime() + (payload.validity || 30) * 60000);

      results.push({ shortUrl, longUrl, createdAt: now.toISOString(), expiresAt: expiry.toISOString(), clicks: [] });

      LoggingMiddleware(`Shortened URL created: ${shortUrl}`, 'INFO');
    }

    setShortenedUrls(results);
  };

  const handleRedirect = (shortUrl) => {
    const match = shortenedUrls.find(u => u.shortUrl === shortUrl);
    if (match) {
      const clickData = {
        timestamp: new Date().toISOString(),
        source: document.referrer || 'direct',
        location: 'India (Mock)',
      };
      match.clicks.push(clickData);
      LoggingMiddleware(`Redirection triggered for ${shortUrl}`, 'INFO');
      window.location.href = match.longUrl;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 20 }}>
        <Typography variant="h4" gutterBottom>
          URL Shortener
        </Typography>
        {urlEntries.map((entry, index) => (
          <Card key={entry.id} style={{ marginBottom: 20 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Long URL" fullWidth value={entry.longUrl} onChange={e => handleChange(index, 'longUrl', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Validity (mins)" fullWidth value={entry.validity} onChange={e => handleChange(index, 'validity', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Custom Shortcode" fullWidth value={entry.shortcode} onChange={e => handleChange(index, 'shortcode', e.target.value)} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        <Button variant="contained" onClick={addEntry} style={{ marginRight: 10 }}>Add URL</Button>
        <Button variant="contained" color="primary" onClick={handleShorten}>Shorten</Button>

        <div style={{ marginTop: 30 }}>
          <Typography variant="h5">Shortened URLs</Typography>
          {shortenedUrls.map((url, i) => (
            <Card key={i} style={{ marginTop: 10 }}>
              <CardContent>
                <Typography>Original: {url.longUrl}</Typography>
                <Typography>Short: <a href="#" onClick={() => handleRedirect(url.shortUrl)}>{url.shortUrl}</a></Typography>
                <Typography>Created: {url.createdAt}</Typography>
                <Typography>Expires: {url.expiresAt}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <Typography variant="h5">Click Stats</Typography>
          {shortenedUrls.map((url, i) => (
            <Card key={i} style={{ marginTop: 10 }}>
              <CardContent>
                <Typography>Short URL: {url.shortUrl}</Typography>
                <Typography>Clicks: {url.clicks.length}</Typography>
                {url.clicks.map((click, idx) => (
                  <Typography key={idx} style={{ fontSize: '0.9em' }}>
                    {click.timestamp} - {click.source} - {click.location}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          message={snackbar.message}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;