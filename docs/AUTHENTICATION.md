# Authentication System Documentation

## Overview

The FieldBook backend implements a JWT-based authentication system with refresh token support for enhanced security and user experience.

## Token Types

### 1. Access Token

- **Purpose**: Short-lived token for API access
- **Expiration**: 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Usage**: Required in `Authorization: Bearer <token>` header for protected endpoints
- **Payload**: Contains `userId`, `email`, `role`, and `iat` (issued at)

### 2. Refresh Token

- **Purpose**: Long-lived token for generating new access tokens
- **Expiration**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Usage**: Used to refresh expired access tokens without re-authentication
- **Payload**: Contains `userId`, `email`, `type: 'refresh'`, and `iat`

## How Token Validation Works

### 1. Authentication Middleware (`middleware/auth.js`)

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: 'Access token required',
      error: 'Unauthorized',
    });
  }

  try {
    const decoded = jwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token',
      error: 'Forbidden',
    });
  }
};
```

**Process:**

1. Extracts Bearer token from Authorization header
2. Verifies token using JWT service
3. Adds decoded user info to `req.user`
4. Allows request to proceed or returns error

### 2. JWT Service (`services/jwtService.js`)

```javascript
verifyToken(token) {
  try {
    return jwt.verify(token, this.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

**Features:**

- Token verification with secret key
- Automatic expiration checking
- Error handling for invalid tokens

## Token Refresh Process

### 1. Refresh Token Endpoint

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_access_token_here",
    "refresh_token": "new_refresh_token_here",
    "token_type": "Bearer",
    "expires_in": "24h",
    "refresh_expires_in": "7d"
  }
}
```

### 2. Refresh Process Flow

1. **Client sends refresh token** to `/auth/refresh` endpoint
2. **Server verifies refresh token** using separate secret
3. **Checks token type** to ensure it's a refresh token
4. **Fetches user data** from database using `userId`
5. **Generates new token pair** (access + refresh)
6. **Returns new tokens** to client

### 3. Security Features

- **Separate secrets**: Access and refresh tokens use different secrets
- **Token type validation**: Refresh tokens must have `type: 'refresh'`
- **User validation**: Verifies user still exists in database
- **Automatic expiration**: Refresh tokens expire after 7 days

## API Endpoints

### Authentication Endpoints

| Endpoint         | Method | Description          | Auth Required           |
| ---------------- | ------ | -------------------- | ----------------------- |
| `/auth/login`    | POST   | User login           | No                      |
| `/auth/register` | POST   | User registration    | No                      |
| `/auth/refresh`  | POST   | Refresh access token | No (uses refresh token) |
| `/auth/logout`   | POST   | User logout          | Yes                     |

### Protected Endpoints

| Endpoint    | Method   | Description      | Auth Required |
| ----------- | -------- | ---------------- | ------------- |
| `/profile`  | GET      | Get user profile | Yes           |
| `/fields`   | GET      | Get fields list  | Optional      |
| `/bookings` | GET/POST | Manage bookings  | Yes           |

## Client Implementation Guide

### 1. Login Flow

```javascript
// Login and store tokens
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { access_token, refresh_token } = loginResponse.data.data;

// Store tokens securely
localStorage.setItem('accessToken', access_token);
localStorage.setItem('refreshToken', refresh_token);
```

### 2. API Request with Token

```javascript
// Make authenticated request
const response = await fetch('/api/v1/profile', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

### 3. Token Refresh Flow

```javascript
// When access token expires
async function refreshToken() {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: localStorage.getItem('refreshToken'),
      }),
    });

    const { access_token, refresh_token } = response.data.data;

    // Update stored tokens
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);

    return access_token;
  } catch (error) {
    // Refresh token expired, redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}
```

### 4. Automatic Token Refresh

```javascript
// Interceptor for automatic token refresh
const apiClient = axios.create({
  baseURL: '/api/v1',
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 403) {
      // Token expired, try to refresh
      const newToken = await refreshToken();
      if (newToken) {
        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

## Environment Configuration

### Required Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
```

### Security Recommendations

1. **Use strong secrets**: Generate cryptographically secure secrets
2. **Different secrets**: Use different secrets for access and refresh tokens
3. **HTTPS only**: Always use HTTPS in production
4. **Token storage**: Store tokens securely (httpOnly cookies recommended)
5. **Token rotation**: Implement token rotation for enhanced security

## Testing

### Manual Testing

Use the provided test script:

```bash
node scripts/test-refresh-token.js
```

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Refresh token
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"your_refresh_token_here"}'

# Access protected endpoint
curl -X GET http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer your_access_token_here"
```

## Error Handling

### Common Error Responses

| Status | Error                 | Description              |
| ------ | --------------------- | ------------------------ |
| 400    | Bad Request           | Missing required fields  |
| 401    | Unauthorized          | Invalid or missing token |
| 403    | Forbidden             | Expired or invalid token |
| 500    | Internal Server Error | Server error             |

### Error Response Format

```json
{
  "message": "Error description",
  "error": "Error type"
}
```

## Security Considerations

1. **Token Storage**: Store tokens securely (avoid localStorage in production)
2. **Token Expiration**: Implement proper token expiration handling
3. **Refresh Token Rotation**: Consider implementing refresh token rotation
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Logging**: Log authentication events for security monitoring
6. **CORS**: Configure CORS properly for your frontend domain
