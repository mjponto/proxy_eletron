// Vercel serverless entrypoint wrapping the Express app
import app from '../app.js';

// Ensure Vercel receives a function handler (req, res)
export default function handler(req, res) {
	return app(req, res);
}
