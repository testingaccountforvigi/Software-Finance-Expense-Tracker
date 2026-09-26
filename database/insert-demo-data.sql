-- ============================================
-- COMPLETE DEMO DATA FOR EXPENSE TRACKER
-- User: mahesh@gmail.com
-- ============================================

USE expense_tracker;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Set user email
SET @user_email = 'kirthish@gmail.com';
SET @user_id = (SELECT id FROM users WHERE email = @user_email LIMIT 1);

-- Verify user exists
SELECT IF(@user_id IS NULL, 
  'ERROR: User not found! Please register first.',
  CONCAT('SUCCESS: Found user ID: ', @user_id)) AS Status;

-- ============================================
-- CLEAN EXISTING DATA
-- ============================================
DELETE rd FROM reimbursement_documents rd 
INNER JOIN reimbursements r ON rd.reimbursement_id = r.id 
WHERE r.claimant_id = @user_id;

DELETE r FROM reimbursements r WHERE r.claimant_id = @user_id;

DELETE sep FROM shared_expense_participants sep 
INNER JOIN shared_expenses se ON sep.shared_expense_id = se.id 
WHERE se.created_by = @user_id;

DELETE se FROM shared_expenses se WHERE se.created_by = @user_id;

DELETE t FROM transactions t WHERE t.user_id = @user_id;
DELETE e FROM expenses e WHERE e.user_id = @user_id;
DELETE pm FROM payment_methods pm WHERE pm.user_id = @user_id;

-- ============================================
-- INSERT PAYMENT METHODS
-- ============================================
INSERT INTO payment_methods (id, user_id, name, type, bank, last_four, is_default, active) VALUES
(UUID(), @user_id, 'HDFC Credit Card', 'CREDIT_CARD', 'HDFC Bank', '4567', TRUE, TRUE),
(UUID(), @user_id, 'SBI Debit Card', 'DEBIT_CARD', 'State Bank of India', '8901', FALSE, TRUE),
(UUID(), @user_id, 'Google Pay UPI', 'UPI', NULL, NULL, FALSE, TRUE),
(UUID(), @user_id, 'Cash', 'CASH', NULL, NULL, FALSE, TRUE);

-- Get payment method IDs
SET @pm_credit = (SELECT id FROM payment_methods WHERE user_id = @user_id AND type = 'CREDIT_CARD' LIMIT 1);
SET @pm_debit = (SELECT id FROM payment_methods WHERE user_id = @user_id AND type = 'DEBIT_CARD' LIMIT 1);
SET @pm_upi = (SELECT id FROM payment_methods WHERE user_id = @user_id AND type = 'UPI' LIMIT 1);
SET @pm_cash = (SELECT id FROM payment_methods WHERE user_id = @user_id AND type = 'CASH' LIMIT 1);

-- ============================================
-- GET CATEGORY IDS
-- ============================================
SET @cat_food = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Food & Dining' LIMIT 1);
SET @cat_shopping = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Shopping' LIMIT 1);
SET @cat_transport = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Transport' LIMIT 1);
SET @cat_entertainment = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Entertainment' LIMIT 1);
SET @cat_health = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Health & Fitness' LIMIT 1);
SET @cat_utilities = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Bills & Utilities' LIMIT 1);
SET @cat_education = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Education' LIMIT 1);
SET @cat_travel = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Travel' LIMIT 1);
SET @cat_personal = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Personal Care' LIMIT 1);
SET @cat_other = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Other' LIMIT 1);

-- ============================================
-- INSERT 50 DIVERSE EXPENSES
-- ============================================

-- Food & Dining (10 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_food, CURDATE(), 225.00, 'INR', 'CCD', 'Coffee meeting with client', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 450.00, 'INR', 'Dominos Pizza', 'Dinner with friends', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 180.00, 'INR', 'Starbucks', 'Morning coffee', @pm_debit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 320.00, 'INR', 'McDonald''s', 'Quick lunch', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 650.00, 'INR', 'Barbeque Nation', 'Team dinner celebration', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 95.00, 'INR', 'Chai Point', 'Evening snack', @pm_cash, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 380.00, 'INR', 'Swiggy', 'Food delivery', @pm_upi, 'SIMULATED_NOTIFICATION', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 520.00, 'INR', 'Zomato', 'Lunch order', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 280.00, 'INR', 'Haldiram''s', 'Snacks and sweets', @pm_cash, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_food, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 750.00, 'INR', 'Mainland China', 'Family dinner', @pm_credit, 'MANUAL', 'COMPLETED');

