# Admin Panel Setup Guide

## Complete Setup Instructions

This guide will walk you through setting up the entire admin panel system with role-based access control.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
3. A code editor (VS Code recommended)
4. A web browser

## Step 1: Database Setup

### 1.1 Install PostgreSQL

If you haven't already, install PostgreSQL on your system.

### 1.2 Create the Database

Open PostgreSQL command line (psql) or use pgAdmin and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Run the database setup script
\i backend/config/database.sql
```

Alternatively, you can copy the contents of `backend/config/database.sql` and run it in pgAdmin's query tool.

### 1.3 Verify Database Creation

Check that the database was created:

```sql
\c admin_panel_db
\dt
```

You should see tables: users, careers, support_tickets, ticket_responses, activity_logs

## Step 2: Backend Configuration

### 2.1 Configure Environment Variables

1. Open `backend/.env` file
2. Update the following values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admin_panel_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

# JWT Configuration
JWT_SECRET=YOUR_STRONG_SECRET_KEY_HERE_CHANGE_THIS
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Important**: Change `DB_PASSWORD` to your PostgreSQL password and `JWT_SECRET` to a strong random string.

### 2.2 Install Dependencies

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

### 2.3 Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

You should see:
```
Server is running on port 5000
Environment: development
Connected to PostgreSQL database
```

## Step 3: Frontend Setup

### 3.1 Serve Frontend Files

The frontend is served directly by the Express backend from the `frontend/` directory.

Start the application with:

```bash
cd backend
npm run dev
```

### 3.2 Update API URL (if needed)

The frontend now uses same-origin API calls. Verify these files use `const API_URL = '/api';`:
- `frontend/js/admin-auth.js`
- `frontend/js/admin-dashboard.js`
- `frontend/js/admin/admin-careers.js`
- `frontend/js/admin/admin-support.js`
- `frontend/js/admin/admin-users.js`

## Step 4: Test the System

### 4.1 Default User Credentials

Three default users are created (password for all: `admin123`):

1. **Super Admin**
   - Email: admin@company.com
   - Password: admin123
   - Access: All features

2. **HR User**
   - Email: hr@company.com
   - Password: admin123
   - Access: Careers management

3. **Customer Support User**
   - Email: support@company.com
   - Password: admin123
   - Access: Support tickets

### 4.2 Login to Admin Panel

1. Open your browser and navigate to `http://localhost:5000/admin/admin-login.html`
2. Login with one of the default accounts
3. You should be redirected to the dashboard

### 4.3 Test Features

**As HR User:**
- Navigate to Careers section
- Add a new job posting
- Edit existing postings
- Toggle active/inactive status

**As Customer Support:**
- Navigate to Support Tickets
- View pending tickets
- Assign tickets to yourself
- Add responses to tickets
- Mark tickets as resolved

**As Super Admin:**
- Access all features
- Manage users (Users section)
- Create new HR or Support users
- Manage both careers and support tickets

## Step 5: Create a Support Ticket (Public Test)

To test the public ticket creation:

1. Go to `http://localhost:5000/support.html` (if you have this page)
2. OR create a test ticket using the API:

```bash
curl -X POST http://localhost:5000/api/support/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "123-456-7890",
    "subject": "Test Ticket",
    "message": "This is a test support ticket.",
    "priority": "medium"
  }'
```

## Common Issues and Solutions

### Issue: Cannot connect to database

**Solution:**
- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Issue: "Token expired" or authentication errors

**Solution:**
- Clear browser localStorage
- Login again
- Check JWT_SECRET is set in `.env`

### Issue: CORS errors in browser console

**Solution:**
- Ensure backend is running
- Check FRONTEND_URL in backend `.env`
- Update CORS settings in `server.js` if needed

### Issue: Port already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

## Security Recommendations

**Before deploying to production:**

1. Change all default passwords
2. Use a strong JWT_SECRET (at least 32 characters)
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up rate limiting
6. Use environment-specific .env files
7. Enable PostgreSQL SSL connections
8. Implement session management
9. Add logging and monitoring
10. Regular security updates

## API Testing with Postman/Thunder Client

### Login Request
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

### Get Careers (Protected)
```
GET http://localhost:5000/api/careers
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Career (Protected - HR/Super Admin)
```
POST http://localhost:5000/api/careers
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "job_title": "Software Engineer",
  "department": "Engineering",
  "location": "New York",
  "employment_type": "Full-time",
  "description": "We are looking for...",
  "requirements": "- 3+ years experience...",
  "responsibilities": "- Develop features...",
  "salary_range": "$80,000 - $120,000"
}
```

## Project Structure Overview

```
templet2/
├── frontend/                  # Frontend pages, assets, and admin UI
│   ├── index.html
│   ├── about.html
│   ├── careers.html
│   ├── contact.html
│   ├── product.html
│   ├── support.html
│   ├── evisit.html
│   ├── admin/
│   │   ├── admin-login.html
│   │   ├── admin-dashboard.html
│   │   ├── admin-careers.html
│   │   ├── admin-support.html
│   │   └── admin-users.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── admin-auth.js
│   │   ├── admin-dashboard.js
│   │   ├── careers.js
│   │   ├── script.js
│   │   └── admin/
│   │       ├── admin-careers.js
│   │       ├── admin-support.js
│   │       └── admin-users.js
│   ├── assets/
│   └── images/
├── backend/                   # Node.js backend
│   ├── config/               # Database configuration
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth, validation
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── .env                  # Environment variables
│   └── server.js             # Entry point
└── ...documentation and helper files
```

## Next Steps

1. **Customize the UI**: Update colors, logos, and styling to match your brand
2. **Add Email Notifications**: Integrate email service for ticket responses
3. **Implement File Uploads**: Add resume uploads for career applications
4. **Add Analytics Dashboard**: Create charts and reports
5. **Set up Backup System**: Regular database backups
6. **Deploy to Production**: Use services like Heroku, AWS, or DigitalOcean

## Support and Documentation

- Backend API documentation: See `backend/README.md`
- For issues: Check console logs in browser (F12) and backend terminal
- Database schema: See `backend/config/database.sql`

## License

ISC

---

**Created:** March 2026
**Version:** 1.0.0
