-- ============================================
-- MySQL Queries Reference Guide
-- Run these queries independently to inspect database
-- ============================================

-- ============================================
-- SECTION 1: DATABASE CONNECTION & SELECTION
-- ============================================

-- Show all databases
SHOW DATABASES;

-- Select the expense_tracker database
USE expense_tracker;

-- Show current database
SELECT DATABASE();

-- Show database collation
SELECT @@collation_database;

-- ============================================
-- SECTION 2: VIEW ALL TABLES
-- ============================================

-- Show all tables in database
SHOW TABLES;

-- Show table count
SELECT COUNT(*) AS 'Total Tables' 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'expense_tracker';

-- Show tables with row counts
SELECT 
  TABLE_NAME AS 'Table Name',
  TABLE_ROWS AS 'Approx Rows',
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)',
  CREATE_TIME AS 'Created'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'expense_tracker'
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- ============================================
-- SECTION 3: TABLE STRUCTURE
-- ============================================

-- Show structure of users table
DESCRIBE users;
-- OR
SHOW COLUMNS FROM users;

-- Show create statement for any table
SHOW CREATE TABLE users;

-- Show all columns for all tables
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_KEY,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'expense_tracker'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- ============================================
-- SECTION 4: USERS TABLE
-- ============================================

-- View all users
SELECT * FROM users;

-- View users with basic info
SELECT 
  id,
  email,
  status,
  email_verified,
  DATE_FORMAT(last_login_at, '%Y-%m-%d %H:%i') AS 'Last Login',
  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS 'Created'
FROM users
ORDER BY created_at DESC;

-- Count users by status
SELECT 
  status,
  COUNT(*) AS 'Count'
FROM users
GROUP BY status;

-- Find specific user by email
SELECT * FROM users WHERE email = 'mahesh@gmail.com';

-- Get user with profile
SELECT 
  u.id,
  u.email,
  u.status,
  up.full_name,
  up.currency,
  up.monthly_income,
  u.created_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'mahesh@gmail.com';

-- ============================================
-- SECTION 5: USER PROFILES TABLE
-- ============================================

-- View all profiles
SELECT * FROM user_profiles;

-- View profiles with user email
SELECT 
  up.*,
  u.email
FROM user_profiles up
JOIN users u ON up.user_id = u.id;

-- Get profile for specific user
SELECT * FROM user_profiles 
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- ============================================
-- SECTION 6: CATEGORIES TABLE
-- ============================================

-- View all categories
SELECT * FROM categories ORDER BY user_id, display_order;

-- View categories for specific user
SELECT 
  id,
  name,
  color,
  icon,
  active,
  display_order,
  is_default
FROM categories
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY display_order;

-- Count categories per user
SELECT 
  u.email,
  COUNT(c.id) AS 'Category Count'
FROM users u
LEFT JOIN categories c ON u.id = c.user_id
GROUP BY u.id, u.email;

-- ============================================
-- SECTION 7: EXPENSES TABLE
-- ============================================

-- View all expenses
SELECT * FROM expenses ORDER BY date DESC LIMIT 50;

-- View expenses for specific user
SELECT 
  e.id,
  e.date,
  e.merchant,
  e.amount,
  e.currency,
  c.name AS 'Category',
  e.payment_method,
  e.description
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY e.date DESC;

-- Get expense summary for user
SELECT 
  COUNT(*) AS 'Total Expenses',
  SUM(amount) AS 'Total Amount',
  AVG(amount) AS 'Average Amount',
  MIN(amount) AS 'Min Amount',
  MAX(amount) AS 'Max Amount',
  MIN(date) AS 'Earliest Date',
  MAX(date) AS 'Latest Date'
FROM expenses
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- Expenses by category
SELECT 
  c.name AS 'Category',
  COUNT(e.id) AS 'Count',
  SUM(e.amount) AS 'Total',
  AVG(e.amount) AS 'Average'
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
GROUP BY c.id, c.name
ORDER BY SUM(e.amount) DESC;

-- Expenses by month
SELECT 
  DATE_FORMAT(date, '%Y-%m') AS 'Month',
  COUNT(*) AS 'Count',
  SUM(amount) AS 'Total'
FROM expenses
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY DATE_FORMAT(date, '%Y-%m') DESC;

-- Recent expenses (last 10)
SELECT 
  DATE_FORMAT(date, '%Y-%m-%d') AS 'Date',
  merchant AS 'Merchant',
  amount AS 'Amount',
  c.name AS 'Category'
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY e.date DESC, e.created_at DESC
LIMIT 10;

-- ============================================
-- SECTION 8: PAYMENT METHODS TABLE
-- ============================================

-- View all payment methods
SELECT * FROM payment_methods;