-- Shopping (10 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 2499.00, 'INR', 'Amazon', 'Wireless headphones', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 1850.00, 'INR', 'Myntra', 'Formal shirts', @pm_debit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 3500.00, 'INR', 'Decathlon', 'Sports shoes and gear', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 899.00, 'INR', 'Flipkart', 'Programming books', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 2450.00, 'INR', 'BigBasket', 'Monthly groceries', @pm_debit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 850.00, 'INR', 'DMart', 'Household items', @pm_cash, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 1200.00, 'INR', 'More Supermarket', 'Weekly shopping', @pm_debit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 4500.00, 'INR', 'Reliance Digital', 'Bluetooth speaker', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 650.00, 'INR', 'Shoppers Stop', 'Accessories', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_shopping, DATE_SUB(CURDATE(), INTERVAL 28 DAY), 1350.00, 'INR', 'Lifestyle', 'Casual wear', @pm_credit, 'MANUAL', 'COMPLETED');

-- Transportation (8 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 250.00, 'INR', 'Uber', 'Ride to client office', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 180.00, 'INR', 'Ola', 'Ride home late night', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 3200.00, 'INR', 'Indian Oil', 'Fuel - monthly fill', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 500.00, 'INR', 'Rapido', 'Bike ride to airport', @pm_cash, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 150.00, 'INR', 'Metro Card Recharge', 'Monthly metro pass', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 16 DAY), 2800.00, 'INR', 'HP Petrol Pump', 'Fuel', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 22 DAY), 450.00, 'INR', 'Uber', 'Airport pickup', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_transport, DATE_SUB(CURDATE(), INTERVAL 27 DAY), 320.00, 'INR', 'Ola', 'Weekend outing', @pm_upi, 'MANUAL', 'COMPLETED');

-- Entertainment (6 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_entertainment, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 800.00, 'INR', 'PVR Cinemas', 'Movie tickets for 4', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_entertainment, DATE_SUB(CURDATE(), INTERVAL 11 DAY), 499.00, 'INR', 'Netflix', 'Monthly subscription', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_entertainment, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 299.00, 'INR', 'Spotify', 'Premium subscription', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_entertainment, DATE_SUB(CURDATE(), INTERVAL 16 DAY), 1500.00, 'INR', 'Wonderla', 'Amusement park entry', @pm_debit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_entertainment, DATE_SUB(CURDATE(), INTERVAL 23 DAY), 450.00, 'INR', 'BookMyShow', 'Concert tickets', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_entertainment, DATE_SUB(CURDATE(), INTERVAL 29 DAY), 199.00, 'INR', 'Amazon Prime', 'Annual subscription', @pm_credit, 'MANUAL', 'COMPLETED');

-- Health & Fitness (5 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_health, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 850.00, 'INR', 'Apollo Pharmacy', 'Medicines', @pm_cash, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_health, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 1200.00, 'INR', 'Practo', 'Online doctor consultation', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_health, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 2500.00, 'INR', 'Fortis Hospital', 'Annual health checkup', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_health, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 1500.00, 'INR', 'Cult.fit', 'Gym membership - 3 months', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_health, DATE_SUB(CURDATE(), INTERVAL 21 DAY), 650.00, 'INR', 'HealthKart', 'Protein supplements', @pm_credit, 'MANUAL', 'COMPLETED');

-- Bills & Utilities (5 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_utilities, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1200.00, 'INR', 'Airtel', 'Mobile bill', @pm_debit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_utilities, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 2500.00, 'INR', 'BSES', 'Electricity bill', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_utilities, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 800.00, 'INR', 'Jio Fiber', 'Internet bill', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_utilities, DATE_SUB(CURDATE(), INTERVAL 19 DAY), 350.00, 'INR', 'Tata Sky', 'DTH recharge', @pm_upi, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_utilities, DATE_SUB(CURDATE(), INTERVAL 24 DAY), 1800.00, 'INR', 'Mahanagar Gas', 'Gas cylinder', @pm_cash, 'MANUAL', 'COMPLETED');

