# Personal Finance API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication (`/api/auth`)

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}

Response: {
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "token": "jwt_token"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: {
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "token": "jwt_token"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "user": { ... },
    "profile": { ... }
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 2. User Profile (`/api/users`)

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "+1234567890",
  "currency": "USD",
  "timezone": "America/New_York",
  "monthly_budget": 5000
}
```

### Get Payment Methods
```http
GET /api/users/payment-methods
Authorization: Bearer <token>
```

---

## 3. Expenses (`/api/expenses`)

### Get All Expenses
```http
GET /api/expenses?page=1&limit=20&categoryId=uuid&startDate=2024-01-01&endDate=2024-12-31&search=coffee&minAmount=5&maxAmount=100&source=manual&status=active
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20, max: 100)
- categoryId: Filter by category UUID
- startDate: Filter by start date (YYYY-MM-DD)
- endDate: Filter by end date (YYYY-MM-DD)
- search: Search in merchant/description
- minAmount: Minimum amount
- maxAmount: Maximum amount
- source: manual, bank_import, credit_card, receipt_scan
- status: active, deleted

Response: {
  "success": true,
  "data": {
    "expenses": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Get Expense by ID
```http
GET /api/expenses/:id
Authorization: Bearer <token>
```

### Create Expense
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-09-22",
  "amount": 45.99,
  "currency": "USD",
  "merchant": "Starbucks",
  "description": "Morning coffee",
  "category_id": "category-uuid",
  "payment_method": "credit_card",
  "receipt_url": "https://...",
  "notes": "Team meeting"
}
```

### Update Expense
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "notes": "Updated notes"
}
```

### Delete Expense
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

---

## 4. Categories (`/api/categories`)

### Get All Categories
```http
GET /api/categories
Authorization: Bearer <token>
```

### Create Category
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Entertainment",
  "icon": "ticket",
  "color": "#9333EA"
}
```

### Update Category
```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Entertainment & Fun",
  "icon": "star",
  "color": "#A855F7"
}
```

### Delete Category
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

### Reorder Categories
```http
POST /api/categories/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "category_orders": [
    { "id": "uuid1", "display_order": 1 },
    { "id": "uuid2", "display_order": 2 }
  ]
}
```

---

## 5. Dashboard (`/api/dashboard`)

### Get Summary
```http
GET /api/dashboard/summary?period=month&date=2024-09-22
Authorization: Bearer <token>

Query Parameters:
- period: day, week, month, year, all (default: month)
- date: Reference date (default: today)

Response: {
  "success": true,
  "data": {
    "total_income": 5000,
    "total_expenses": 3500,
    "remaining_budget": 1500,
    "transaction_count": 45
  }
}
```

### Get Category Breakdown
```http
GET /api/dashboard/category-breakdown?period=month&date=2024-09-22
Authorization: Bearer <token>
```

### Get Trends
```http
GET /api/dashboard/trends?groupBy=day&startDate=2024-09-01&endDate=2024-09-30
Authorization: Bearer <token>

Query Parameters:
- groupBy: day, month, year (default: day)
- startDate: Start date (default: 30 days ago)
- endDate: End date (default: today)
```

### Get Top Merchants
```http
GET /api/dashboard/top-merchants?period=month&limit=10
Authorization: Bearer <token>
```

---

## 6. Transactions (`/api/transactions`)

### Get All Transactions
```http
GET /api/transactions?status=pending
Authorization: Bearer <token>

Query Parameters:
- status: pending, approved, rejected
```

### Simulate Transactions
```http
POST /api/transactions/simulate
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 5
}
```

### Parse Receipt
```http
POST /api/transactions/parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "receipt_text": "Starbucks\n09/22/2024\nCoffee $4.50\nTotal $4.50"
}
```

### Approve Transaction
```http
POST /api/transactions/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "category_id": "uuid",
  "notes": "Approved"
}
```

### Reject Transaction
```http
POST /api/transactions/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Duplicate transaction"
}
```

### Check Duplicates
```http
GET /api/transactions/:id/duplicates
Authorization: Bearer <token>
```

---

## 7. Shared Expenses (`/api/shared-expenses`)

### Get All Shared Expenses
```http
GET /api/shared-expenses?status=active
Authorization: Bearer <token>

