# Fieldbook Backend (Express.js)

Minimal REST API backend for Fieldbook, ready for cloud deployment (e.g., Render, Railway).

## Features
- Express.js REST API
- CORS configured for local dev and production frontend
- Basic security with Helmet
- Ready for cloud hosting

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run locally:
   ```bash
   npm start
   ```
   The server runs on `http://localhost:3000` by default.

## CORS
- Only allows requests from:
  - `http://localhost:5173` (Vite dev)
  - `http://localhost:3000` (React dev)
  - `https://your-frontend-domain.com` (replace with your frontend URL)
- Update `allowedOrigins` in `index.js` as needed.

## Deploy
- Deploy to Render, Railway, or similar Node.js cloud platforms.
- Set `PORT` environment variable if needed (default: 3000).

## Endpoints
See `202507070632 Fieldbook.md` for API contract and example responses. 