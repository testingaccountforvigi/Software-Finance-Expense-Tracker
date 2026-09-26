# Personal Finance & Expense Management - Backend API

Production-ready Node.js/Express backend with MySQL database for the Personal Finance application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with bcrypt password hashing
- **Expense Management**: Full CRUD with filtering, pagination, and search
- **Category Management**: Custom categories with drag-and-drop ordering
- **Dashboard Analytics**: Real-time summaries, trends, and breakdowns
- **Transaction Simulator**: Bank/card transaction import simulation
- **Receipt Parser**: Parse receipt text to create transactions
- **Shared Expenses**: Split bills with friends using equal/percentage/custom splits
- **Reimbursements**: Full workflow from draft → submitted → approved → paid
- **Reports & Export**: Generate reports with PDF/CSV/Excel export
- **Security**: Helmet, CORS, rate limiting, SQL injection protection
- **Audit Logging**: Track important user actions

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js    # Registration, login, logout
│   │   ├── userController.js    # Profile management
│   │   ├── expenseController.js # Expense CRUD
│   │   ├── categoryController.js # Category CRUD
│   │   ├── dashboardController.js # Analytics
│   │   ├── transactionController.js # Transaction simulation
│   │   ├── sharedExpenseController.js # Shared expenses
│   │   ├── reimbursementController.js # Reimbursement workflow
│   │   └── reportController.js  # Reports & exports
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── sharedExpenseRoutes.js
│   │   ├── reimbursementRoutes.js
│   │   └── reportRoutes.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── expenseValidator.js
│   │   ├── categoryValidator.js
│   │   ├── transactionValidator.js
│   │   ├── sharedExpenseValidator.js
│   │   ├── reimbursementValidator.js
│   │   └── reportValidator.js
│   ├── app.js                   # Express app setup
│   └── server.js                # Server startup
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
├── API_DOCUMENTATION.md         # Complete API reference
└── README.md                    # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.4.x (AWS RDS)
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Export**: pdfkit, json2csv, exceljs
- **Logging**: morgan
- **Development**: nodemon

## 📋 Prerequisites

- Node.js 16+ and npm
- MySQL 8.4.x database (AWS RDS or local)
- Database schema and demo data loaded (see database folder)

## 🔧 Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5001
NODE_ENV=development

# Database Configuration
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=expense_tracker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

3. **Initialize the database**:

Run the SQL files in order:
```bash
# Connect to your MySQL database
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>

# Run schema first
source ../database/schema.sql

# Then run demo data
source ../database/demo-data.sql
```

## 🚀 Running the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5001` (or your configured PORT).

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5001/health
```

### Login with Demo User
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo@123"
  }'
```

This returns a JWT token that you can use for authenticated requests.

### Get Expenses (with token)
```bash
curl http://localhost:5001/api/expenses \
  -H "Authorization: Bearer <your_token_here>"
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with all endpoints, request/response examples, and authentication details.

### Quick API Overview

- **Authentication**: `/api/auth/*` - Register, login, logout
- **User Profile**: `/api/users/*` - Profile and payment methods
- **Expenses**: `/api/expenses/*` - Full CRUD with filters
- **Categories**: `/api/categories/*` - CRUD and reordering
- **Dashboard**: `/api/dashboard/*` - Analytics and trends
- **Transactions**: `/api/transactions/*` - Simulation and parsing
- **Shared Expenses**: `/api/shared-expenses/*` - Bill splitting
- **Reimbursements**: `/api/reimbursements/*` - Reimbursement workflow
- **Reports**: `/api/reports/*` - Generate and export reports

## 🔐 Security Features

- **JWT Authentication**: 7-day token expiration
- **Password Hashing**: bcrypt with 10 salt rounds
- **SQL Injection Protection**: Parameterized queries only
- **XSS Protection**: Helmet middleware
- **CORS**: Configured for frontend origin
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **User Isolation**: All queries filtered by user_id
- **Audit Logging**: Important actions logged to audit_events table

## 🗄️ Database

### Tables (14 total)
- `users` - User accounts
- `user_profiles` - Extended user information
- `payment_methods` - User payment methods
- `categories` - Expense categories
- `expenses` - Expense records
- `transactions` - Simulated/imported transactions
- `shared_expenses` - Shared expense records
- `shared_expense_participants` - Shared expense participants
- `reimbursements` - Reimbursement requests
- `reimbursement_documents` - Supporting documents
- `reports` - Generated reports
- `audit_events` - Audit trail

### Views (3 total)
- `v_expense_summary` - User expense summaries
- `v_monthly_expense_summary` - Monthly aggregates
- `v_category_spending` - Category spending analysis

### Stored Procedures (2 total)
- `sp_get_monthly_stats` - Monthly statistics
- `sp_detect_duplicate_transaction` - Duplicate detection

## 📊 Data Flow

1. **User Registration**: Creates user + profile + 10 default categories in transaction
2. **User Login**: Returns JWT token valid for 7 days
3. **Authenticated Requests**: Token validated by auth middleware, userId extracted
4. **Authorization**: All queries filtered by user_id to prevent cross-user access
5. **Audit Logging**: Important actions logged with IP and user agent

## 🐛 Common Issues

### Database Connection Error
- Verify AWS RDS endpoint is correct
- Check security group allows inbound traffic on port 3306
- Ensure database credentials are correct
- Test connection: `mysql -h <host> -u <user> -p`

### JWT Token Invalid
- Token expires after 7 days - login again
- Ensure JWT_SECRET matches between requests
- Check Authorization header format: `Bearer <token>`

### Category Already Exists
- Category names must be unique per user
- Use case-insensitive comparison

### Reimbursement Submit Failed
- At least one document must be attached before submission
- Only draft status can be submitted

## 🔄 Development Workflow

1. Make changes to controllers/routes/validators
2. nodemon automatically restarts server
3. Test with curl, Postman, or Thunder Client
4. Check logs in terminal
5. Verify database changes with MySQL client

## 📦 NPM Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm install` - Install all dependencies

## 🚢 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Change `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (generate with crypto)
- [ ] Configure production database (AWS RDS)
- [ ] Update CORS `FRONTEND_URL` to production domain
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Set up backup strategy for database
- [ ] Configure logging (Winston, CloudWatch, etc.)
- [ ] Set up monitoring (health checks, error tracking)
- [ ] Review rate limits for production traffic
- [ ] Enable database connection pooling optimizations

## 🤝 Contributing

1. Follow existing code structure and naming conventions
2. Use parameterized queries - never string concatenation
3. Always filter by user_id for user-specific data
4. Add validation for all user inputs
5. Log important actions to audit_events
6. Handle errors gracefully with try-catch
7. Return consistent response format: `{ success, message, data }`

## 📝 License

This project is part of an academic assignment.

## 👥 Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review error messages in terminal logs
3. Check database connection and credentials
4. Verify JWT token is valid and not expired

## 🎯 Next Steps

1. Complete frontend integration (see frontend folder)
2. Set up file upload for receipts (AWS S3 or similar)
3. Implement email notifications for shared expenses and reimbursements
4. Add real OCR for receipt parsing (AWS Textract, Google Vision)
5. Set up automated tests
6. Configure CI/CD pipeline
7. Add WebSocket support for real-time updates
