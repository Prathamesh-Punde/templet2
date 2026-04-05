# API Endpoints Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "email": "admin@company.com",
    "role": "super_admin",
    "is_active": true
  }
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### Register User (Super Admin Only)
```http
POST /api/auth/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@company.com",
  "password": "password123",
  "role": "hr"
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

## Careers (HR & Super Admin)

### Get All Careers
```http
GET /api/careers
Authorization: Bearer {token}

Query Parameters:
- is_active (boolean): Filter by active status
- department (string): Filter by department
```

### Get Active Careers (Public)
```http
GET /api/careers/active
```

### Get Career by ID
```http
GET /api/careers/:id
Authorization: Bearer {token}
```

### Create Career
```http
POST /api/careers
Authorization: Bearer {token}
Content-Type: application/json

{
  "job_title": "Software Engineer",
  "department": "Engineering",
  "location": "New York, NY",
  "employment_type": "Full-time",
  "description": "We are seeking a talented software engineer...",
  "requirements": "- 3+ years of experience\n- Strong problem-solving skills",
  "responsibilities": "- Develop new features\n- Code reviews",
  "salary_range": "$80,000 - $120,000",
  "is_active": true
}
```

### Update Career
```http
PUT /api/careers/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "job_title": "Senior Software Engineer",
  "is_active": false
}
```

### Delete Career
```http
DELETE /api/careers/:id
Authorization: Bearer {token}
```

## Support Tickets (Customer Support & Super Admin)

### Create Ticket (Public)
```http
POST /api/support/tickets/create
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "555-0123",
  "subject": "Issue with service",
  "message": "I need help with...",
  "priority": "medium"
}
```

### Get All Tickets
```http
GET /api/support/tickets
Authorization: Bearer {token}

Query Parameters:
- status (string): pending, in_progress, resolved
- priority (string): high, medium, low
- assigned_to (integer): User ID
```

### Get My Assigned Tickets
```http
GET /api/support/tickets/my
Authorization: Bearer {token}
```

### Get Ticket Statistics
```http
GET /api/support/tickets/statistics
Authorization: Bearer {token}

Response:
{
  "statistics": {
    "total_tickets": 50,
    "pending": 15,
    "in_progress": 20,
    "resolved": 15,
    "high_priority": 5
  }
}
```

### Get Ticket by ID
```http
GET /api/support/tickets/:id
Authorization: Bearer {token}

Response includes ticket details and all responses
```

### Update Ticket
```http
PUT /api/support/tickets/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "high",
  "assigned_to": 2
}
```

### Assign Ticket
```http
POST /api/support/tickets/:id/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 2  // Optional, defaults to current user
}
```

### Resolve Ticket
```http
POST /api/support/tickets/:id/resolve
Authorization: Bearer {token}
```

### Add Response to Ticket
```http
POST /api/support/tickets/:id/response
Authorization: Bearer {token}
Content-Type: application/json

{
  "response": "Thank you for contacting us...",
  "is_internal": false
}
```

### Delete Ticket (Super Admin Only)
```http
DELETE /api/support/tickets/:id
Authorization: Bearer {token}
```

## Users (Super Admin Only)

### Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer {token}
```

### Update User
```http
PUT /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "updated_username",
  "email": "updated@email.com",
  "role": "customer_support",
  "is_active": true
}
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer {token}

Note: Cannot delete your own account
```

## Role-Based Access

### Super Admin
- Full access to all endpoints
- Can manage users, careers, and support tickets

### HR
- Can manage careers (create, edit, delete)
- Can view career statistics
- Cannot access support tickets or user management

### Customer Support
- Can manage support tickets (view, assign, respond, resolve)
- Can view ticket statistics
- Cannot access careers or user management

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource",
  "requiredRole": ["hr", "super_admin"],
  "userRole": "customer_support"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Common Headers

All authenticated requests must include:
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### Create Career Example
```bash
curl -X POST http://localhost:5000/api/careers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Developer",
    "department": "IT",
    "location": "Remote",
    "employment_type": "Full-time",
    "description": "Great opportunity",
    "requirements": "Experience needed",
    "responsibilities": "Develop features"
  }'
```

### Create Support Ticket Example
```bash
curl -X POST http://localhost:5000/api/support/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "subject": "Need assistance",
    "message": "I need help with billing",
    "priority": "high"
  }'
```

## Rate Limiting (Future Implementation)

Consider implementing rate limiting in production:
- Login attempts: 5 per 15 minutes
- API requests: 100 per 15 minutes per user
- Public endpoints: 20 per minute per IP

## Pagination (Future Enhancement)

For endpoints returning large datasets, consider adding pagination:
```
GET /api/careers?page=1&limit=20
```

## WebSocket Support (Future Enhancement)

For real-time updates on support tickets:
```
ws://localhost:5000/tickets
```
