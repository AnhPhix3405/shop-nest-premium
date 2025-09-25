# Authentication System

## Overview
Hệ thống authentication với JWT tokens bao gồm:
- Login với email/username + password
- JWT access token và refresh token
- Password validation với bcrypt
- Token refresh mechanism
- Logout và logout-all functionality

## API Endpoints

### POST /auth/login
Đăng nhập và nhận JWT tokens.

**Request Body:**
```json
{
  "identifier": "user@example.com", // email hoặc username
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "user@example.com",
    "avatar_url": "",
    "role": {
      "id": 1,
      "name": "customer"
    }
  },
  "expires_in": 900
}
```

### POST /auth/refresh
Làm mới access token bằng refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

### POST /auth/logout
Đăng xuất (revoke refresh token).

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/logout-all
Đăng xuất khỏi tất cả devices.

**Request Body:**
```json
{
  "user_id": 1
}
```

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

## JWT Payload
Access token chứa thông tin:
```json
{
  "sub": 1,           // User ID
  "username": "testuser",
  "email": "user@example.com", 
  "role": "customer",
  "roleId": 1,
  "iat": 1640995200,  // Issued at
  "exp": 1640996100   // Expires at
}
```

## Environment Variables
Cần thiết lập các biến môi trường sau:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production  
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN_SECONDS=604800
```

## Usage Example

### Client-side Login Flow
```javascript
// 1. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'user@example.com',
    password: 'password123'
  })
});

const { access_token, refresh_token, user } = await loginResponse.json();

// Store tokens
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// 2. Use access token for API calls
const apiResponse = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

// 3. Refresh token when needed
const refreshResponse = await fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh_token: refresh_token
  })
});

const { access_token: newAccessToken } = await refreshResponse.json();
localStorage.setItem('access_token', newAccessToken);
```

## Database Schema
Hệ thống sử dụng bảng `refresh_tokens`:

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

## Security Features
- ✅ Password hashing với bcrypt
- ✅ JWT access tokens (short-lived: 15 minutes)  
- ✅ Refresh tokens (long-lived: 7 days)
- ✅ Refresh token rotation (old tokens invalidated)
- ✅ Multiple device support
- ✅ Logout từ specific device hoặc all devices
- ✅ Token expiration validation
- ✅ Environment-based secret keys