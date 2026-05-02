# Developer Documentation

## 1. Project Overview
This project is a full-stack web application for Perfect Software Solutions with:
- Public marketing website pages
- Admin panel with role-based access control (RBAC)
- Node.js + Express backend APIs
- PostgreSQL database

It supports four operational domains:
- Careers management and applications
- Support ticket lifecycle
- Enquiry follow-up workflow
- Customer records management

## 2. Repository Structure

```text
templet2/
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── product.html
│   ├── support.html
│   ├── careers.html
│   ├── contact.html
│   ├── evisit.html
│   ├── admin/
│   │   ├── admin-login.html
│   │   ├── admin-dashboard.html
│   │   ├── admin-careers.html
│   │   ├── admin-support.html
│   │   ├── admin-enquiries.html
│   │   ├── admin-users.html
│   │   └── admin-customers.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── script.js
│   │   ├── admin-auth.js
│   │   ├── admin-dashboard.js
│   │   └── admin/
│   │       ├── admin-careers.js
│   │       ├── admin-support.js
│   │       ├── admin-enquiries.js
│   │       ├── admin-users.js
│   │       └── admin-customers.js
│   ├── assets/
│   └── images/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── database.sql
│   │   ├── enquiry_migration.sql
│   │   └── customer_migration.sql
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── FRONTEND_RESTRUCTURE.md
├── README.md
└── DEVELOPER_DOCS.md
```

## 3. Tech Stack

### Frontend
- HTML5, CSS3, vanilla JavaScript
- Font Awesome icons
- Multi-page website served by Express static hosting

### Backend
- Node.js (CommonJS)
- Express
- PostgreSQL (`pg`)
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Input validation (`express-validator`)
- CORS and dotenv

## 4. Environment Configuration
Create or update `backend/.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=admin_panel_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:3000
```

Notes:
- App runs at `http://localhost:5000` by default.
- Static frontend pages are served from `frontend/` via `backend/server.js`.

## 5. Local Development Setup

### Prerequisites
- Node.js 18+ recommended
- PostgreSQL 12+

### Install backend dependencies

```bash
cd backend
npm install
```

### Initialize database
Run these in order:
1. `backend/config/database.sql`
2. `backend/config/enquiry_migration.sql` (safe for existing DB)
3. `backend/config/customer_migration.sql` (safe for existing DB)

### Start backend

```bash
cd backend
npm run dev
```

### App URLs
- Public site: `http://localhost:5000/`
- Support page: `http://localhost:5000/support.html`
- Admin login: `http://localhost:5000/admin/admin-login.html`

## 6. Authentication and Authorization

### Roles
- `hr`
- `customer_support`
- `enquiry_follow_up_executive`
- `super_admin`

### Auth flow
1. Login at `POST /api/auth/login`
2. Receive JWT + user object
3. Store token in browser localStorage
4. Send `Authorization: Bearer <token>` for protected APIs

### Middleware
- `authenticate`: validates token and injects `req.user`
- `authorize(...roles)`: role-based access gating
- `validation.js`: request-level validation pipelines

## 7. Database Model Summary

### users
- Core admin users with RBAC role enum

### careers
- Job postings managed by HR/super admin

### career_applications
- Candidate submissions from public careers page

### support_tickets
- Public support tickets with ticket number, status, priority, assignment

### ticket_responses
- Support team responses (internal/public)

### enquiries
- Public contact-us enquiries with follow-up fields

### customers
- Super admin managed customer registry
- `customer_id` auto-generated in format like `CUST-001000`

### activity_logs
- Optional audit log entity

## 8. API Reference

Base URL: `/api`

### Auth
- `POST /auth/login`
- `GET /auth/profile` (auth)
- `POST /auth/logout` (auth)
- `POST /auth/change-password` (auth)
- `POST /auth/register` (super admin)

### Careers
Public:
- `GET /careers/active`
- `GET /careers/public/:id`
- `POST /careers/:id/apply`

Protected (hr, super_admin):
- `GET /careers`
- `GET /careers/:id`
- `POST /careers`
- `PUT /careers/:id`
- `DELETE /careers/:id`
- `GET /careers/applications`
- `PUT /careers/applications/:id/status`
- `DELETE /careers/applications/:id`