-- Education (3 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_education, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 999.00, 'INR', 'Udemy', 'React masterclass course', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_education, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 1500.00, 'INR', 'Coursera', 'AWS certification', @pm_debit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_education, DATE_SUB(CURDATE(), INTERVAL 22 DAY), 750.00, 'INR', 'Amazon', 'Technical reference books', @pm_upi, 'MANUAL', 'COMPLETED');

-- Travel (2 expenses)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_travel, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 5500.00, 'INR', 'MakeMyTrip', 'Flight tickets', @pm_credit, 'MANUAL', 'COMPLETED'),
(UUID(), @user_id, @cat_travel, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 3200.00, 'INR', 'OYO', 'Hotel booking - 2 nights', @pm_credit, 'MANUAL', 'COMPLETED');

-- Personal Care (1 expense)
INSERT INTO expenses (id, user_id, category_id, expense_date, amount, currency, merchant, description, payment_method_id, source, status) VALUES
(UUID(), @user_id, @cat_personal, DATE_SUB(CURDATE(), INTERVAL 11 DAY), 450.00, 'INR', 'Lakme Salon', 'Haircut and grooming', @pm_cash, 'MANUAL', 'COMPLETED');

-- ============================================
-- INSERT PENDING TRANSACTIONS FOR REVIEW
-- ============================================
INSERT INTO transactions (id, user_id, raw_message, parsed_amount, parsed_merchant, parsed_date, parsed_payment_method, parsed_bank, confidence, status) VALUES
(UUID(), @user_id, 'HDFC Bank Acct XX4567: Rs 380.00 debited for Swiggy on 22/09/2026. Avail Bal: Rs 45230.50', 380.00, 'Swiggy', CURDATE(), 'UPI', 'HDFC Bank', 'HIGH', 'PENDING_REVIEW'),
(UUID(), @user_id, 'SBI Acct XX8901: Rs 450.00 debited for BookMyShow on 21/09/2026. Avail Bal: Rs 28650.00', 450.00, 'BookMyShow', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'UPI', 'SBI', 'HIGH', 'PENDING_REVIEW'),
(UUID(), @user_id, 'Axis Bank Acct XX1234: Rs 1250.00 debited for Amazon on 20/09/2026. Avail Bal: Rs 52340.80', 1250.00, 'Amazon', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'CREDIT_CARD', 'Axis Bank', 'HIGH', 'PENDING_REVIEW'),
(UUID(), @user_id, 'Paytm: Payment of Rs 299.00 to Hotstar on 19/09/2026', 299.00, 'Hotstar', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'UPI', NULL, 'MEDIUM', 'PENDING_REVIEW');

-- ============================================
-- INSERT SHARED EXPENSES
-- ============================================
SET @expense_for_sharing_1 = (SELECT id FROM expenses WHERE user_id = @user_id AND merchant = 'Barbeque Nation' LIMIT 1);
SET @expense_for_sharing_2 = (SELECT id FROM expenses WHERE user_id = @user_id AND merchant = 'OYO' LIMIT 1);

SET @shared_expense_1 = UUID();
SET @shared_expense_2 = UUID();

INSERT INTO shared_expenses (id, expense_id, title, total_amount, currency, split_method, status, created_by) VALUES
(@shared_expense_1, @expense_for_sharing_1, 'Team Dinner at Barbeque Nation', 650.00, 'INR', 'EQUAL', 'ACTIVE', @user_id),
(@shared_expense_2, @expense_for_sharing_2, 'Weekend Trip - Hotel', 3200.00, 'INR', 'PERCENTAGE', 'ACTIVE', @user_id);