-- View payment methods for specific user
SELECT 
  id,
  name,
  type,
  bank,
  last_four,
  is_default,
  active
FROM payment_methods
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY is_default DESC, name;

-- ============================================
-- SECTION 9: TRANSACTIONS TABLE
-- ============================================

-- View all transactions
SELECT * FROM transactions ORDER BY created_at DESC;

-- View pending transactions for user
SELECT 
  id,
  DATE_FORMAT(transaction_date, '%Y-%m-%d') AS 'Date',
  merchant_name AS 'Merchant',
  amount,
  currency,
  source,
  status,
  metadata
FROM transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
  AND status = 'pending'
ORDER BY transaction_date DESC;

-- Count transactions by status
SELECT 
  status,
  COUNT(*) AS 'Count'
FROM transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
GROUP BY status;

-- ============================================
-- SECTION 10: SHARED EXPENSES TABLE
-- ============================================

-- View all shared expenses
SELECT * FROM shared_expenses;

-- View shared expenses for user
SELECT 
  se.id,
  se.title,
  se.total_amount,
  se.currency,
  se.split_method,
  se.status,
  se.created_at
FROM shared_expenses se
WHERE se.created_by = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY se.created_at DESC;

-- View shared expenses with participants
SELECT 
  se.title,
  se.total_amount,
  se.status,
  COUNT(sep.id) AS 'Participants',
  SUM(CASE WHEN sep.status = 'paid' THEN 1 ELSE 0 END) AS 'Paid',
  SUM(CASE WHEN sep.status = 'pending' THEN 1 ELSE 0 END) AS 'Pending'
FROM shared_expenses se
LEFT JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
WHERE se.created_by = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
GROUP BY se.id, se.title, se.total_amount, se.status;

-- ============================================
-- SECTION 11: SHARED EXPENSE PARTICIPANTS TABLE
-- ============================================

-- View all participants
SELECT * FROM shared_expense_participants;

-- View participants for user's shared expenses
SELECT 
  se.title AS 'Shared Expense',
  sep.email AS 'Participant Email',
  sep.share_percentage AS 'Share %',
  sep.amount_owed AS 'Amount Owed',
  sep.amount_paid AS 'Amount Paid',
  sep.status
FROM shared_expense_participants sep
JOIN shared_expenses se ON sep.shared_expense_id = se.id
WHERE se.created_by = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- ============================================
-- SECTION 12: REIMBURSEMENTS TABLE
-- ============================================

-- View all reimbursements
SELECT * FROM reimbursements ORDER BY created_at DESC;

-- View reimbursements for user
SELECT 
  id,
  title,
  amount,
  currency,
  status,
  DATE_FORMAT(submitted_at, '%Y-%m-%d %H:%i') AS 'Submitted',
  DATE_FORMAT(reviewed_at, '%Y-%m-%d %H:%i') AS 'Reviewed',
  reviewer_notes,
  rejection_reason
FROM reimbursements
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY created_at DESC;

-- Count reimbursements by status
SELECT 
  status,
  COUNT(*) AS 'Count',
  SUM(amount) AS 'Total Amount'
FROM reimbursements
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
GROUP BY status;

-- ============================================
-- SECTION 13: REIMBURSEMENT DOCUMENTS TABLE
-- ============================================

-- View all documents
SELECT * FROM reimbursement_documents;

-- View documents for user's reimbursements
SELECT 
  r.title AS 'Reimbursement',
  rd.document_type,
  rd.file_name,
  rd.file_url,
  rd.uploaded_at
FROM reimbursement_documents rd
JOIN reimbursements r ON rd.reimbursement_id = r.id
WHERE r.user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- ============================================
-- SECTION 14: REPORTS TABLE
-- ============================================

-- View all reports
SELECT * FROM reports ORDER BY generated_at DESC;

-- View reports for user
SELECT 
  id,
  report_type,
  report_period,
  DATE_FORMAT(start_date, '%Y-%m-%d') AS 'Start',
  DATE_FORMAT(end_date, '%Y-%m-%d') AS 'End',
  total_income,
  total_expenses,
  net_balance,
  DATE_FORMAT(generated_at, '%Y-%m-%d %H:%i') AS 'Generated'
FROM reports
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY generated_at DESC;

-- ============================================
-- SECTION 15: AUDIT EVENTS TABLE
-- ============================================

-- View all audit events
SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 50;

-- View audit events for user
SELECT 
  event_type,
  entity_type,
  entity_id,
  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS 'Timestamp',
  ip_address
FROM audit_events
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY created_at DESC
LIMIT 50;

-- Count events by type
SELECT 
  event_type,
  COUNT(*) AS 'Count'
