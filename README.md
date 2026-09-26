# Personal Finance & Expense Management System

A complete full-stack web application for managing personal finances, expenses, and reimbursements.

---

## 📚 Complete Documentation

**For comprehensive documentation, see the [docs](./docs/) folder:**

- **[📖 Project Overview](./docs/README.md)** - Complete guide with setup, architecture, and features
- **[⚛️ Frontend Documentation](./docs/FRONTEND.md)** - React architecture, components, pages, and state management  
- **[🔧 Backend Documentation](./docs/BACKEND.md)** - Node.js/Express API, controllers, routes, and authentication
- **[🗄️ Database Documentation](./docs/DATABASE.md)** - MySQL schema, tables, relationships, and queries

---

## 🌟 Features

### Core Features
- ✅ **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- ✅ **Expense Tracking**: Add, edit, delete, and categorize expenses
- ✅ **Category Management**: Custom categories with colors and icons
- ✅ **Dashboard Analytics**: Real-time spending summaries, trends, and insights
- ✅ **Advanced Filtering**: Filter expenses by date, category, amount, merchant
- ✅ **Search**: Full-text search across expenses

### Advanced Features
- ✅ **Transaction Simulator**: Simulate bank/card transaction imports
- ✅ **Receipt Parser**: Parse receipt text to create expenses
- ✅ **Shared Expenses**: Split bills with friends (equal/percentage/custom splits)
- ✅ **Reimbursements**: Complete workflow (Draft → Submit → Review → Approve → Paid)
- ✅ **Reports & Export**: Generate reports in PDF, CSV, and Excel formats
- ✅ **Payment Methods**: Manage multiple payment methods
- ✅ **Audit Logging**: Track all important user actions

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- Context API (state management)

**Backend:**
- Node.js 16+
- Express.js
- MySQL 8.4.x
- JWT (authentication)
- bcrypt (password hashing)

**Database:**
- MySQL 8.4.x (AWS RDS compatible)
- 12 normalized tables
- 3 views for analytics
- 2 stored procedures
- Foreign key constraints

### Project Structure

```
Software 3/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/      # Database connection
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Auth, error handling
│   │   ├── routes/      # API routes
│   │   ├── validators/  # Input validation
│   │   ├── app.js      # Express setup
│   │   └── server.js   # Server startup
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   └── test-api.sh     # API testing script
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # State management
│   │   ├── pages/      # Page components
│   │   └── layouts/    # Layout components
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── database/            # SQL scripts
│   ├── schema.sql                 # Database schema
│   ├── insert-demo-data.sql      # Demo data for custom user
│   └── verify-database.sql       # Database verification
│
├── docs/
│   ├── FEATURE_AUDIT.md          # Feature mapping
│   └── BACKEND_COMPLETION_STATUS.md
│
├── SETUP_GUIDE.md      # Detailed setup instructions
├── start-all.sh        # Start all services
├── stop-all.sh         # Stop all services
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.4.x
- npm or yarn

### Installation (5 steps)

1. **Setup Database**
```bash
mysql -u root -p
source database/schema.sql
```

2. **Configure Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

3. **Configure Frontend**
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5001/api" > .env
```

4. **Register User & Insert Demo Data**
```bash
# Start backend first
cd backend && npm run dev

# In another terminal, register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"mahesh@gmail.com","password":"Mahesh@123","full_name":"Mahesh Kumar"}'

# Insert demo data
mysql -u root -p
source database/insert-demo-data.sql
```

5. **Start Application**
```bash
# Option 1: Use convenience script
./start-all.sh

# Option 2: Manual start
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Access the application at: **http://localhost:5173**

### Login Credentials
```
Email: mahesh@gmail.com
Password: Mahesh@123
```

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete step-by-step setup instructions
- **[backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)** - Complete API reference
- **[backend/README.md](./backend/README.md)** - Backend documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend documentation
- **[docs/FEATURE_AUDIT.md](./docs/FEATURE_AUDIT.md)** - Feature mapping document

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses (with filters & pagination)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/category-breakdown` - Category spending
- `GET /api/dashboard/trends` - Spending trends
- `GET /api/dashboard/top-merchants` - Top merchants

### Transactions
- `GET /api/transactions` - Get pending transactions
- `POST /api/transactions/simulate` - Simulate transactions
- `POST /api/transactions/parse` - Parse receipt
- `POST /api/transactions/:id/approve` - Approve transaction
- `POST /api/transactions/:id/reject` - Reject transaction

### Shared Expenses
- `GET /api/shared-expenses` - Get shared expenses
- `POST /api/shared-expenses` - Create shared expense
- `PATCH /api/shared-expenses/:id/participants/:participantId/settle` - Settle payment