INSERT INTO shared_expense_participants (id, shared_expense_id, user_id, participant_name, participant_email, share_amount, paid_amount, owes_amount, owed_amount, settlement_status) VALUES
(UUID(), @shared_expense_1, @user_id, 'Mahesh Rajpurohit', @user_email, 325.00, 650.00, 0.00, 325.00, 'PENDING'),
(UUID(), @shared_expense_1, NULL, 'Rahul Sharma', 'rahul.sharma@example.com', 325.00, 0.00, 325.00, 0.00, 'PENDING'),
(UUID(), @shared_expense_2, @user_id, 'Mahesh Rajpurohit', @user_email, 1600.00, 3200.00, 0.00, 1600.00, 'PENDING'),
(UUID(), @shared_expense_2, NULL, 'Priya Patel', 'priya.patel@example.com', 1600.00, 0.00, 1600.00, 0.00, 'PENDING');

-- ============================================
-- INSERT REIMBURSEMENTS
-- ============================================
SET @reimbursement_expense_1 = (SELECT id FROM expenses WHERE user_id = @user_id AND merchant = 'Uber' AND amount = 250.00 LIMIT 1);
SET @reimbursement_expense_2 = (SELECT id FROM expenses WHERE user_id = @user_id AND merchant = 'Udemy' LIMIT 1);
SET @reimbursement_expense_3 = (SELECT id FROM expenses WHERE user_id = @user_id AND merchant = 'Indian Oil' AND amount = 3200.00 LIMIT 1);

SET @reimb_1 = UUID();
SET @reimb_2 = UUID();
SET @reimb_3 = UUID();

INSERT INTO reimbursements (id, expense_id, claimant_id, claim_amount, currency, description, status, payment_status, submitted_at) VALUES
(@reimb_1, @reimbursement_expense_1, @user_id, 250.00, 'INR', 'Uber ride to client office for business meeting. Client: Tech Solutions Inc.', 'SUBMITTED', 'PENDING', NOW()),
(@reimb_2, @reimbursement_expense_2, @user_id, 999.00, 'INR', 'React masterclass course for professional development as required by company policy.', 'APPROVED', 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@reimb_3, @reimbursement_expense_3, @user_id, 3200.00, 'INR', 'Fuel expense for field visit to Mumbai project site.', 'DRAFT', 'PENDING', NULL);

INSERT INTO reimbursement_documents (id, reimbursement_id, file_name, file_url, file_type, file_size) VALUES
(UUID(), @reimb_1, 'uber_receipt_250.pdf', '/uploads/receipts/uber_receipt_250.pdf', 'application/pdf', 125000),
(UUID(), @reimb_2, 'udemy_invoice_999.pdf', '/uploads/receipts/udemy_invoice_999.pdf', 'application/pdf', 89000),
(UUID(), @reimb_2, 'approval_email.pdf', '/uploads/receipts/approval_email.pdf', 'application/pdf', 45000);

-- ============================================
-- VERIFICATION SUMMARY
-- ============================================
SELECT '========================================' AS '';
SELECT 'DATA INSERTION COMPLETE' AS '';
SELECT '========================================' AS '';

SELECT 'User' AS Entity, email AS Detail, status AS Status FROM users WHERE id = @user_id;

SELECT 'Expenses' AS Entity, COUNT(*) AS Count, CONCAT('₹', FORMAT(SUM(amount), 2)) AS 'Total Amount'
FROM expenses WHERE user_id = @user_id;

SELECT 'Categories' AS Entity, COUNT(*) AS Count FROM categories WHERE user_id = @user_id;

SELECT 'Payment Methods' AS Entity, COUNT(*) AS Count FROM payment_methods WHERE user_id = @user_id;

SELECT 'Pending Transactions' AS Entity, COUNT(*) AS Count 
FROM transactions WHERE user_id = @user_id AND status = 'PENDING_REVIEW';

SELECT 'Shared Expenses' AS Entity, COUNT(*) AS Count FROM shared_expenses WHERE created_by = @user_id;

SELECT 'Reimbursements' AS Entity, COUNT(*) AS Count FROM reimbursements WHERE claimant_id = @user_id;

SELECT '========================================' AS '';
SELECT 'DEMO DATA READY - REFRESH FRONTEND' AS '';
SELECT '========================================' AS '';