Query Parameters:
- status: active, settled, cancelled
```

### Get Shared Expense by ID
```http
GET /api/shared-expenses/:id
Authorization: Bearer <token>
```

### Create Shared Expense
```http
POST /api/shared-expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "expense_id": "expense-uuid",
  "title": "Dinner with friends",
  "split_method": "equal",
  "participants": [
    {
      "email": "friend1@example.com",
      "user_id": "user-uuid-optional"
    },
    {
      "email": "friend2@example.com"
    }
  ]
}

Split Methods:
- equal: Split equally among participants
- percentage: Each participant has share_percentage field
- custom: Each participant has amount_owed field
```

### Settle Participant
```http
PATCH /api/shared-expenses/:id/participants/:participantId/settle
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount_paid": 25.00
}
```

### Send Reminder
```http
POST /api/shared-expenses/:id/remind
Authorization: Bearer <token>
```

### Delete Shared Expense
```http
DELETE /api/shared-expenses/:id
Authorization: Bearer <token>
```

---

## 8. Reimbursements (`/api/reimbursements`)

### Get All Reimbursements
```http
GET /api/reimbursements?status=submitted&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>

Query Parameters:
- status: draft, submitted, under_review, approved, rejected, paid
- start_date: Filter by submission date
- end_date: Filter by submission date
```

### Get Reimbursement by ID
```http
GET /api/reimbursements/:id
Authorization: Bearer <token>
```

### Create Reimbursement
```http
POST /api/reimbursements
Authorization: Bearer <token>
Content-Type: application/json

{
  "expense_id": "expense-uuid-optional",
  "title": "Business travel expenses",
  "description": "Trip to NYC for client meeting",
  "amount": 250.00,
  "currency": "USD"
}
```

### Update Reimbursement (Draft only)
```http
PUT /api/reimbursements/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "amount": 275.00
}
```

### Submit Reimbursement
```http
POST /api/reimbursements/:id/submit
Authorization: Bearer <token>
```

### Approve Reimbursement
```http
POST /api/reimbursements/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "reviewer_notes": "Approved for processing"
}
```

### Reject Reimbursement
```http
POST /api/reimbursements/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejection_reason": "Missing required documentation"
}
```

### Mark as Paid
```http
POST /api/reimbursements/:id/mark-paid
Authorization: Bearer <token>
```

### Add Document
```http
POST /api/reimbursements/:id/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_type": "receipt",
  "file_name": "receipt.pdf",
  "file_url": "https://...",
  "file_size": 152400
}

Document Types: receipt, invoice, approval, other
```

### Remove Document (Draft only)
```http
DELETE /api/reimbursements/:id/documents/:documentId
Authorization: Bearer <token>
```

### Delete Reimbursement (Draft only)
```http
DELETE /api/reimbursements/:id
Authorization: Bearer <token>
```

---

## 9. Reports (`/api/reports`)

### Get All Reports
```http
GET /api/reports
Authorization: Bearer <token>
```

### Generate Report
```http
POST /api/reports/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "report_type": "summary",
  "report_period": "monthly",
  "start_date": "2024-09-01",
  "end_date": "2024-09-30"
}

Report Types: summary, detailed, category, merchant
Report Periods: monthly, quarterly, yearly, custom
```

### Export Report as PDF
```http
GET /api/reports/:id/export/pdf
Authorization: Bearer <token>
```

### Export Report as CSV
```http
GET /api/reports/:id/export/csv
Authorization: Bearer <token>
```

### Export Report as Excel
```http
GET /api/reports/:id/export/excel
Authorization: Bearer <token>
```

### Export Transactions Directly
```http
GET /api/reports/export/transactions?format=csv&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>

Query Parameters:
- format: csv, json
- start_date: Required
- end_date: Required
```

### Delete Report
```http
DELETE /api/reports/:id
Authorization: Bearer <token>
```

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (access denied)
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Applies to all `/api/*` endpoints

---

## Demo User
```
Email: demo@example.com
Password: Demo@123
```

The demo user has pre-populated data including:
- 30 sample expenses across different categories
- 10 default categories
- 2 pending transactions
- Sample shared expenses and reimbursements
