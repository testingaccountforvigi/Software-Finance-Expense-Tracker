-- ============================================
-- Personal Finance & Expense Management System
-- MySQL Database Schema
-- Version: 1.0
-- ============================================

DROP DATABASE IF EXISTS expense_tracker;

-- Create database with consistent collation
CREATE DATABASE IF NOT EXISTS expense_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

-- Set session collation to match database
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS audit_events;
DROP TABLE IF EXISTS reimbursement_documents;
DROP TABLE IF EXISTS reimbursements;
DROP TABLE IF EXISTS shared_expense_participants;
DROP TABLE IF EXISTS shared_expenses;
DROP TABLE IF EXISTS report_items;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'SUSPENDED', 'DELETED') DEFAULT 'ACTIVE',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE user_profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  age INT NULL,
  professional_status VARCHAR(100) NULL,
  organization VARCHAR(255) NULL,
  role VARCHAR(100) NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  monthly_income DECIMAL(15, 2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE payment_methods (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'CASH', 'BANK_TRANSFER', 'OTHER') NOT NULL,
  bank VARCHAR(100) NULL,
  last_four VARCHAR(4) NULL,
  is_default BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_active (active),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6b7280',
  icon VARCHAR(50) NULL,
  active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_category (user_id, name),
  INDEX idx_user_id (user_id),
  INDEX idx_active (active),
  INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  merchant VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category_id CHAR(36) NOT NULL,
  payment_method_id CHAR(36) NULL,
  expense_date DATE NOT NULL,
  expense_time TIME NULL,
  source ENUM('MANUAL', 'SIMULATED_NOTIFICATION', 'IMPORTED') DEFAULT 'MANUAL',
  status ENUM('COMPLETED', 'PENDING', 'CANCELLED') DEFAULT 'COMPLETED',
  receipt_url VARCHAR(500) NULL,
  notes TEXT NULL,
  tags JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_expense_date (expense_date),
  INDEX idx_category_id (category_id),
  INDEX idx_merchant (merchant),
  INDEX idx_amount (amount),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_user_date (user_id, expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRANSACTIONS TABLE (Simulated Notifications)
-- ============================================
CREATE TABLE transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  raw_message TEXT NOT NULL,
  parsed_amount DECIMAL(15, 2) NULL,
  parsed_merchant VARCHAR(255) NULL,
  parsed_date DATE NULL,
  parsed_payment_method VARCHAR(50) NULL,
  parsed_bank VARCHAR(100) NULL,
  confidence ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
  status ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DUPLICATE') DEFAULT 'PENDING_REVIEW',
  duplicate_of CHAR(36) NULL,
  expense_id CHAR(36) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL,
  FOREIGN KEY (duplicate_of) REFERENCES transactions(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_parsed_merchant (parsed_merchant),
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SHARED EXPENSES TABLE
-- ============================================
CREATE TABLE shared_expenses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  expense_id CHAR(36) NOT NULL,
  created_by CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  split_method ENUM('EQUAL', 'MANUAL', 'PERCENTAGE') DEFAULT 'EQUAL',
  status ENUM('OPEN', 'PARTIALLY_SETTLED', 'FULLY_SETTLED') DEFAULT 'OPEN',
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_expense_id (expense_id),
  INDEX idx_created_by (created_by),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SHARED EXPENSE PARTICIPANTS TABLE
-- ============================================
CREATE TABLE shared_expense_participants (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  shared_expense_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NULL,
  share_amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0.00,
  owes_amount DECIMAL(15, 2) DEFAULT 0.00,
  owed_amount DECIMAL(15, 2) DEFAULT 0.00,
  settlement_status ENUM('PENDING', 'SETTLED') DEFAULT 'PENDING',
  settled_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shared_expense_id) REFERENCES shared_expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_shared_expense_id (shared_expense_id),
  INDEX idx_user_id (user_id),
  INDEX idx_settlement_status (settlement_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REIMBURSEMENTS TABLE
-- ============================================
CREATE TABLE reimbursements (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  expense_id CHAR(36) NOT NULL,
  claimant_id CHAR(36) NOT NULL,
  claim_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  description TEXT NOT NULL,
  status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID') DEFAULT 'DRAFT',
  payment_status ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED') DEFAULT 'PENDING',
  reviewer_id CHAR(36) NULL,
  reviewer_name VARCHAR(255) NULL,
  reviewer_email VARCHAR(255) NULL,
  custom_email_body TEXT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at DATETIME NULL,
  review_notes TEXT NULL,
  rejection_reason TEXT NULL,
  submitted_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  paid_at DATETIME NULL,
  payment_reference VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_expense_id (expense_id),
  INDEX idx_claimant_id (claimant_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REIMBURSEMENT DOCUMENTS TABLE
-- ============================================
CREATE TABLE reimbursement_documents (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reimbursement_id CHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reimbursement_id) REFERENCES reimbursements(id) ON DELETE CASCADE,
  INDEX idx_reimbursement_id (reimbursement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE reports (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  report_type ENUM('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM') NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_income DECIMAL(15, 2) DEFAULT 0.00,
  total_expenses DECIMAL(15, 2) DEFAULT 0.00,
  net_amount DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'INR',
  category_breakdown JSON NULL,
  merchant_breakdown JSON NULL,
  metadata JSON NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_report_type (report_type),
  INDEX idx_period (period_start, period_end),
  INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT EVENTS TABLE
-- ============================================
CREATE TABLE audit_events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NULL,
  event_type VARCHAR(100) NOT NULL,
  event_action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NULL,
  resource_id CHAR(36) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  metadata JSON NULL,
  status ENUM('SUCCESS', 'FAILURE') DEFAULT 'SUCCESS',
  error_message TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_created_at (created_at),
  INDEX idx_user_event (user_id, event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Expense Summary View
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

-- Monthly Expense Summary View
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

-- Category Spending View
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

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure to calculate monthly statistics
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

-- Procedure to detect duplicate transactions
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

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Note: Trigger removed due to MySQL binary logging restrictions
-- The shared expense status update is now handled in application code
-- See sharedExpenseController.js settleParticipant function

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common query patterns
CREATE INDEX idx_expenses_user_date_category ON expenses(user_id, expense_date, category_id);
CREATE INDEX idx_expenses_user_merchant ON expenses(user_id, merchant);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_reimbursements_claimant_status ON reimbursements(claimant_id, status);

-- ============================================
-- SCHEMA VERSION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS schema_version (
  version VARCHAR(20) PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

INSERT INTO schema_version (version, description) VALUES 
('1.0.0', 'Initial schema creation with all tables, views, procedures, and triggers');

-- ============================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================
-- GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_app'@'%';
-- FLUSH PRIVILEGES;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT TABLE_NAME, TABLE_ROWS 
-- FROM information_schema.TABLES 
-- WHERE TABLE_SCHEMA = 'expense_tracker';

-- SELECT * FROM schema_version;