FROM audit_events
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
GROUP BY event_type
ORDER BY COUNT(*) DESC;

-- ============================================
-- SECTION 16: FOREIGN KEY RELATIONSHIPS
-- ============================================

-- View all foreign key constraints
SELECT 
  TABLE_NAME AS 'Child Table',
  CONSTRAINT_NAME AS 'Constraint',
  COLUMN_NAME AS 'Column',
  REFERENCED_TABLE_NAME AS 'Parent Table',
  REFERENCED_COLUMN_NAME AS 'Parent Column'
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'expense_tracker'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- ============================================
-- SECTION 17: INDEXES
-- ============================================

-- View all indexes
SELECT 
  TABLE_NAME AS 'Table',
  INDEX_NAME AS 'Index',
  COLUMN_NAME AS 'Column',
  NON_UNIQUE AS 'Non-Unique',
  INDEX_TYPE AS 'Type'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'expense_tracker'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ============================================
-- SECTION 18: DATA INTEGRITY CHECKS
-- ============================================

-- Check for orphaned records
SELECT 'Orphaned Profiles' AS 'Check', COUNT(*) AS 'Issues'
FROM user_profiles WHERE user_id NOT IN (SELECT id FROM users)
UNION ALL
SELECT 'Orphaned Expenses', COUNT(*)
FROM expenses WHERE user_id NOT IN (SELECT id FROM users)
UNION ALL
SELECT 'Orphaned Categories', COUNT(*)
FROM categories WHERE user_id NOT IN (SELECT id FROM users)
UNION ALL
SELECT 'Invalid Expense Categories', COUNT(*)
FROM expenses WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM categories);

-- ============================================
-- SECTION 19: SUMMARY STATISTICS
-- ============================================

-- Overall database summary
SELECT 
  (SELECT COUNT(*) FROM users) AS 'Total Users',
  (SELECT COUNT(*) FROM user_profiles) AS 'Profiles',
  (SELECT COUNT(*) FROM categories) AS 'Categories',
  (SELECT COUNT(*) FROM expenses) AS 'Expenses',
  (SELECT COUNT(*) FROM transactions) AS 'Transactions',
  (SELECT COUNT(*) FROM shared_expenses) AS 'Shared Expenses',
  (SELECT COUNT(*) FROM reimbursements) AS 'Reimbursements',
  (SELECT COUNT(*) FROM reports) AS 'Reports';

-- Per-user summary
SELECT 
  u.email AS 'User',
  COUNT(DISTINCT c.id) AS 'Categories',
  COUNT(DISTINCT e.id) AS 'Expenses',
  COALESCE(SUM(e.amount), 0) AS 'Total Spent',
  COUNT(DISTINCT t.id) AS 'Transactions',
  COUNT(DISTINCT se.id) AS 'Shared Expenses',
  COUNT(DISTINCT r.id) AS 'Reimbursements'
FROM users u
LEFT JOIN categories c ON u.id = c.user_id
LEFT JOIN expenses e ON u.id = e.user_id
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN shared_expenses se ON u.id = se.created_by
LEFT JOIN reimbursements r ON u.id = r.user_id
GROUP BY u.id, u.email;

-- ============================================
-- SECTION 20: CLEANUP QUERIES (USE WITH CAUTION!)
-- ============================================

-- Delete all data for specific user (CASCADE will handle related records)
-- WARNING: This permanently deletes the user and ALL their data
-- DELETE FROM users WHERE email = 'mahesh@gmail.com';

-- Delete only expenses for user
-- DELETE FROM expenses WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- Delete only transactions for user
-- DELETE FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- Delete only categories for user (will fail if expenses reference them)
-- DELETE FROM categories WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- ============================================
-- SECTION 21: USEFUL QUICK QUERIES
-- ============================================

-- Get user ID by email
SELECT id FROM users WHERE email = 'mahesh@gmail.com';

-- Count all data for user
SELECT 
  'Expenses' AS 'Type', COUNT(*) AS 'Count'
FROM expenses WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
UNION ALL
SELECT 'Categories', COUNT(*)
FROM categories WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
UNION ALL
SELECT 'Transactions', COUNT(*)
FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
UNION ALL
SELECT 'Shared Expenses', COUNT(*)
FROM shared_expenses WHERE created_by = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
UNION ALL
SELECT 'Reimbursements', COUNT(*)
FROM reimbursements WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com');

-- Latest activity
SELECT 
  'Expense' AS 'Type',
  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS 'Timestamp',
  CONCAT(merchant, ' - ', amount) AS 'Details'
FROM expenses
WHERE user_id = (SELECT id FROM users WHERE email = 'mahesh@gmail.com')
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- END OF QUERIES REFERENCE
-- ============================================
