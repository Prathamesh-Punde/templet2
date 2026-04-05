# Perfect Software Solutions Website

A professional website for Perfect Software Solutions showcasing their software products and services, with a complete admin panel backend featuring role-based access control.

## 📁 Project Structure

```
templet2/
│
├── frontend/                   # Frontend website and admin UI
│   ├── index.html              # Home page with hero section
│   ├── about.html              # About us page
│   ├── product.html            # All products listing
│   ├── support.html            # Customer support and FAQ
│   ├── careers.html            # Career opportunities
│   ├── contact.html            # Contact form
│   ├── evisit.html             # E-visit page
│   ├── admin/                  # Admin Panel Pages
│   │   ├── admin-login.html
│   │   ├── admin-dashboard.html
│   │   ├── admin-careers.html
│   │   ├── admin-support.html
│   │   ├── admin-enquiries.html
│   │   └── admin-users.html
│   ├── css/                    # Stylesheets
│   │   └── styles.css
│   ├── js/                     # JavaScript Files
│   │   ├── script.js
│   │   ├── admin-auth.js
│   │   ├── admin-dashboard.js
│   │   └── admin/
│   │       ├── admin-careers.js
│   │       ├── admin-support.js
│   │       ├── admin-enquiries.js
│   │       └── admin-users.js
│   ├── assets/                 # Asset files
│   └── images/                 # Images
│
├── backend/                    # Node.js Backend API
│   ├── config/                 # Database config
│   ├── controllers/            # Business logic
│   ├── middleware/             # Auth & validation
│   ├── models/                 # Database models
│   ├── routes/                 # API endpoints
│   ├── server.js               # Entry point
│   └── package.json            # Dependencies
│
├── SETUP_GUIDE.md              # Setup instructions
└── README.md                   # This file
```
│   ├ublic Website Pages:
1. **Home (index.html)** - Dynamic hero section with product showcase
2. **About (about.html)** - Company mission, vision, values, and team
3. **Products (product.html)** - Complete listing of all 9 billing software products
4. **Support (support.html)** - Customer support options and comprehensive FAQ
5. **Careers (careers.html)** - Job openings and internship programs
6. **Contact (contact.html)** - Contact form and Google Maps integration
7. **E-Visit (evisit.html)** - Online visit scheduling

### Admin Panel Features:
1. **Role-Based Access Control (RBAC)**
   - **HR Role**: Manage career postings and job applications
   - **Customer Support Role**: Manage support tickets and customer inquiries
   - **Enquiry Follow Up Executive Role**: Manage contact-us enquiries and follow-ups
   - **Super Admin Role**: Full access to all features + user management

2. **Authentication & Security**
   - JWT-based secure authentication
   - Password hashing with bcrypt
   - Role-based authorization middleware
   - Token expiration and session management

3. **Careers Management (HR & Super Admin)**
   - Create, edit, and delete job postings
   - Toggle active/inactive status
   - Department and location filters
   - Employment type categorization
   - Salary range management

4. **Support Ticket System (Customer Support & Super Admin)**
   - View and manage all support tickets
   - Ticket assignment and status tracking
   - Priority levels (high, medium, low)
   - Internal and customer-facing responses
   - Ticket statistics dashboard
   - Status workflow (pending → in progress → resolved)

5. **User Management (Super Admin Only)**
   - Create new users with specific roles
   - Edit user details and permissions
   - Enable/disable user accounts
   - View user activity

6. **Enquiry Follow Up Workflow (Enquiry Follow Up Executive & Super Admin)**
   - Store contact-us submissions in the admin database
   - Track call time, comments, status, and next follow-up date
   - Status flow: new, contacted, converted, closed, asked for next follow-up

### Backend API:
- **Technology**: Node.js + Express.js
- **Database**: PostgreSQL with proper indexing
- **Architecture**: MVC pattern with controllers, models, and routes
- **Validation**: express-validator for input sanitization
- **Error Handling**: Comprehensive error middleware
- **Logging**: Request logging and activity tracking

