# Backend Documentation

**Personal Finance & Expense Management System - Node.js/Express API**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Connection](#database-connection)
5. [Authentication](#authentication)
6. [API Endpoints](#api-endpoints)
7. [Controllers](#controllers)
8. [Middleware](#middleware)
9. [Services](#services)
10. [Security](#security)
11. [Error Handling](#error-handling)
12. [Testing](#testing)

---

## 🎯 Overview

The backend is a RESTful API built with Node.js and Express that handles all business logic, database operations, and authentication for the expense tracker application.

**Key Features:**
- JWT-based authentication
- MySQL database with connection pooling
- Email notifications for reimbursements
- Transaction SMS parsing
- PDF/CSV/Excel report generation
- Comprehensive error handling
- Security middleware (Helmet, CORS, Rate Limiting)

**Base URL:** `http://localhost:5001/api`

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.2.1 | Web framework |
| **MySQL2** | 3.24.4 | Database driver with connection pooling |
| **JWT** | 9.0.3 | Token-based authentication |
| **Bcryptjs** | 3.0.3 | Password hashing |
| **Nodemailer** | 10.0.10 | Email service |
| **Helmet** | 8.3.0 | Security headers |
| **CORS** | 2.8.6 | Cross-origin resource sharing |
| **Express Validator** | 7.3.2 | Request validation |
| **Express Rate Limit** | 8.7.0 | API rate limiting |
| **Morgan** | 1.12.1 | HTTP request logger |
| **UUID** | 14.0.2 | Unique ID generation |
| **PDFKit** | 0.20.2 | PDF report generation |
| **ExcelJS** | 4.4.0 | Excel report generation |
| **json2csv** | 6.0.0 | CSV export |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/                   # Configuration
│   │   └── database.js           # MySQL connection pool
│   │
│   ├── controllers/              # Business Logic (8 controllers)
│   │   ├── authController.js     # Authentication (login, register)
│   │   ├── userController.js     # User profile management
│   │   ├── expenseController.js  # Expense CRUD operations
│   │   ├── categoryController.js # Category management
│   │   ├── transactionController.js # Transaction simulation & review
│   │   ├── sharedExpenseController.js # Expense sharing
│   │   ├── reimbursementController.js # Reimbursement tracking
│   │   ├── reportController.js   # Report generation
│   │   └── dashboardController.js # Dashboard statistics
│   │
│   ├── routes/                   # API Route Definitions
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── sharedExpenseRoutes.js
│   │   ├── reimbursementRoutes.js
│   │   ├── reportRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── middleware/               # Middleware Functions
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validator.js          # Request validation
│   │
│   ├── services/                 # External Services
│   │   └── emailService.js       # Nodemailer email sending
│   │
│   ├── parsers/                  # Data Parsers
│   │   └── smsParser.js          # Transaction SMS parsing
│   │
│   ├── exports/                  # Report Export Utilities
│   │   ├── pdfExport.js          # PDF generation
│   │   ├── csvExport.js          # CSV generation
│   │   └── excelExport.js        # Excel generation
│   │
│   ├── validators/               # Request Validation Schemas
│   │   └── expenseValidator.js   # Expense validation rules
│   │
│   ├── utils/                    # Utility Functions
│   │   ├── logger.js             # Custom logger
│   │   └── helpers.js            # Helper functions
│   │
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
│
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json
└── README.md
```

---

## 🗄️ Database Connection

### **Configuration** (`src/config/database.js`)

```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

module.exports = {
  query: (...args) => promisePool.query(...args),
  execute: (...args) => promisePool.execute(...args),
  pool: promisePool
};
```

**Connection Pooling Benefits:**
- Reuses database connections
- Handles connection lifecycle
- Prevents connection exhaustion
- Improves performance

**Usage in Controllers:**
```javascript
const db = require('../config/database');

const [results] = await db.query('SELECT * FROM expenses WHERE user_id = ?', [userId]);
```

---

## 🔐 Authentication

### **JWT Authentication Flow**

1. **User registers** → Password hashed with bcrypt → Store in DB
2. **User logs in** → Verify password → Generate JWT token
3. **Frontend stores token** → Send in Authorization header
4. **Backend validates token** → Extract user ID → Allow access

### **Auth Middleware** (`src/middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};

module.exports = auth;
```

### **Token Generation**

```javascript
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### **Password Hashing**

```javascript
const bcrypt = require('bcryptjs');

// Hash password on registration
const password_hash = await bcrypt.hash(password, 10);

// Verify password on login
const isMatch = await bcrypt.compare(password, user.password_hash);
```

---

## 🌐 API Endpoints

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |

---

### **User Routes** (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| GET | `/payment-methods` | Get payment methods | Yes |
| POST | `/payment-methods` | Add payment method | Yes |
| PUT | `/payment-methods/:id` | Update payment method | Yes |
| DELETE | `/payment-methods/:id` | Delete payment method | Yes |

---

### **Expense Routes** (`/api/expenses`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all expenses | Yes |
| GET | `/:id` | Get expense by ID | Yes |
| POST | `/` | Create expense | Yes |
| PUT | `/:id` | Update expense | Yes |
| DELETE | `/:id` | Delete expense | Yes |
| GET | `/search` | Search expenses | Yes |

**Query Parameters for GET /expenses:**
- `category_id` - Filter by category
- `payment_method_id` - Filter by payment method
- `start_date` - Filter by start date
- `end_date` - Filter by end date
- `min_amount` - Minimum amount
- `max_amount` - Maximum amount
- `merchant` - Search merchant name
- `sort` - Sort field (date, amount, merchant)
- `order` - Sort order (asc, desc)
- `limit` - Results per page
- `offset` - Pagination offset

---

### **Category Routes** (`/api/categories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all categories | Yes |
| GET | `/:id` | Get category by ID | Yes |
| POST | `/` | Create category | Yes |
| PUT | `/:id` | Update category | Yes |
| DELETE | `/:id` | Delete category | Yes |

---

### **Transaction Routes** (`/api/transactions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all transactions | Yes |
| GET | `/:id` | Get transaction by ID | Yes |
| POST | `/simulate` | Parse SMS and create transaction | Yes |
| POST | `/:id/approve` | Approve transaction (creates expense) | Yes |
| POST | `/:id/reject` | Reject transaction | Yes |
| DELETE | `/:id` | Delete transaction | Yes |

**Transaction Status Flow:**
```
PENDING_REVIEW → APPROVED (creates expense)
                → REJECTED
                → DUPLICATE (if duplicate detected)
```

---

### **Shared Expense Routes** (`/api/shared-expenses`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all shared expenses | Yes |
| GET | `/:id` | Get shared expense details | Yes |
| POST | `/` | Create shared expense | Yes |
| PUT | `/:id` | Update shared expense | Yes |
| DELETE | `/:id` | Delete shared expense | Yes |
| POST | `/:id/settle` | Settle participant payment | Yes |

**Shared Expense Status:**
- `OPEN` - No payments settled
- `PARTIALLY_SETTLED` - Some payments settled
- `FULLY_SETTLED` - All payments settled

---

### **Reimbursement Routes** (`/api/reimbursements`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all reimbursements | Yes |
| GET | `/:id` | Get reimbursement details | Yes |
| POST | `/` | Create reimbursement | Yes |
| PUT | `/:id` | Update reimbursement | Yes |
| DELETE | `/:id` | Delete reimbursement (draft only) | Yes |
| POST | `/:id/mark-paid` | Mark reimbursement as paid | Yes |

**Reimbursement Status Flow:**
```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → PAID
                                  → REJECTED
```

---

### **Report Routes** (`/api/reports`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all generated reports | Yes |
| POST | `/generate` | Generate new report | Yes |
| GET | `/:id` | Get report details | Yes |
| GET | `/:id/download` | Download report (PDF/CSV/Excel) | Yes |
| DELETE | `/:id` | Delete report | Yes |

**Query Parameters for GET /:id/download:**
- `format` - `pdf`, `csv`, or `excel`

**Report Types:**
- `MONTHLY` - Single month report
- `QUARTERLY` - 3-month report
- `YEARLY` - 12-month report
- `CUSTOM` - User-defined date range

---

### **Dashboard Routes** (`/api/dashboard`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Get dashboard statistics | Yes |
| GET | `/recent-expenses` | Get recent expenses | Yes |
| GET | `/category-breakdown` | Get spending by category | Yes |
| GET | `/monthly-trend` | Get monthly spending trend | Yes |

---

## 🎮 Controllers

### **1. Auth Controller** (`src/controllers/authController.js`)

**register(req, res, next)**
- Validates email uniqueness
- Hashes password with bcrypt
- Creates user and user_profile records
- Creates default categories
- Generates JWT token
- Returns token and user object

**login(req, res, next)**
- Validates email exists
- Compares password hash
- Generates JWT token
- Updates last_login_at timestamp
- Returns token and user object

**getMe(req, res, next)**
- Gets current user from JWT token
- Returns user profile data

---

### **2. User Controller** (`src/controllers/userController.js`)

**getProfile(req, res, next)**
- Fetches user profile from user_profiles table
- Joins with users table for email
- Returns complete profile

**updateProfile(req, res, next)**
- Updates user_profiles table
- Allowed fields: full_name, age, professional_status, organization, role, monthly_income
- Returns updated profile

**Payment Method Functions:**
- `getPaymentMethods()` - Get all user payment methods
- `createPaymentMethod()` - Add new payment method
- `updatePaymentMethod()` - Update existing method
- `deletePaymentMethod()` - Remove method (with expense check)

---

### **3. Expense Controller** (`src/controllers/expenseController.js`)

**getAllExpenses(req, res, next)**
- Fetches all user expenses
- Joins with categories and payment_methods
- Supports filtering (category, date, amount, merchant)
- Supports sorting (date, amount, merchant)
- Returns expenses with category and payment details

**getExpenseById(req, res, next)**
- Fetches single expense by ID
- Verifies user ownership
- Returns expense with full details

**createExpense(req, res, next)**
- Validates required fields
- Verifies category and payment method belong to user
- Inserts expense with UUID
- Logs audit event
- Returns created expense

**updateExpense(req, res, next)**
- Verifies expense ownership
- Updates allowed fields
- Logs audit event
- Returns updated expense

**deleteExpense(req, res, next)**
- Verifies expense ownership
- Deletes expense (cascades to shared_expenses, reimbursements)
- Logs audit event
- Returns success message

---

### **4. Category Controller** (`src/controllers/categoryController.js`)

**getAllCategories(req, res, next)**
- Fetches all active user categories
- Orders by display_order
- Returns category list

**createCategory(req, res, next)**
- Validates name uniqueness for user
- Sets default color if not provided
- Creates category with UUID
- Returns created category

**updateCategory(req, res, next)**
- Verifies category ownership
- Updates name, color, icon, display_order
- Returns updated category

**deleteCategory(req, res, next)**
- Checks if category is in use by expenses
- Prevents deletion if in use
- Deletes category if unused
- Returns success message

---

### **5. Transaction Controller** (`src/controllers/transactionController.js`)

**getAllTransactions(req, res, next)**
- Fetches all user transactions
- Filters by status (PENDING_REVIEW, APPROVED, REJECTED)
- Orders by created_at DESC
- Returns transaction list

**simulateTransaction(req, res, next)**
- Parses SMS message using smsParser
- Extracts: amount, merchant, date, payment method, bank
- Calculates confidence (HIGH/MEDIUM/LOW)
- Checks for duplicates
- Creates transaction with PENDING_REVIEW status
- Returns parsed transaction

**approveTransaction(req, res, next)**
- Verifies transaction ownership and status
- Creates expense from transaction data
- Updates transaction status to APPROVED
- Links transaction to expense (expense_id)
- Logs audit event
- Returns created expense

**rejectTransaction(req, res, next)**
- Verifies transaction ownership
- Updates status to REJECTED
- Logs rejection reason if provided
- Returns success message

**SMS Parser Logic:**
```javascript
// Example messages:
"HDFC Bank Acct XX4567: Rs 380.00 debited for Swiggy on 22/09/2026"
"SBI Card XX8901: Rs 1250.00 spent at Amazon on 20-09-2026"
"Paytm: Payment of Rs 299.00 to Netflix"

// Extracted data:
{
  amount: 380.00,
  merchant: "Swiggy",
  date: "2026-09-22",
  paymentMethod: "UPI",
  bank: "HDFC Bank",
  confidence: "HIGH"
}
```

---

### **6. Shared Expense Controller** (`src/controllers/sharedExpenseController.js`)

**getAllSharedExpenses(req, res, next)**
- Fetches all shared expenses created by user
- Joins with shared_expense_participants
- Returns shared expense list with participants

**createSharedExpense(req, res, next)**
- Verifies expense ownership
- Creates shared_expenses record
- Creates participant records
- Calculates split amounts based on method (EQUAL/MANUAL/PERCENTAGE)
- Returns created shared expense

**settleParticipant(req, res, next)**
- Verifies shared expense ownership
- Updates participant settlement_status to SETTLED
- Sets settled_at timestamp
- Checks if all participants settled → updates status to FULLY_SETTLED
- Returns updated shared expense

**Split Calculation:**
```javascript
// EQUAL split
shareAmount = totalAmount / numberOfParticipants

// MANUAL split
shareAmount = userSpecifiedAmount

// PERCENTAGE split
shareAmount = (totalAmount * percentage) / 100
```

---

### **7. Reimbursement Controller** (`src/controllers/reimbursementController.js`)

**getReimbursements(req, res, next)**
- Fetches all user reimbursements
- Joins with expenses for expense details
- Filters by status if provided
- Returns reimbursement list

**createReimbursement(req, res, next)**
- Verifies expense ownership
- Creates reimbursement with DRAFT status
- Links to expense
- Returns created reimbursement

**markAsPaid(req, res, next)**
- Verifies reimbursement ownership
- Validates status is APPROVED or SUBMITTED
- Updates status to PAID
- Updates payment_status to PAID
- Sets paid_at timestamp
- Logs audit event
- Returns success message

---

### **8. Report Controller** (`src/controllers/reportController.js`)

**generateReport(req, res, next)**
- Validates date range
- Fetches expenses for period
- Calculates total income, expenses, net amount
- Generates category breakdown
- Generates merchant breakdown
- Creates report record in database
- Returns report data

**downloadReport(req, res, next)**
- Verifies report ownership
- Gets report data from database
- Formats data based on format (PDF/CSV/Excel)
- Streams file to response
- Sets appropriate headers

**PDF Export:**
- Uses PDFKit
- Includes charts and tables
- Professional formatting

**CSV Export:**
- Uses json2csv
- Includes all expense details
- Easy to import to Excel

**Excel Export:**
- Uses ExcelJS
- Multiple sheets (Summary, Expenses, Categories)
- Formatted cells and charts

---

### **9. Dashboard Controller** (`src/controllers/dashboardController.js`)

**getStats(req, res, next)**
- Calculates current month statistics:
  - Total spending
  - Transaction count
  - Average expense
  - Top category
  - Most used payment method
- Gets 7-day spending trend
- Gets top 5 categories with totals
- Gets recent 5 expenses
- Returns dashboard data object

**Calculations:**
```javascript
// Total spending this month
SELECT SUM(amount) FROM expenses 
WHERE user_id = ? 
AND MONTH(expense_date) = MONTH(CURDATE())

// 7-day trend
SELECT DATE(expense_date), SUM(amount) 
FROM expenses 
WHERE user_id = ? 
AND expense_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(expense_date)

// Category breakdown
SELECT category_id, COUNT(*), SUM(amount) 
FROM expenses 
WHERE user_id = ?
GROUP BY category_id
ORDER BY SUM(amount) DESC
```

---

## 🛡️ Middleware

### **1. Auth Middleware** (`src/middleware/auth.js`)

Protects routes requiring authentication.

```javascript
const auth = require('../middleware/auth');

router.get('/expenses', auth, expenseController.getAllExpenses);
```

**Process:**
1. Extract token from Authorization header
2. Verify token with JWT_SECRET
3. Decode user ID from token
4. Attach user to req.user
5. Call next() to proceed

---

### **2. Error Handler** (`src/middleware/errorHandler.js`)

Global error handling middleware.

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

**Error Types:**
- 400 - Bad Request (validation errors)
- 401 - Unauthorized (auth required)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 500 - Internal Server Error

---

### **3. Validation Middleware** (`src/middleware/validator.js`)

Request validation using express-validator.

```javascript
const { body, validationResult } = require('express-validator');

const expenseValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('merchant').trim().notEmpty().withMessage('Merchant is required'),
  body('category_id').isUUID().withMessage('Invalid category ID'),
  body('expense_date').isISO8601().withMessage('Invalid date format')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

module.exports = { expenseValidation, validate };
```

---

### **4. Rate Limiting**

Prevents API abuse.

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', apiLimiter);
```

---

## 📧 Services

### **Email Service** (`src/services/emailService.js`)

Sends email notifications using Nodemailer.

**Configuration:**
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});
```

**Functions:**

**sendReimbursementEmail(recipientEmail, reimbursementData, customBody)**
- Sends reimbursement notification email
- Includes amount, reason, date
- Custom message support
- HTML formatted email

**Email Template:**
```html
Subject: Reimbursement Request - ₹{amount}

Hello,

{claimantName} has submitted a reimbursement request:

Amount: ₹{amount}
Date: {date}
Reason: {reason}

{customBody}

Please reply to this email with your decision or any questions.

Best regards,
Expense Tracker Team
```

**Setup Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords
4. Generate password for "Mail"
5. Use in EMAIL_APP_PASSWORD env variable

---

## 🔒 Security

### **1. Helmet** - Security Headers
```javascript
const helmet = require('helmet');
app.use(helmet());
```

Sets security-related HTTP headers:
- X-DNS-Prefetch-Control
- X-Frame-Options
- Strict-Transport-Security
- X-Download-Options
- X-Content-Type-Options
- X-XSS-Protection

### **2. CORS** - Cross-Origin Resource Sharing
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### **3. SQL Injection Protection**
- Parameterized queries only
- No string concatenation in SQL
```javascript
// ✅ SAFE
db.query('SELECT * FROM expenses WHERE id = ?', [id]);

// ❌ DANGEROUS
db.query(`SELECT * FROM expenses WHERE id = '${id}'`);
```

### **4. Password Security**
- Bcrypt hashing (10 rounds)
- Never store plain text passwords
- Salting included automatically

### **5. JWT Security**
- Strong secret key (long random string)
- Token expiration (7 days)
- Verify signature on every request

### **6. Input Validation**
- Express-validator on all endpoints
- Sanitize user input
- Type checking

### **7. Rate Limiting**
- 100 requests per 15 minutes per IP
- Prevents brute force attacks

---

## ⚠️ Error Handling

### **Standard Error Response Format**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### **Success Response Format**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### **Try-Catch Pattern**
```javascript
exports.controllerFunction = async (req, res, next) => {
  try {
    // Business logic
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

---

## 📝 Logging

### **Morgan HTTP Logger**
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

**Log Format:**
```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

**Example Log:**
```
::1 - - [25/Sep/2026:10:30:15 +0000] "GET /api/expenses HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
```

---

## 🧪 Testing

### **Test API Endpoints**
```bash
./test-apis.sh
```

**Manual Testing with cURL:**

**Register:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Expenses (with token):**
```bash
curl http://localhost:5001/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Deployment

### **Environment Variables** (`.env`)
```env
# Server
PORT=5001
NODE_ENV=production

# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=expense_tracker

# JWT
JWT_SECRET=your-long-random-secret-key

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

### **Start in Production**
```bash
NODE_ENV=production npm start
```

### **PM2 Process Manager**
```bash
npm install -g pm2
pm2 start src/server.js --name expense-api
pm2 startup
pm2 save
```

---

## 📊 Database Queries

### **Common Queries**

**Get user's total spending:**
```sql
SELECT SUM(amount) as total_spending
FROM expenses
WHERE user_id = ?
AND MONTH(expense_date) = MONTH(CURDATE())
```

**Get category breakdown:**
```sql
SELECT c.name, c.color, COUNT(e.id) as count, SUM(e.amount) as total
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = ?
GROUP BY c.id
ORDER BY total DESC
```

**Get recent expenses with details:**
```sql
SELECT e.*, c.name as category_name, c.color as category_color,
       pm.name as payment_method_name, pm.type as payment_method_type
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
WHERE e.user_id = ?
ORDER BY e.expense_date DESC, e.created_at DESC
LIMIT 10
```

---

## 🔍 Troubleshooting

### **Database Connection Errors**
- Check AWS RDS security group
- Verify DB credentials in .env
- Test connection: `mysql -h HOST -u USER -p`

### **JWT Errors**
- Ensure JWT_SECRET is set
- Check token expiration
- Verify token format in Authorization header

### **CORS Errors**
- Verify FRONTEND_URL matches exactly
- Check browser console for origin
- Ensure credentials: true is set

### **Email Sending Fails**
- Verify Gmail app password
- Check email in spam folder
- Enable "Less secure app access" (if needed)

---

## 📚 API Documentation Tools

**Postman Collection:**
- Import API endpoints
- Save example requests
- Test all routes

**Swagger/OpenAPI:**
- Auto-generate API docs
- Interactive testing interface

---

**Next:** [Database Documentation](./DATABASE.md) | [Back to Overview](./README.md)
