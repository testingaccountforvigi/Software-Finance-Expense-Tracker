-- ============================================
-- Add Simple Sample Data for Sharing and Reimbursements
-- No reviewer functionality - simple claims only
-- ============================================

USE expense_tracker;

-- User and reference IDs
SET @mahesh_user_id = 'ca9ee444-b6c0-11f1-a06d-12ffe3792eb7';
SET @food_category = 'cb5508c5-b6c0-11f1-a06d-12ffe3792eb7';
SET @entertainment_category = 'cbf2f746-b6c0-11f1-a06d-12ffe3792eb7';
SET @health_category = 'cc1e7235-b6c0-11f1-a06d-12ffe3792eb7';
SET @shopping_category = 'cba5e7e2-b6c0-11f1-a06d-12ffe3792eb7';
SET @hdfc_card = '6de172c5-b70c-11f1-a06d-12ffe3792eb7';
SET @sbi_card = '6de17866-b70c-11f1-a06d-12ffe3792eb7';
SET @gpay_upi = '6de17a2a-b70c-11f1-a06d-12ffe3792eb7';

-- ============================================
-- EXPENSE 1: Team Dinner (For Sharing)
-- ============================================
SET @expense1_id = UUID();
INSERT INTO expenses (
  id, user_id, amount, currency, merchant, description,
  category_id, payment_method_id, expense_date, 
  source, status, notes
) VALUES (
  @expense1_id,
  @mahesh_user_id,
  2400.00,
  'INR',
  'Barbeque Nation',
  'Team dinner with 4 colleagues',
  @food_category,
  @hdfc_card,
  DATE_SUB(CURDATE(), INTERVAL 5 DAY),
  'MANUAL',
  'COMPLETED',
  'Dinner with team after project completion'
);

-- Create shared expense for Team Dinner
SET @shared1_id = UUID();
INSERT INTO shared_expenses (
  id, expense_id, created_by, title, total_amount, 
  currency, split_method, status, notes
) VALUES (
  @shared1_id,
  @expense1_id,
  @mahesh_user_id,
  'Team Dinner at Barbeque Nation',
  2400.00,
  'INR',
  'EQUAL',
  'PARTIALLY_SETTLED',
  'Split equally among 5 people (₹480 each)'
);

-- Add participants
INSERT INTO shared_expense_participants (
  id, shared_expense_id, user_id, participant_name, 
  participant_email, share_amount, paid_amount, 
  owes_amount, owed_amount, settlement_status
) VALUES
  (UUID(), @shared1_id, @mahesh_user_id, 'Mahesh (You)', 'mahesh@gmail.com', 480.00, 2400.00, 0.00, 1920.00, 'SETTLED'),
  (UUID(), @shared1_id, NULL, 'Rajesh Kumar', 'rajesh.kumar@company.com', 480.00, 480.00, 0.00, 0.00, 'SETTLED'),
  (UUID(), @shared1_id, NULL, 'Priya Sharma', 'priya.sharma@company.com', 480.00, 0.00, 480.00, 0.00, 'PENDING'),
  (UUID(), @shared1_id, NULL, 'Amit Patel', 'amit.patel@company.com', 480.00, 0.00, 480.00, 0.00, 'PENDING'),
  (UUID(), @shared1_id, NULL, 'Sneha Reddy', 'sneha.reddy@company.com', 480.00, 0.00, 480.00, 0.00, 'PENDING');

-- ============================================
-- EXPENSE 2: Office Supplies (For Reimbursement - Draft)
-- ============================================
SET @expense2_id = UUID();
INSERT INTO expenses (
  id, user_id, amount, currency, merchant, description,
  category_id, payment_method_id, expense_date, 
  source, status, notes
) VALUES (
  @expense2_id,
  @mahesh_user_id,
  3500.00,
  'INR',
  'Amazon Business',
  'Office supplies and stationery',
  @shopping_category,
  @sbi_card,
  DATE_SUB(CURDATE(), INTERVAL 8 DAY),
  'MANUAL',
  'COMPLETED',
  'Purchased office supplies for company use'
);

-- Create reimbursement claim (Draft)
INSERT INTO reimbursements (
  id, expense_id, claimant_id, claim_amount, currency,
  description, status, payment_status
) VALUES (
  UUID(),
  @expense2_id,
  @mahesh_user_id,
  3500.00,
  'INR',
  'Reimbursement for office supplies - notebooks, pens, folders, and markers for team',
  'DRAFT',
  'PENDING'
);

-- ============================================
-- EXPENSE 3: Trip to Goa (For Sharing)
-- ============================================
SET @expense3_id = UUID();
INSERT INTO expenses (
  id, user_id, amount, currency, merchant, description,
  category_id, payment_method_id, expense_date, 
  source, status, notes
) VALUES (
  @expense3_id,
  @mahesh_user_id,
  8000.00,
  'INR',
  'Airbnb',
  'Weekend trip accommodation in Goa',
  @entertainment_category,
  @hdfc_card,
  DATE_SUB(CURDATE(), INTERVAL 12 DAY),
  'MANUAL',
  'COMPLETED',
  '3-night stay at Calangute Beach'
);

-- Create shared expense for Goa Trip
SET @shared2_id = UUID();
INSERT INTO shared_expenses (
  id, expense_id, created_by, title, total_amount, 
  currency, split_method, status, notes
) VALUES (
  @shared2_id,
  @expense3_id,
  @mahesh_user_id,
  'Goa Trip - Airbnb Stay',
  8000.00,
  'INR',
  'EQUAL',
  'OPEN',
  'Split among 4 friends - ₹2000 each'
);

