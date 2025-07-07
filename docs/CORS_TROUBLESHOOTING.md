# CORS Troubleshooting Guide

## Current Issue

You're getting a CORS error when accessing `https://fieldbook-be.onrender.com//api/v1/auth/login` from `https://fieldbook-fe.vercel.app`.

## Quick Fixes

### 1. **Deploy the Updated Backend**

The CORS configuration has been enhanced. Deploy your updated backend to Render.

### 2. **Check Your Frontend URL Construction**

The double slash in the error suggests a URL construction issue. Ensure your frontend is using the correct base URL:

```javascript
// ✅ Correct
const API_BASE_URL = 'https://fieldbook-be.onrender.com';

// ❌ Incorrect - might cause double slashes
const API_BASE_URL = 'https://fieldbook-be.onrender.com/';
```

### 3. **Test the CORS Configuration**

Run the CORS test script:

```bash
node scripts/test-cors.js
```

## Step-by-Step Troubleshooting

### Step 1: Verify Backend Deployment

1. Check if your backend is deployed and running
2. Test the health endpoint: `https://fieldbook-be.onrender.com/`
3. Test the CORS debug endpoint: `https://fieldbook-be.onrender.com/api/v1/cors-debug`

### Step 2: Check Origin Headers

The frontend should send the correct origin header. Check your browser's Network tab to see what origin is being sent.

### Step 3: Test with cURL

```bash
# Test basic connectivity
curl -X GET "https://fieldbook-be.onrender.com/" -v

# Test CORS with origin header
curl -X GET "https://fieldbook-be.onrender.com/api/v1/cors-debug" \
  -H "Origin: https://fieldbook-fe.vercel.app" \
  -v

# Test login endpoint
curl -X POST "https://fieldbook-be.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: https://fieldbook-fe.vercel.app" \
  -d '{"email":"customer@example.com","password":"customer123"}' \
  -v
```

### Step 4: Check Environment Variables

Ensure your backend has the correct environment variables:

```env
NODE_ENV=production
PORT=8000
```

## Common CORS Issues and Solutions

### Issue 1: Double Slash in URL

**Problem**: `https://fieldbook-be.onrender.com//api/v1/auth/login`
**Solution**: Fix URL construction in frontend

```javascript
// Frontend fix
const API_BASE_URL = 'https://fieldbook-be.onrender.com';

// ✅ Correct usage
fetch(`${API_BASE_URL}/api/v1/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// ❌ Avoid this
fetch(`${API_BASE_URL}//api/v1/auth/login`, ...);
```

### Issue 2: Missing Origin Header

**Problem**: Browser not sending origin header
**Solution**: Ensure proper fetch/axios configuration

```javascript
// ✅ Correct fetch configuration
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://fieldbook-fe.vercel.app',
  },
  body: JSON.stringify(data),
});

// ✅ Correct axios configuration
axios.post(url, data, {
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Issue 3: Preflight Request Failing

**Problem**: OPTIONS request not handled
**Solution**: Backend now handles preflight requests properly

### Issue 4: Wrong Origin in CORS Config

**Problem**: Origin not in allowed list
**Solution**: Backend now includes your frontend origin

## Debugging Steps

### 1. Check Browser Console

Look for the exact error message and check the Network tab to see:

- What origin is being sent
- What response headers are received
- Whether preflight requests are successful

### 2. Check Backend Logs

Look for CORS-related log messages:

```
CORS: Allowing origin: https://fieldbook-fe.vercel.app
CORS: Blocking origin: [some-origin]
```

### 3. Test Individual Endpoints

Test each endpoint separately to isolate the issue:

```bash
# Health check
curl "https://fieldbook-be.onrender.com/"

# CORS debug
curl "https://fieldbook-be.onrender.com/api/v1/cors-debug"

# Login endpoint
curl -X POST "https://fieldbook-be.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'
```

## Frontend Configuration

### React/Vite Configuration

If using Vite, ensure proper proxy configuration:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://fieldbook-be.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
};
```

### Environment Variables

```env
# Frontend .env
VITE_API_BASE_URL=https://fieldbook-be.onrender.com
```

## Production Checklist

- [ ] Backend deployed with updated CORS configuration
- [ ] Frontend using correct API base URL
- [ ] No double slashes in URLs
- [ ] Proper error handling in frontend
- [ ] CORS debug endpoint accessible
- [ ] All endpoints tested individually

## Emergency Fixes

If the issue persists, try these emergency fixes:

### 1. Temporary CORS Bypass (Development Only)

```javascript
// In your backend index.js (TEMPORARY ONLY)
app.use(
  cors({
    origin: true, // Allow all origins temporarily
    credentials: true,
  })
);
```

### 2. Proxy Setup

Set up a proxy in your frontend to bypass CORS:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://fieldbook-be.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
};
```

## Contact Information

If you're still experiencing issues after trying these solutions:

1. Check the backend logs for CORS-related messages
2. Test the CORS debug endpoint
3. Run the test script: `node scripts/test-cors.js`
4. Share the exact error message and response headers
