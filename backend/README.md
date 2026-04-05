# Admin Panel Backend API

A Node.js backend API with PostgreSQL database for an admin panel with role-based access control.

## Features

- **Role-Based Access Control (RBAC)**
  - HR: Manages career postings
  - Customer Support: Manages support tickets
  - Enquiry Follow Up Executive: Manages contact-us enquiries and follow-ups
  - Super Admin: Full access to all features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based authorization middleware
  - Secure password hashing with bcrypt

- **Careers Management**
  - Create, read, update, delete career postings
  - Public endpoint for active positions
  - Accessible by HR and Super Admin roles

- **Support Ticket System**
  - Public ticket creation
  - Ticket assignment and tracking
  - Internal and public responses
  - Status management (pending, in progress, resolved)
  - Accessible by Customer Support and Super Admin roles

- **Enquiry Follow-Up System**
  - Public contact-us enquiry creation
  - Enquiry list for Enquiry Follow Up Executive and Super Admin
  - Call time, comments, status, and next follow-up date tracking
  - Status management (new, contacted, converted, closed, asked for next follow-up)

- **User Management**
  - User CRUD operations (Super Admin only)
  - Profile management
  - Password change functionality

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env` file and update the values:
     - Database credentials
     - JWT secret key
     - Server port

3. Create PostgreSQL database:
   ```bash
   psql -U postgres
   ```
   Then run the SQL commands from `config/database.sql`

  If you already created the database earlier, also run `config/enquiry_migration.sql` to add the enquiry role and enquiry table.

4. Start the server:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## Default Users

After running the database schema, you'll have these default users (password: `admin123`):

- **Super Admin**: admin@company.com
- **HR User**: hr@company.com
- **Support User**: support@company.com
- **Enquiry Executive**: enquiry@company.com

**IMPORTANT**: Change these passwords in production!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Super Admin only)
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Careers (HR & Super Admin)
- `GET /api/careers` - Get all careers
- `GET /api/careers/active` - Get active careers (public)
- `GET /api/careers/:id` - Get career by ID
- `POST /api/careers` - Create new career
- `PUT /api/careers/:id` - Update career
- `DELETE /api/careers/:id` - Delete career

### Support Tickets (Customer Support & Super Admin)
- `POST /api/support/tickets/create` - Create ticket (public)
- `GET /api/support/tickets` - Get all tickets
- `GET /api/support/tickets/my` - Get my assigned tickets
- `GET /api/support/tickets/statistics` - Get ticket statistics
- `GET /api/support/tickets/:id` - Get ticket details
- `PUT /api/support/tickets/:id` - Update ticket
- `POST /api/support/tickets/:id/assign` - Assign ticket
- `POST /api/support/tickets/:id/resolve` - Resolve ticket
- `POST /api/support/tickets/:id/response` - Add response
- `DELETE /api/support/tickets/:id` - Delete ticket (Super Admin only)

### Enquiries (Enquiry Follow Up Executive & Super Admin)
- `POST /api/enquiries` - Create enquiry (public)
- `GET /api/enquiries` - Get all enquiries
- `GET /api/enquiries/statistics` - Get enquiry statistics
- `GET /api/enquiries/:id` - Get enquiry details
- `PUT /api/enquiries/:id` - Update enquiry follow-up details
- `DELETE /api/enquiries/:id` - Delete enquiry (Super Admin only)

### Users (Super Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Authorization Headers

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Technology Stack

- **Backend Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Environment Variables**: dotenv
- **CORS**: cors

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication, authorization, validation
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── .env             # Environment variables
├── .gitignore       # Git ignore file
├── package.json     # Dependencies
└── server.js        # Entry point
```

## Security Notes

1. Always use HTTPS in production
2. Change default passwords immediately
3. Update JWT_SECRET to a strong, random value
4. Keep dependencies updated
5. Implement rate limiting for production
6. Enable PostgreSQL SSL connections in production
7. Set appropriate CORS origins

## License

ISC