-- Add participants
INSERT INTO shared_expense_participants (
  id, shared_expense_id, user_id, participant_name, 
  participant_email, share_amount, paid_amount, 
  owes_amount, owed_amount, settlement_status
) VALUES
  (UUID(), @shared2_id, @mahesh_user_id, 'Mahesh (You)', 'mahesh@gmail.com', 2000.00, 8000.00, 0.00, 6000.00, 'SETTLED'),
  (UUID(), @shared2_id, NULL, 'Karthik M', 'karthik.m@gmail.com', 2000.00, 0.00, 2000.00, 0.00, 'PENDING'),
  (UUID(), @shared2_id, NULL, 'Deepak S', 'deepak.s@gmail.com', 2000.00, 0.00, 2000.00, 0.00, 'PENDING'),
  (UUID(), @shared2_id, NULL, 'Ravi T', 'ravi.t@gmail.com', 2000.00, 0.00, 2000.00, 0.00, 'PENDING');

-- ============================================
-- EXPENSE 4: Medical Checkup (For Reimbursement - Submitted)
-- ============================================
SET @expense4_id = UUID();
INSERT INTO expenses (
  id, user_id, amount, currency, merchant, description,
  category_id, payment_method_id, expense_date, 
  source, status, notes
) VALUES (
  @expense4_id,
  @mahesh_user_id,
  2800.00,
  'INR',
  'Apollo Diagnostics',
  'Annual health checkup',
  @health_category,
  @gpay_upi,
  DATE_SUB(CURDATE(), INTERVAL 15 DAY),
  'MANUAL',
  'COMPLETED',
  'Company-sponsored annual health checkup'
);

-- Create reimbursement claim (Submitted)
INSERT INTO reimbursements (
  id, expense_id, claimant_id, claim_amount, currency,
  description, status, payment_status, submitted_at
) VALUES (
  UUID(),
  @expense4_id,
  @mahesh_user_id,
  2800.00,
  'INR',
  'Annual health checkup as per company policy',
  'SUBMITTED',
  'PENDING',
  DATE_SUB(NOW(), INTERVAL 10 DAY)
);

-- ============================================
-- EXPENSE 5: Restaurant Bill (For Sharing - Fully Settled)
-- ============================================
SET @expense5_id = UUID();
INSERT INTO expenses (
  id, user_id, amount, currency, merchant, description,
  category_id, payment_method_id, expense_date, 
  source, status, notes
) VALUES (
  @expense5_id,
  @mahesh_user_id,
  1200.00,
  'INR',
  'Dominos Pizza',
  'Lunch with friends',
  @food_category,
  @gpay_upi,
  DATE_SUB(CURDATE(), INTERVAL 3 DAY),
  'MANUAL',
  'COMPLETED',
  'Pizza party with 3 friends'
);

-- Create shared expense (Fully settled)
SET @shared3_id = UUID();
INSERT INTO shared_expenses (
  id, expense_id, created_by, title, total_amount, 
  currency, split_method, status, notes
) VALUES (
  @shared3_id,
  @expense5_id,
  @mahesh_user_id,
  'Dominos Pizza Lunch',
  1200.00,
  'INR',
  'EQUAL',
  'FULLY_SETTLED',
  'Split 4 ways - ₹300 each'
);

-- Add participants (all settled)
INSERT INTO shared_expense_participants (
  id, shared_expense_id, user_id, participant_name, 
  participant_email, share_amount, paid_amount, 
  owes_amount, owed_amount, settlement_status, settled_at
) VALUES
  (UUID(), @shared3_id, @mahesh_user_id, 'Mahesh (You)', 'mahesh@gmail.com', 300.00, 1200.00, 0.00, 900.00, 'SETTLED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (UUID(), @shared3_id, NULL, 'Arun K', 'arun.k@gmail.com', 300.00, 300.00, 0.00, 0.00, 'SETTLED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (UUID(), @shared3_id, NULL, 'Neha P', 'neha.p@gmail.com', 300.00, 300.00, 0.00, 0.00, 'SETTLED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (UUID(), @shared3_id, NULL, 'Vishal G', 'vishal.g@gmail.com', 300.00, 300.00, 0.00, 0.00, 'SETTLED', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- EXPENSE 6: Conference Registration (For Reimbursement - Approved)
-- ============================================
SET @expense6_id = UUID();
INSERT INTO expenses (
  id, user_id, amount, currency, merchant, description,
  category_id, payment_method_id, expense_date, 
  source, status, notes
) VALUES (
  @expense6_id,
  @mahesh_user_id,
  5500.00,
  'INR',
  'TechConf India',
  'Tech conference registration fee',
  @entertainment_category,
  @hdfc_card,
  DATE_SUB(CURDATE(), INTERVAL 6 DAY),
  'MANUAL',
  'COMPLETED',
  'Annual tech conference in Bangalore'
);

-- Create reimbursement claim (Approved)
INSERT INTO reimbursements (
  id, expense_id, claimant_id, claim_amount, currency,
  description, status, payment_status,
  submitted_at, reviewed_at
) VALUES (
  UUID(),
  @expense6_id,
  @mahesh_user_id,
  5500.00,
  'INR',
  'Conference registration for professional development - includes 2-day access, workshop sessions, and networking events',
  'APPROVED',
  'PENDING',
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  DATE_SUB(NOW(), INTERVAL 2 DAY)
);

-- ============================================
-- Verification Queries
-- ============================================
SELECT '✓ Successfully added simple sharing and reimbursement data' AS Status;

SELECT COUNT(*) AS 'New Expenses' FROM expenses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
SELECT COUNT(*) AS 'New Shared Expenses' FROM shared_expenses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
SELECT COUNT(*) AS 'New Reimbursements' FROM reimbursements WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
SELECT COUNT(*) AS 'New Participants' FROM shared_expense_participants WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
