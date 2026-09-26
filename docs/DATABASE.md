# Database Documentation

**Personal Finance & Expense Management System - MySQL Database Schema**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Configuration](#database-configuration)
3. [Schema Overview](#schema-overview)
4. [Tables](#tables)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Views](#views)
8. [Stored Procedures](#stored-procedures)
9. [Data Types](#data-types)
10. [Queries](#queries)
11. [Backup & Restore](#backup--restore)

---

## 🎯 Overview

The database is built on **MySQL 8.0+** hosted on **AWS RDS** with full relational integrity, CASCADE deletes, and optimized indexes for performance.

**Key Features:**
- **13 tables** with foreign key relationships
- **UUID primary keys** for security and scalability
- **CASCADE deletes** for data consistency
- **Indexes** on frequently queried columns
- **Views** for common query patterns
- **Stored procedures** for complex operations
- **Full UTF-8 support** (utf8mb4_unicode_ci)

**Database:** `expense_tracker`  
**Collation:** `utf8mb4_unicode_ci`  
**Engine:** `InnoDB`

---

## 🔧 Database Configuration

### **AWS RDS Setup**

**Connection Details:**
```
Host: personal-finance.c4jeiqqogk52.us-east-1.rds.amazonaws.com
Port: 3306
Database: expense_tracker
User: drae
Engine: MySQL 8.0.35
Instance: db.t3.micro (Free Tier)
Storage: 20 GB SSD
Multi-AZ: No (for development)
```

**Security Group:**
- Allow inbound on port 3306 from your IP
- Allow from backend server IP

**Connection String:**
```javascript
mysql://drae:password@personal-finance.c4jeiqqogk52.us-east-1.rds.amazonaws.com:3306/expense_tracker
```

---

## 📊 Schema Overview

### **Entity Relationship Diagram**

```
users (1) ──────┐
                │
                ├── user_profiles (1:1)
                │
                ├── categories (1:N)
                │
                ├── payment_methods (1:N)
                │
                ├── expenses (1:N) ──┬── shared_expenses (1:1) ── shared_expense_participants (1:N)
                │                    │
                │                    ├── reimbursements (1:1) ── reimbursement_documents (1:N)
                │                    │
                │                    └── transactions (1:1)
                │
                ├── reports (1:N)
                │
                └── audit_events (1:N)
```

### **Table Count: 13**
1. users
2. user_profiles
3. categories
4. payment_methods
5. expenses
6. transactions
7. shared_expenses
8. shared_expense_participants
9. reimbursements
10. reimbursement_documents
11. reports
12. audit_events
13. schema_version

---

## 📋 Tables

### **1. users**
**Purpose:** User authentication and account management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | User unique ID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email (login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| status | ENUM | DEFAULT 'ACTIVE' | ACTIVE/SUSPENDED/DELETED |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| last_login_at | DATETIME | NULL | Last login timestamp |
| created_at | DATETIME | DEFAULT NOW | Account creation |
| updated_at | DATETIME | ON UPDATE | Last update |

**Indexes:**
- `idx_email` on email
- `idx_status` on status
- `idx_created_at` on created_at

**Sample Data:**
```sql
{
  id: 'ca9ee444-b6c0-11f1-a06d-12ffe3792eb7',
  email: 'mahesh@gmail.com',
  password_hash: '$2a$10$...',
  status: 'ACTIVE',
  email_verified: true,
  last_login_at: '2026-09-25 10:30:00'
}
```

---

### **2. user_profiles**
**Purpose:** User profile information and preferences

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Profile ID |
| user_id | CHAR(36) | NOT NULL, UNIQUE, FK | References users.id |
| full_name | VARCHAR(255) | NOT NULL | User full name |
| age | INT | NULL | User age |
| professional_status | VARCHAR(100) | NULL | Student/Working/Business |
| organization | VARCHAR(255) | NULL | Company/School name |
| role | VARCHAR(100) | NULL | Job title/position |
| currency | VARCHAR(3) | DEFAULT 'INR' | Preferred currency |
| monthly_income | DECIMAL(15,2) | DEFAULT 0.00 | Monthly income |
| created_at | DATETIME | DEFAULT NOW | Profile creation |
| updated_at | DATETIME | ON UPDATE | Last update |

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE

**Sample Data:**
```sql
{
  user_id: 'ca9ee444-b6c0-11f1-a06d-12ffe3792eb7',
  full_name: 'Mahesh Rajpurohit',
  age: 25,
  professional_status: 'Working',
  organization: 'Tech Corp',
  role: 'Software Engineer',
  currency: 'INR',
  monthly_income: 50000.00
}
```

---

### **3. categories**
**Purpose:** Expense categorization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Category ID |
| user_id | CHAR(36) | NOT NULL, FK | References users.id |
| name | VARCHAR(100) | NOT NULL | Category name |
| color | VARCHAR(7) | DEFAULT '#6b7280' | Hex color code |
| icon | VARCHAR(50) | NULL | Icon identifier |
| active | BOOLEAN | DEFAULT TRUE | Active status |
| display_order | INT | DEFAULT 0 | Sort order |
| is_default | BOOLEAN | DEFAULT FALSE | System default |
| created_at | DATETIME | DEFAULT NOW | Created date |
| updated_at | DATETIME | ON UPDATE | Last update |

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE

**Unique Constraint:**
- (user_id, name) - Each user can't have duplicate category names

**Indexes:**
- `idx_user_id` on user_id
- `idx_active` on active
- `idx_order` on display_order

**Default Categories:**
```sql
Food & Dining (#10b981)
Transport (#3b82f6)
Shopping (#f59e0b)
Entertainment (#8b5cf6)
Health & Fitness (#ef4444)
Bills & Utilities (#6b7280)
Education (#06b6d4)
Travel (#ec4899)
Personal Care (#14b8a6)
Other (#64748b)
```

---

### **4. payment_methods**
**Purpose:** User payment methods (cards, UPI, cash)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Payment method ID |
| user_id | CHAR(36) | NOT NULL, FK | References users.id |
| name | VARCHAR(255) | NOT NULL | Method name |
| type | ENUM | NOT NULL | CREDIT_CARD/DEBIT_CARD/UPI/CASH/BANK_TRANSFER/OTHER |
| bank | VARCHAR(100) | NULL | Bank name |
| last_four | VARCHAR(4) | NULL | Last 4 digits |
| is_default | BOOLEAN | DEFAULT FALSE | Default method |
| active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | DATETIME | DEFAULT NOW | Created date |
| updated_at | DATETIME | ON UPDATE | Last update |

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE

**Indexes:**
- `idx_user_id` on user_id
- `idx_active` on active
- `idx_type` on type

**Sample Data:**
```sql
{
  name: 'HDFC Credit Card',
  type: 'CREDIT_CARD',
  bank: 'HDFC Bank',
  last_four: '4567',
  is_default: true
}
```

---

### **5. expenses**
**Purpose:** Main expense records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Expense ID |
| user_id | CHAR(36) | NOT NULL, FK | References users.id |
| amount | DECIMAL(15,2) | NOT NULL | Expense amount |
| currency | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| merchant | VARCHAR(255) | NOT NULL | Merchant/vendor name |
| description | TEXT | NULL | Expense description |
| category_id | CHAR(36) | NOT NULL, FK | References categories.id |
| payment_method_id | CHAR(36) | NULL, FK | References payment_methods.id |
| expense_date | DATE | NOT NULL | Date of expense |
| expense_time | TIME | NULL | Time of expense |
| source | ENUM | DEFAULT 'MANUAL' | MANUAL/SIMULATED_NOTIFICATION/IMPORTED |
| status | ENUM | DEFAULT 'COMPLETED' | COMPLETED/PENDING/CANCELLED |
| receipt_url | VARCHAR(500) | NULL | Receipt file URL |
| notes | TEXT | NULL | Additional notes |
| tags | JSON | NULL | Custom tags array |
| created_at | DATETIME | DEFAULT NOW | Record created |
| updated_at | DATETIME | ON UPDATE | Last update |

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE
- category_id → categories(id) ON DELETE RESTRICT
- payment_method_id → payment_methods(id) ON DELETE SET NULL

**Indexes:**
- `idx_user_id` on user_id
- `idx_expense_date` on expense_date
- `idx_category_id` on category_id
- `idx_merchant` on merchant
- `idx_amount` on amount
- `idx_status` on status
- `idx_user_date` on (user_id, expense_date)

**Sample Data:**
```sql
{
  id: 'expense-uuid',
  user_id: 'user-uuid',
  amount: 450.00,
  currency: 'INR',
  merchant: 'Dominos Pizza',
  description: 'Dinner with friends',
  category_id: 'food-category-uuid',
  payment_method_id: 'credit-card-uuid',
  expense_date: '2026-09-25',
  source: 'MANUAL',
  status: 'COMPLETED'
}
```

---

### **6. transactions**
**Purpose:** Simulated SMS transaction notifications pending review

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Transaction ID |
| user_id | CHAR(36) | NOT NULL, FK | References users.id |
| raw_message | TEXT | NOT NULL | Original SMS message |
| parsed_amount | DECIMAL(15,2) | NULL | Extracted amount |
| parsed_merchant | VARCHAR(255) | NULL | Extracted merchant |
| parsed_date | DATE | NULL | Extracted date |
| parsed_payment_method | VARCHAR(50) | NULL | Extracted method |
| parsed_bank | VARCHAR(100) | NULL | Extracted bank |
| confidence | ENUM | DEFAULT 'MEDIUM' | HIGH/MEDIUM/LOW |
| status | ENUM | DEFAULT 'PENDING_REVIEW' | PENDING_REVIEW/APPROVED/REJECTED/DUPLICATE |
| duplicate_of | CHAR(36) | NULL, FK | References transactions.id |
| expense_id | CHAR(36) | NULL, FK | References expenses.id |
| created_at | DATETIME | DEFAULT NOW | Created date |
| processed_at | DATETIME | NULL | Approval/rejection date |

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE
- expense_id → expenses(id) ON DELETE SET NULL
- duplicate_of → transactions(id) ON DELETE SET NULL

**Indexes:**
- `idx_user_id` on user_id
- `idx_status` on status
- `idx_created_at` on created_at
- `idx_user_status` on (user_id, status)

**Sample Data:**
```sql
{
  raw_message: 'HDFC Bank Acct XX4567: Rs 380.00 debited for Swiggy on 22/09/2026',
  parsed_amount: 380.00,
  parsed_merchant: 'Swiggy',
  parsed_date: '2026-09-22',
  parsed_payment_method: 'UPI',
  parsed_bank: 'HDFC Bank',
  confidence: 'HIGH',
  status: 'PENDING_REVIEW'
}
```

---

### **7. shared_expenses**
**Purpose:** Expense splitting with friends

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Shared expense ID |
| expense_id | CHAR(36) | NOT NULL, FK | References expenses.id |
| created_by | CHAR(36) | NOT NULL, FK | References users.id |
| title | VARCHAR(255) | NOT NULL | Shared expense title |
| total_amount | DECIMAL(15,2) | NOT NULL | Total amount |
| currency | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| split_method | ENUM | DEFAULT 'EQUAL' | EQUAL/MANUAL/PERCENTAGE |
| status | ENUM | DEFAULT 'OPEN' | OPEN/PARTIALLY_SETTLED/FULLY_SETTLED |
| notes | TEXT | NULL | Additional notes |
| created_at | DATETIME | DEFAULT NOW | Created date |
| updated_at | DATETIME | ON UPDATE | Last update |

**Foreign Keys:**
- expense_id → expenses(id) ON DELETE CASCADE
- created_by → users(id) ON DELETE CASCADE

**Indexes:**
- `idx_expense_id` on expense_id
- `idx_created_by` on created_by
- `idx_status` on status

**Sample Data:**
```sql
{
  expense_id: 'expense-uuid',
  created_by: 'user-uuid',
  title: 'Team Dinner at Barbeque Nation',
  total_amount: 2400.00,
  split_method: 'EQUAL',
  status: 'PARTIALLY_SETTLED'
}
```

---

### **8. shared_expense_participants**
**Purpose:** People involved in shared expenses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Participant ID |
| shared_expense_id | CHAR(36) | NOT NULL, FK | References shared_expenses.id |
| user_id | CHAR(36) | NULL, FK | References users.id (if registered) |
| participant_name | VARCHAR(255) | NOT NULL | Name of participant |
| participant_email | VARCHAR(255) | NULL | Email address |
| share_amount | DECIMAL(15,2) | NOT NULL | Amount they owe/paid |
| paid_amount | DECIMAL(15,2) | DEFAULT 0.00 | Amount paid so far |
| owes_amount | DECIMAL(15,2) | DEFAULT 0.00 | Amount still owed |
| owed_amount | DECIMAL(15,2) | DEFAULT 0.00 | Amount owed to them |
| settlement_status | ENUM | DEFAULT 'PENDING' | PENDING/SETTLED |
| settled_at | DATETIME | NULL | Settlement date |
| created_at | DATETIME | DEFAULT NOW | Created date |
| updated_at | DATETIME | ON UPDATE | Last update |

**Foreign Keys:**
- shared_expense_id → shared_expenses(id) ON DELETE CASCADE
- user_id → users(id) ON DELETE SET NULL

**Indexes:**
- `idx_shared_expense_id` on shared_expense_id
- `idx_user_id` on user_id
- `idx_settlement_status` on settlement_status

**Sample Data:**
```sql
{
  shared_expense_id: 'shared-expense-uuid',
  user_id: null,
  participant_name: 'Priya Sharma',
  participant_email: 'priya.sharma@company.com',
  share_amount: 480.00,
  paid_amount: 0.00,
  owes_amount: 480.00,
  owed_amount: 0.00,
  settlement_status: 'PENDING'
}
```

---

### **9. reimbursements**
**Purpose:** Expense reimbursement claims

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Reimbursement ID |
| expense_id | CHAR(36) | NOT NULL, FK | References expenses.id |
| claimant_id | CHAR(36) | NOT NULL, FK | References users.id |
| claim_amount | DECIMAL(15,2) | NOT NULL | Amount claimed |
| currency | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| description | TEXT | NOT NULL | Justification/reason |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT/SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED/PAID |
| payment_status | ENUM | DEFAULT 'PENDING' | PENDING/PROCESSING/PAID/FAILED |
| reviewer_id | CHAR(36) | NULL, FK | References users.id |
| reviewer_name | VARCHAR(255) | NULL | Reviewer name (if external) |
| reviewer_email | VARCHAR(255) | NULL | Reviewer email |
| custom_email_body | TEXT | NULL | Custom email message |
| email_sent | BOOLEAN | DEFAULT FALSE | Email sent status |
| email_sent_at | DATETIME | NULL | Email sent timestamp |
| review_notes | TEXT | NULL | Reviewer notes |
| rejection_reason | TEXT | NULL | Rejection reason |
| submitted_at | DATETIME | NULL | Submission date |
| reviewed_at | DATETIME | NULL | Review date |
| paid_at | DATETIME | NULL | Payment date |
| payment_reference | VARCHAR(255) | NULL | Payment reference number |
| created_at | DATETIME | DEFAULT NOW | Created date |
| updated_at | DATETIME | ON UPDATE | Last update |

**Foreign Keys:**
- expense_id → expenses(id) ON DELETE CASCADE
- claimant_id → users(id) ON DELETE CASCADE
- reviewer_id → users(id) ON DELETE SET NULL

**Indexes:**
- `idx_expense_id` on expense_id
- `idx_claimant_id` on claimant_id
- `idx_status` on status
- `idx_payment_status` on payment_status

**Sample Data:**
```sql
{
  expense_id: 'expense-uuid',
  claimant_id: 'user-uuid',
  claim_amount: 3500.00,
  description: 'Office supplies for team',
  status: 'SUBMITTED',
  payment_status: 'PENDING',
  submitted_at: '2026-09-23 14:30:00'
}
```

---

### **10. reimbursement_documents**
**Purpose:** Supporting documents for reimbursements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Document ID |
| reimbursement_id | CHAR(36) | NOT NULL, FK | References reimbursements.id |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_url | VARCHAR(500) | NOT NULL | Storage URL |
| file_type | VARCHAR(50) | NOT NULL | MIME type |
| file_size | INT | NOT NULL | Size in bytes |
| uploaded_at | DATETIME | DEFAULT NOW | Upload timestamp |

**Foreign Keys:**
- reimbursement_id → reimbursements(id) ON DELETE CASCADE

**Indexes:**
- `idx_reimbursement_id` on reimbursement_id

---

### **11. reports**
**Purpose:** Generated financial reports

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Report ID |
| user_id | CHAR(36) | NOT NULL, FK | References users.id |
| title | VARCHAR(255) | NOT NULL | Report title |
| report_type | ENUM | NOT NULL | MONTHLY/QUARTERLY/YEARLY/CUSTOM |
| period_start | DATE | NOT NULL | Start date |
| period_end | DATE | NOT NULL | End date |
| total_income | DECIMAL(15,2) | DEFAULT 0.00 | Total income |
| total_expenses | DECIMAL(15,2) | DEFAULT 0.00 | Total expenses |
| net_amount | DECIMAL(15,2) | DEFAULT 0.00 | Net (income - expenses) |
| currency | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| category_breakdown | JSON | NULL | Category totals JSON |
| merchant_breakdown | JSON | NULL | Merchant totals JSON |
| metadata | JSON | NULL | Additional data |
| generated_at | DATETIME | DEFAULT NOW | Generation timestamp |

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE

**Indexes:**
- `idx_user_id` on user_id
- `idx_report_type` on report_type
- `idx_period` on (period_start, period_end)
- `idx_generated_at` on generated_at

---

### **12. audit_events**
**Purpose:** System audit log for tracking changes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY, UUID() | Event ID |
| user_id | CHAR(36) | NULL, FK | References users.id |
| event_type | VARCHAR(100) | NOT NULL | Type of event |
| event_action | VARCHAR(50) | NOT NULL | Action performed |
| resource_type | VARCHAR(50) | NULL | Resource affected |
| resource_id | CHAR(36) | NULL | Resource UUID |
| ip_address | VARCHAR(45) | NULL | User IP address |
| user_agent | TEXT | NULL | Browser user agent |
| old_values | JSON | NULL | Previous values |
| new_values | JSON | NULL | New values |
| metadata | JSON | NULL | Additional data |
| status | ENUM | DEFAULT 'SUCCESS' | SUCCESS/FAILURE |
| error_message | TEXT | NULL | Error details |
| created_at | DATETIME | DEFAULT NOW | Event timestamp |

**Foreign Keys:**
- user_id → users(id) ON DELETE SET NULL

**Indexes:**
- `idx_user_id` on user_id
- `idx_event_type` on event_type
- `idx_resource` on (resource_type, resource_id)
- `idx_created_at` on created_at
- `idx_user_event` on (user_id, event_type)

**Example Events:**
- expense_created
- expense_updated
- expense_deleted
- reimbursement_submitted
- transaction_approved
- user_login

---

### **13. schema_version**
**Purpose:** Track database schema versions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| version | VARCHAR(20) | PRIMARY KEY | Version number |
| applied_at | DATETIME | DEFAULT NOW | Applied date |
| description | TEXT | | Version description |

---

## 🔗 Relationships

### **Cascade Delete Rules**

**When deleting a user:**
- ✅ user_profiles deleted
- ✅ categories deleted
- ✅ payment_methods deleted
- ✅ expenses deleted
  - ✅ shared_expenses deleted
    - ✅ shared_expense_participants deleted
  - ✅ reimbursements deleted
    - ✅ reimbursement_documents deleted
  - ✅ transactions deleted
- ✅ reports deleted
- ⚠️ audit_events retained (user_id set to NULL)

**When deleting an expense:**
- ✅ shared_expenses deleted
- ✅ reimbursements deleted
- ⚠️ transactions updated (expense_id set to NULL)

**When deleting a category:**
- ❌ Cannot delete if used by expenses (RESTRICT)
- Must reassign expenses first

**When deleting a payment method:**
- ⚠️ Expenses updated (payment_method_id set to NULL)

---

## 🔍 Indexes

**Purpose:** Improve query performance

### **Primary Indexes**
- All tables have UUID PRIMARY KEY
- Automatically indexed

### **Foreign Key Indexes**
- All foreign keys are indexed
- Improves JOIN performance

### **Custom Indexes**
```sql
-- User lookup
CREATE INDEX idx_email ON users(email);

-- Expense queries
CREATE INDEX idx_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_merchant ON expenses(merchant);
CREATE INDEX idx_amount ON expenses(amount);

-- Transaction review
CREATE INDEX idx_user_status ON transactions(user_id, status);

-- Audit log
CREATE INDEX idx_user_event ON audit_events(user_id, event_type);
```

---

## 📸 Views

### **v_expense_summary**
**Purpose:** Pre-joined expense data for common queries

```sql
CREATE OR REPLACE VIEW v_expense_summary AS
SELECT 
  e.id,
  e.user_id,
  e.amount,
  e.currency,
  e.merchant,
  e.description,
  e.expense_date,
  e.source,
  e.status,
  c.name AS category_name,
  c.color AS category_color,
  pm.name AS payment_method_name,
  pm.type AS payment_method_type,
  u.email AS user_email,
  up.full_name AS user_name
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id;
```

**Usage:**
```sql
SELECT * FROM v_expense_summary WHERE user_id = ?;
```

### **v_monthly_expense_summary**
**Purpose:** Monthly spending aggregation

```sql
CREATE OR REPLACE VIEW v_monthly_expense_summary AS
SELECT 
  user_id,
  YEAR(expense_date) AS year,
  MONTH(expense_date) AS month,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS average_amount,
  MIN(amount) AS min_amount,
  MAX(amount) AS max_amount
FROM expenses
WHERE status = 'COMPLETED'
GROUP BY user_id, YEAR(expense_date), MONTH(expense_date);
```

### **v_category_spending**
**Purpose:** Category-wise spending breakdown

```sql
CREATE OR REPLACE VIEW v_category_spending AS
SELECT 
  e.user_id,
  c.id AS category_id,
  c.name AS category_name,
  c.color AS category_color,
  COUNT(e.id) AS expense_count,
  SUM(e.amount) AS total_spent,
  AVG(e.amount) AS average_spent
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.status = 'COMPLETED'
GROUP BY e.user_id, c.id, c.name, c.color;
```

---

## 🔧 Stored Procedures

### **sp_get_monthly_stats**
**Purpose:** Calculate monthly statistics for dashboard

```sql
DELIMITER $$

CREATE PROCEDURE sp_get_monthly_stats(
  IN p_user_id CHAR(36),
  IN p_year INT,
  IN p_month INT
)
BEGIN
  SELECT 
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS total_expenses,
    AVG(amount) AS average_expense,
    MIN(amount) AS min_expense,
    MAX(amount) AS max_expense
  FROM expenses
  WHERE user_id = p_user_id
    AND YEAR(expense_date) = p_year
    AND MONTH(expense_date) = p_month
    AND status = 'COMPLETED';
END$$

DELIMITER ;
```

**Usage:**
```sql
CALL sp_get_monthly_stats('user-uuid', 2026, 9);
```

### **sp_detect_duplicate_transaction**
**Purpose:** Check for duplicate transactions

```sql
DELIMITER $$

CREATE PROCEDURE sp_detect_duplicate_transaction(
  IN p_user_id CHAR(36),
  IN p_merchant VARCHAR(255),
  IN p_amount DECIMAL(15, 2),
  IN p_date DATE,
  OUT p_is_duplicate BOOLEAN,
  OUT p_duplicate_id CHAR(36)
)
BEGIN
  DECLARE v_count INT DEFAULT 0;
  
  SELECT COUNT(*), MAX(id)
  INTO v_count, p_duplicate_id
  FROM transactions
  WHERE user_id = p_user_id
    AND parsed_merchant = p_merchant
    AND parsed_amount = p_amount
    AND parsed_date = p_date
    AND status != 'REJECTED'
  LIMIT 1;
  
  SET p_is_duplicate = (v_count > 0);
END$$

DELIMITER ;
```

---

## 📦 Data Types

### **UUID (CHAR(36))**
- Primary keys for all tables
- Format: `ca9ee444-b6c0-11f1-a06d-12ffe3792eb7`
- Generated with MySQL `UUID()` function

### **DECIMAL(15,2)**
- Used for all monetary values
- 15 digits total, 2 after decimal
- Precision for currency calculations

### **ENUM**
- Fixed set of values
- Enforces data integrity
- Examples: status, type, confidence

### **JSON**
- Flexible data storage
- Used for tags, metadata, breakdowns
- Supports JSON functions (JSON_EXTRACT, etc.)

### **DATETIME**
- Timestamp with date and time
- Format: 'YYYY-MM-DD HH:MM:SS'
- Time zone: Server time zone

### **TEXT**
- Variable length text
- Used for descriptions, notes, messages

---

## 🔍 Common Queries

### **Get User's Total Spending (Current Month)**
```sql
SELECT SUM(amount) as total_spending
FROM expenses
WHERE user_id = ?
  AND MONTH(expense_date) = MONTH(CURDATE())
  AND YEAR(expense_date) = YEAR(CURDATE())
  AND status = 'COMPLETED';
```

### **Get Category Breakdown**
```sql
SELECT 
  c.name,
  c.color,
  COUNT(e.id) as expense_count,
  SUM(e.amount) as total_amount,
  ROUND((SUM(e.amount) / (
    SELECT SUM(amount) FROM expenses WHERE user_id = ?
  )) * 100, 2) as percentage
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = ?
  AND e.status = 'COMPLETED'
GROUP BY c.id, c.name, c.color
ORDER BY total_amount DESC;
```

### **Get Recent Expenses with Details**
```sql
SELECT 
  e.*,
  c.name as category_name,
  c.color as category_color,
  pm.name as payment_method_name,
  pm.type as payment_method_type
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
WHERE e.user_id = ?
  AND e.status = 'COMPLETED'
ORDER BY e.expense_date DESC, e.created_at DESC
LIMIT 10;
```

### **Get 7-Day Spending Trend**
```sql
SELECT 
  DATE(expense_date) as date,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM expenses
WHERE user_id = ?
  AND expense_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  AND status = 'COMPLETED'
GROUP BY DATE(expense_date)
ORDER BY date ASC;
```

### **Get Pending Transactions**
```sql
SELECT *
FROM transactions
WHERE user_id = ?
  AND status = 'PENDING_REVIEW'
ORDER BY created_at DESC;
```

### **Get Shared Expenses with Participants**
```sql
SELECT 
  se.*,
  e.merchant,
  e.amount as expense_amount,
  COUNT(sep.id) as participant_count,
  SUM(CASE WHEN sep.settlement_status = 'SETTLED' THEN 1 ELSE 0 END) as settled_count
FROM shared_expenses se
JOIN expenses e ON se.expense_id = e.id
LEFT JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
WHERE se.created_by = ?
GROUP BY se.id
ORDER BY se.created_at DESC;
```

### **Get Reimbursements with Expense Details**
```sql
SELECT 
  r.*,
  e.merchant,
  e.expense_date,
  e.description as expense_description,
  c.name as category_name
FROM reimbursements r
JOIN expenses e ON r.expense_id = e.id
LEFT JOIN categories c ON e.category_id = c.id
WHERE r.claimant_id = ?
ORDER BY r.created_at DESC;
```

---

## 💾 Backup & Restore

### **Backup Database**
```bash
mysqldump -h personal-finance.c4jeiqqogk52.us-east-1.rds.amazonaws.com \
  -u drae -p expense_tracker > backup_$(date +%Y%m%d).sql
```

### **Backup with Compression**
```bash
mysqldump -h HOST -u USER -p expense_tracker | gzip > backup.sql.gz
```

### **Restore Database**
```bash
mysql -h HOST -u USER -p expense_tracker < backup.sql
```

### **Backup Schedule (Recommended)**
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Keep 30 days of backups

---

## 🔧 Maintenance

### **Optimize Tables**
```sql
OPTIMIZE TABLE expenses;
OPTIMIZE TABLE transactions;
OPTIMIZE TABLE shared_expenses;
```

### **Analyze Tables**
```sql
ANALYZE TABLE expenses;
ANALYZE TABLE categories;
ANALYZE TABLE payment_methods;
```

### **Check Table Status**
```sql
SHOW TABLE STATUS FROM expense_tracker;
```

### **View Index Usage**
```sql
SHOW INDEX FROM expenses;
```

---

## 📊 Performance Tips

1. **Use Indexes**
   - All foreign keys indexed
   - Add indexes for frequently queried columns

2. **Limit Result Sets**
   - Use LIMIT for pagination
   - Avoid SELECT * when possible

3. **Use Views**
   - Pre-joined data for common queries
   - Reduces repeated JOIN logic

4. **Connection Pooling**
   - Reuse database connections
   - Set appropriate pool size (10-20)

5. **Prepared Statements**
   - Use parameterized queries
   - Prevents SQL injection
   - Better performance

---

## 🔐 Security

1. **User Privileges**
   - Grant minimum required permissions
   - Separate read/write users if possible

2. **Parameterized Queries**
   - Always use ? placeholders
   - Never concatenate user input

3. **Encryption**
   - SSL/TLS for connections
   - Encrypt sensitive fields if needed

4. **Regular Updates**
   - Keep MySQL updated
   - Apply security patches

---

## 📚 Schema Setup

### **Initialize Database**
```bash
cd database
mysql -h HOST -u USER -p < schema.sql
```

### **Insert Demo Data**
```bash
mysql -h HOST -u USER -p expense_tracker < insert-demo-data.sql
```

### **Verify Setup**
```sql
USE expense_tracker;

SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'expense_tracker';

SELECT * FROM schema_version;
```

---

**Next:** [Back to Overview](./README.md) | [Frontend Documentation](./FRONTEND.md) | [Backend Documentation](./BACKEND.md)
