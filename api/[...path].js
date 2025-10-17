// Catch-all Vercel serverless entrypoint to forward any /api/* path
import app from '../app.js';

export default function handler(req, res) {
  // Ensure Express sees the '/api' prefix so routes like '/api/motors/efficiency' match
  if (!req.url.startsWith('/api')) {
    const originalUrl = req.url || '/';
    req.url = originalUrl.startsWith('/') ? `/api${originalUrl}` : `/api/${originalUrl}`;
  }
  return app(req, res);
}