### Design Features:
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Modern gradient effects and animations
- ✅ Interactive navigation with hamburger menu
- ✅ Particle background animation on hero section
- ✅ Product showcase carousel
- ✅ Animated statistics counters
- ✅ Professional admin dashboard UI
- ✅ Real-time form validation
├── images/                    # Image assets
├── SETUP_GUIDE.md             # Complete setup instructions
└── README.md                  # This file
```

## 🌟 Features

### Pages Included:
1. **Home (index.html)** - Dynamic hero section with product showcase
2. **About (about.html)** - Company mission, vision, values, and team
3. **Products (product.html)** - Complete listing of all 9 billing software products
4. **Support (support.html)** - Customer support options and comprehensive FAQ
5. **Careers (careers.html)** - Job openings and internship programs
6. **Contact (contact.html)** - Contact form and Google Maps integration

### Design Features:
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Modern gradient effects and animations
- ✅ Interactive navigation with hamburger menu
- ✅ Particle background animation on hero section
- ✅ Product showcase carousel
- ✅ Animated statistics counters
- ✅ FAQ accordion functionality
- ✅ Professional color scheme with CSS variables
- ✅ Font Awesome icons integration
- ✅ Smooth scrolling and transitions

## 🎨 Technologies Used

### Frontend:
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript** - Interactive functionality
- **Font Awesome 6.4.0** - Icon library
- **Google Fonts** - Inter font family

### Backend:
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **express-validator** - Input validation
- **dotenv** - Environment variables

## 🚀 Quick Start

### For Public Website:
1. Start the backend server with `cd backend && npm run dev`
2. Navigate through different pages using the menu

### For Admin Panel:
See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete setup instructions.

**Quick Steps:**
1. Install PostgreSQL and Node.js
2. Run database setup: `psql -U postgres -f backend/config/database.sql`
3. Configure `backend/.env` file
4. Install dependencies: `cd backend && npm install`
5. Start backend: `npm run dev`
6. Open `http://localhost:5000/`
7. Login at `http://localhost:5000/admin/admin-login.html`

### Default Credentials:
- **Super Admin**: admin@company.com / admin123
- **HR User**: hr@company.com / admin123  
- **Support User**: support@company.com / admin123
- **Enquiry Executive**: enquiry@company.com / admin123

**⚠️ Change these passwords before deploying to production!**

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet Large**: 1024px and below
- **Tablet Medium**: 968px and below
- **Mobile Large**: 768px and below
- **Mobile Medium**: 600px and below
- **Mobile Small**: 480px and below

## 🚀 Getting Started

1. **Clone or Download** the project
2. **Start the backend** with `cd backend && npm run dev`
3. Navigate through different pages using the navigation menu

## 📦 Products Featured

1. Hospital Management System (OPD)
2. Excise Management Suite
3. RetailBill Express
4. Supermarket Billing Pro
5. Restaurant Billing System
6. Medical Store Billing
7. Warehouse Management
8. Service Center Management
9. General Trading & Distribution

## 📚 Documentation

- **Frontend Colors:
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... more variables */
}
```

### Backend Configuration:
Edit environment variables in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_NAME=admin_panel_db
JWT_SECRET=your_secret_key
```

### Content:
- Update company information in HTML files
- Replace `logo.jpeg` with your logo
- Update contact information in footer and contact page
- Modify PDF paths in product cards

## 🔒 Security Features

- JWT-based authentication with token expiration
- Bcrypt password hashing (salt rounds: 10)
- Role-based authorization middleware
- Input validation and sanitization
- SQL injection prevention via parameterized queries
- CORS configuration for secure cross-origin requests
- Environment-based configuration

## 🚀 Deployment Checklist

Before deploying to production:
- [ ] Change all default passwords
- [ ] Update JWT_SECRET to a strong random string
- [ ] Enable HTTPS/SSL
- [ ] Configure production database
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Update environment to 'production'
- [ ] Remove or secure debug endpointte career

### Support (Customer Support & Super Admin)
- `GET /api/support/tickets` - Get all tickets
- `POST /api/support/tickets/:id/assign` - Assign ticket
- `POST /api/support/tickets/:id/resolve` - Resolve ticket
- `POST /api/support/tickets/:id/response` - Add response

### Users (Super Admin)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

See [API_REFERENCE.md](backend/API_REFERENCE.md) for complete documentation.

## 🔧 Customization

### Colors:
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... more variables */
}
```

### Content:
- Update company information in HTML files
- Replace `logo.jpeg` with your logo
- Update contact information in footer and contact page
- Modify PDF paths in product cards

## 📞 Contact Information

- **Phone**: +91 9422291397
- **Email**: uday_catuphale@yahoo.in
- **Location**: Aurangabad, Maharashtra

## 📄 License

© 2026 Perfect Software Solutions. All rights reserved.

## 🤝 Support

For support and queries, please visit the [Support Page](frontend/support.html) or contact us directly.

---

**Note**: Frontend files now live under `frontend/` and are served by Express on the same port as the API.