### Support
Public:
- `POST /support/tickets/create`
- `POST /support/tickets/track`

Protected (customer_support, super_admin):
- `GET /support/tickets`
- `GET /support/tickets/my`
- `GET /support/tickets/statistics`
- `GET /support/tickets/:id`
- `PUT /support/tickets/:id`
- `POST /support/tickets/:id/assign`
- `POST /support/tickets/:id/resolve`
- `POST /support/tickets/:id/response`

Protected (super_admin only):
- `DELETE /support/tickets/:id`

### Enquiries
Public:
- `POST /enquiries`

Protected (enquiry_follow_up_executive, super_admin):
- `GET /enquiries`
- `GET /enquiries/statistics`
- `GET /enquiries/:id`
- `PUT /enquiries/:id`

Protected (super_admin only):
- `DELETE /enquiries/:id`

### Users (super_admin only)
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

### Customers (super_admin only)
- `GET /customers`
- `GET /customers/:id`
- `POST /customers`
- `PUT /customers/:id`
- `DELETE /customers/:id`

## 9. Frontend-to-Backend Integration Notes

### Contact form
- `frontend/contact.html` posts to `POST /api/enquiries`

### Support ticket create
- `frontend/support.html` form `#supportTicketForm`
- handled in `frontend/js/script.js`
- posts to `POST /api/support/tickets/create`
- returns tracking ID (`ticket.ticket_number`)

### Support ticket tracking
- `frontend/support.html` form `#trackTicketForm`
- posts to `POST /api/support/tickets/track`
- requires tracking ID + mobile number
- mobile number is validated against `customers` table

### Admin dashboard sections
`frontend/admin/admin-dashboard.html` hosts section iframes:
- Careers
- Support
- Enquiries
- Customers
- Users

Visibility is role-driven in `frontend/js/admin-dashboard.js`.

## 10. Key Business Flows

### Flow A: Raise support ticket
1. User opens `support.html`
2. Fills name, mobile, email, software, priority, problem
3. Backend generates unique ticket number
4. Success message displays tracking ID
5. Ticket appears in admin support panel

### Flow B: Track support ticket
1. User opens tracking panel on support page
2. Enters tracking ID + mobile number
3. Backend validates:
   - tracking ID exists
   - mobile exists in `customers`
   - mobile matches ticket phone
4. Returns ticket status details or clear error reason

### Flow C: Enquiry follow-up
1. User submits contact form
2. Enquiry is persisted in `enquiries`
3. Enquiry executive/super admin updates status/comments/follow-up

### Flow D: Customer management
1. Super admin opens Customers section
2. Adds/edits/deletes customer records
3. Customer ID auto-generated by DB default

## 11. Developer Conventions

### Backend
- MVC-ish split: `routes -> controllers -> models`
- All SQL calls parameterized with `$1..$n`
- Validation in middleware layer
- Role gates at route layer

### Frontend
- Page-local logic in `frontend/js/script.js` for public pages
- Admin section-specific files under `frontend/js/admin/`
- Avoid binding generic selectors that overlap multiple forms

## 12. Troubleshooting

### Route not found for new API
- Ensure backend restarted after code change
- Confirm URL is hitting correct backend port
- Check route mounted in `backend/server.js`

### Tracking shows false-negative
- Verify customer mobile exists in `customers`
- Verify ticket was created with same mobile number
- Normalize number formatting (with or without symbols)

### Admin section missing in nav
- Confirm user role in DB and token payload
- Check `localStorage.user` consistency
- Hard refresh after JS updates

### Form submits wrong API
- Ensure each form has unique ID
- Bind event listeners by ID (not broad class selector)

## 13. Security and Production Notes

- Change default seeded passwords immediately
- Use strong `JWT_SECRET`
- Restrict CORS to real frontend domain
- Use HTTPS and secure reverse proxy
- Add rate limiting and request logging for production
- Add backup and migration strategy for PostgreSQL

## 14. Future Improvements

- Add automated tests (unit + API integration)
- Add migration runner/versioning tool
- Add ticket SLA timelines and escalation rules
- Add admin audit logs UI
- Add CI lint + type checks