### Reimbursements
- `GET /api/reimbursements` - Get reimbursements
- `POST /api/reimbursements` - Create reimbursement
- `POST /api/reimbursements/:id/submit` - Submit for review
- `POST /api/reimbursements/:id/approve` - Approve
- `POST /api/reimbursements/:id/reject` - Reject

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/:id/export/pdf` - Export as PDF
- `GET /api/reports/:id/export/csv` - Export as CSV
- `GET /api/reports/:id/export/excel` - Export as Excel

**Total: 55+ endpoints**

See [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for complete details.

## 🧪 Testing

### Test Backend APIs
```bash
cd backend
./test-api.sh
```

### Test in Browser
1. Login at http://localhost:5173
2. Open DevTools (F12)
3. Check Console for errors
4. Check Network tab for API calls

### Verify Database
```bash
mysql -u root -p
source database/verify-database.sql
```

## 🔐 Security Features

- **Authentication**: JWT tokens (7-day expiration)
- **Password Hashing**: bcrypt with 10 salt rounds
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Helmet middleware
- **CORS**: Configured for specific origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **User Isolation**: All queries filtered by user_id
- **Audit Logging**: Important actions tracked

## 📊 Database Schema

### Tables (12)
- `users` - User accounts
- `user_profiles` - User profiles
- `payment_methods` - Payment methods
- `categories` - Expense categories
- `expenses` - Expense records
- `transactions` - Simulated transactions
- `shared_expenses` - Shared expense records
- `shared_expense_participants` - Participants
- `reimbursements` - Reimbursement requests
- `reimbursement_documents` - Documents
- `reports` - Generated reports
- `audit_events` - Audit trail

### Views (3)
- `v_expense_summary` - User expense summaries
- `v_monthly_expense_summary` - Monthly aggregates
- `v_category_spending` - Category analysis

### Stored Procedures (2)
- `sp_get_monthly_stats` - Monthly statistics
- `sp_detect_duplicate_transaction` - Duplicate detection

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon (auto-reload)
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts with Vite HMR
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
```

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify credentials in backend/.env
- Check port 5001 is free: `lsof -i :5001`

### Frontend shows network errors
- Ensure backend is running on port 5001
- Check VITE_API_URL in frontend/.env
- Verify CORS settings in backend

### Database connection errors
- Verify MySQL server is running
- Check credentials match .env
- Test connection: `mysql -u root -p`

### Cannot login
- Verify user exists: `SELECT * FROM users WHERE email='mahesh@gmail.com';`
- Check password is correct
- Ensure JWT_SECRET is set in backend/.env

## 🎯 Features Implemented

### User Features (56 total)
1. User Registration & Login ✅
2. Profile Management ✅
3. Dashboard with Analytics ✅
4. Expense CRUD ✅
5. Category Management ✅
6. Advanced Filtering ✅
7. Search Functionality ✅
8. Transaction Import ✅
9. Receipt Parsing ✅
10. Shared Expenses ✅
11. Reimbursement Workflow ✅
12. Report Generation ✅
13. Export (PDF/CSV/Excel) ✅

See [FEATURE_AUDIT.md](./docs/FEATURE_AUDIT.md) for complete list.

## 📦 NPM Packages

### Backend Dependencies
- express, mysql2, bcryptjs, jsonwebtoken
- cors, helmet, express-rate-limit
- express-validator, morgan
- pdfkit, json2csv, exceljs
- uuid, dotenv

### Frontend Dependencies
- react, react-dom, react-router-dom
- tailwindcss, postcss, autoprefixer
- vite

## 🚢 Deployment

### Database (AWS RDS)
1. Create MySQL 8.4.x instance
2. Configure security groups
3. Run schema.sql
4. Update backend .env with RDS endpoint

### Backend
1. Update .env for production
2. Set NODE_ENV=production
3. Use strong JWT_SECRET
4. Configure CORS for production domain
5. Deploy to AWS EC2, Heroku, or similar

### Frontend
1. Update VITE_API_URL
2. Run `npm run build`
3. Deploy dist/ to AWS S3, Netlify, or Vercel

## 📄 License

This project is part of an academic assignment for Semester 5.

## 👥 Authors

- Mahesh Kumar (Student)

## 🙏 Acknowledgments

- Course instructors
- Open source libraries used
- Community resources

## 📞 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)
3. Check error logs in terminal
4. Verify database with verify-database.sql
5. Test APIs with test-api.sh

## 🎓 Academic Use

This project demonstrates:
- Full-stack web development
- RESTful API design
- Database normalization
- Authentication & authorization
- Security best practices
- Clean code architecture
- Documentation practices

---

**Made with ❤️ for Software Engineering Course - Semester 5**
