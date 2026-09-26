const { pool, query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Transaction Controller
 * Handles transaction simulation, parsing, approval, and duplicate detection
 */

/**
 * @route   GET /api/transactions
 * @desc    Get all pending transactions for the user
 * @access  Private
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let sql = `
      SELECT 
        t.id,
        t.raw_message,
        t.parsed_amount,
        t.parsed_merchant,
        t.parsed_date,
        t.parsed_payment_method,
        t.parsed_bank,
        t.confidence,
        t.status,
        t.duplicate_of,
        t.expense_id,
        t.created_at
      FROM transactions t
      WHERE t.user_id = ?
    `;

    const params = [userId];

    if (status) {
      // Map frontend status to database enum values
      const statusMap = {
        'pending': 'PENDING_REVIEW',
        'approved': 'APPROVED',
        'rejected': 'REJECTED',
        'duplicate': 'DUPLICATE'
      };
      sql += ' AND t.status = ?';
      params.push(statusMap[status.toLowerCase()] || status.toUpperCase());
    }

    sql += ' ORDER BY t.created_at DESC, t.parsed_date DESC';

    const [transactions] = await query(sql, params);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions/simulate
 * @desc    Simulate bank/card transactions (single or multiple)
 * @access  Private
 */
exports.simulateTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { count, transactionData } = req.body;

    // If specific transaction data is provided, create only that transaction
    if (transactionData) {
      const { rawMessage, parsedAmount, parsedMerchant, parsedDate, parsedPaymentMethod, parsedBank } = transactionData;

      if (!rawMessage || !parsedAmount || !parsedMerchant) {
        return res.status(400).json({
          success: false,
          message: 'Transaction data must include rawMessage, parsedAmount, and parsedMerchant'
        });
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const transactionId = uuidv4();
        const transactionDate = parsedDate ? new Date(parsedDate) : new Date();

        // For simulator, always create PENDING_REVIEW (no duplicate detection)
        const confidence = 'HIGH';
        const status = 'PENDING_REVIEW';

        await connection.query(
          `INSERT INTO transactions 
           (id, user_id, raw_message, parsed_amount, parsed_merchant, parsed_date, parsed_payment_method, parsed_bank, confidence, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            transactionId,
            userId,
            rawMessage,
            parsedAmount,
            parsedMerchant,
            transactionDate,
            parsedPaymentMethod || 'UPI',
            parsedBank || 'Unknown Bank',
            confidence,
            status
          ]
        );

        await connection.commit();

        res.json({
          success: true,
          message: 'Transaction simulated successfully',
          data: {
            transactions: [{
              id: transactionId,
              raw_message: rawMessage,
              parsed_amount: parseFloat(parsedAmount),
              parsed_merchant: parsedMerchant,
              parsed_date: transactionDate,
              parsed_payment_method: parsedPaymentMethod || 'UPI',
              parsed_bank: parsedBank || 'Unknown Bank',
              confidence,
              status
            }]
          }
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
      return;
    }

    // Original logic: generate multiple random transactions
    const numTransactions = count || 5;

    // Indian merchants and categories with INR amounts
    const merchants = [
      { name: 'Swiggy', category: 'Food & Dining', amount: [150, 800] },
      { name: 'Amazon India', category: 'Shopping', amount: [500, 5000] },
      { name: 'Indian Oil', category: 'Transport', amount: [1000, 3500] },
      { name: 'BigBasket', category: 'Shopping', amount: [800, 3000] },
      { name: 'Netflix', category: 'Entertainment', amount: [499, 799] },
      { name: 'Uber', category: 'Transport', amount: [150, 600] },
      { name: 'DMart', category: 'Shopping', amount: [500, 2500] },
      { name: 'Apollo Pharmacy', category: 'Health & Fitness', amount: [200, 1500] },
      { name: 'Cult.Fit', category: 'Health & Fitness', amount: [500, 2000] },
      { name: 'Airtel', category: 'Bills & Utilities', amount: [399, 999] },
      { name: 'Zomato', category: 'Food & Dining', amount: [200, 1000] },
      { name: 'BookMyShow', category: 'Entertainment', amount: [300, 800] },
      { name: 'Reliance Fresh', category: 'Shopping', amount: [400, 2000] }
    ];

    const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank'];

    const transactions = [];
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (let i = 0; i < numTransactions; i++) {
        const merchant = merchants[Math.floor(Math.random() * merchants.length)];
        const amount = (Math.random() * (merchant.amount[1] - merchant.amount[0]) + merchant.amount[0]).toFixed(2);
        const daysAgo = Math.floor(Math.random() * 30);
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - daysAgo);
        const bank = banks[Math.floor(Math.random() * banks.length)];

        const transactionId = uuidv4();
        
        // Generate notification message
        const rawMessage = `${bank} Acct XX${Math.floor(1000 + Math.random() * 9000)}: Rs ${amount} debited for ${merchant.name} on ${transactionDate.toLocaleDateString('en-IN')}. Avail Bal: Rs ${(Math.random() * 50000 + 10000).toFixed(2)}`;
        
        // Check for potential duplicates (only in PENDING_REVIEW status)
        const [duplicates] = await connection.query(
          `SELECT id FROM transactions 
           WHERE user_id = ? 
           AND parsed_merchant = ? 
           AND ABS(parsed_amount - ?) < 0.01 
           AND ABS(TIMESTAMPDIFF(HOUR, parsed_date, ?)) < 24
           AND status = 'PENDING_REVIEW'
           LIMIT 1`,
          [userId, merchant.name, amount, transactionDate]
        );

        const confidence = Math.random() > 0.3 ? 'HIGH' : 'MEDIUM';
        const status = duplicates.length > 0 ? 'DUPLICATE' : 'PENDING_REVIEW';

        await connection.query(
          `INSERT INTO transactions 
           (id, user_id, raw_message, parsed_amount, parsed_merchant, parsed_date, parsed_payment_method, parsed_bank, confidence, status, duplicate_of, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            transactionId,
            userId,
            rawMessage,
            amount,
            merchant.name,
            transactionDate,
            'UPI',
            bank,
            confidence,
            status,
            duplicates.length > 0 ? duplicates[0].id : null
          ]
        );

        transactions.push({
          id: transactionId,
          raw_message: rawMessage,
          parsed_amount: parseFloat(amount),
          parsed_merchant: merchant.name,
          parsed_date: transactionDate,
          parsed_payment_method: 'UPI',
          parsed_bank: bank,
          confidence,
          status,
          suggested_category: merchant.category
        });
      }

      await connection.commit();

      res.json({
        success: true,
        message: `${numTransactions} transaction(s) simulated successfully`,
        data: { transactions }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions/:id/approve
 * @desc    Approve a pending transaction and convert to expense
 * @access  Private
 */
exports.approveTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category_id, notes } = req.body;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get transaction
      const [transactions] = await connection.query(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ? AND status = "PENDING_REVIEW"',
        [id, userId]
      );

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or already processed'
        });
      }

      const transaction = transactions[0];

      // Verify category ownership if provided
      if (category_id) {
        const [categories] = await connection.query(
          'SELECT id FROM categories WHERE id = ? AND user_id = ?',
          [category_id, userId]
        );

        if (categories.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'Category not found or access denied'
          });
        }
      }

      // Create expense from transaction
      const expenseId = uuidv4();
      await connection.query(
        `INSERT INTO expenses 
         (id, user_id, category_id, expense_date, amount, currency, merchant, description, source, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          expenseId,
          userId,
          category_id || null,
          transaction.parsed_date,
          transaction.parsed_amount,
          'INR',
          transaction.parsed_merchant,
          transaction.raw_message,
          'SIMULATED_NOTIFICATION',
          notes || null
        ]
      );

      // Update transaction status and link to expense
      await connection.query(
        'UPDATE transactions SET status = "APPROVED", expense_id = ?, processed_at = NOW() WHERE id = ?',
        [expenseId, id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Transaction approved and expense created',
        data: { expense_id: expenseId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions/:id/reject
 * @desc    Reject a pending transaction
 * @access  Private
 */
exports.rejectTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verify transaction ownership
      const [transactions] = await connection.query(
        'SELECT id FROM transactions WHERE id = ? AND user_id = ? AND status = "PENDING_REVIEW"',
        [id, userId]
      );

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or already processed'
        });
      }

      // Update transaction status
      await connection.query(
        'UPDATE transactions SET status = "REJECTED", processed_at = NOW() WHERE id = ?',
        [id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Transaction rejected successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transactions/:id/duplicates
 * @desc    Check for potential duplicates of a transaction
 * @access  Private
 */
exports.checkDuplicates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get the transaction
    const [transactions] = await query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactions[0];

    // Find potential duplicates (within 24 hours, same merchant, similar amount)
    const [duplicates] = await query(
      `SELECT * FROM transactions 
       WHERE user_id = ? 
       AND id != ?
       AND parsed_merchant = ? 
       AND ABS(parsed_amount - ?) < 1.00
       AND ABS(TIMESTAMPDIFF(HOUR, parsed_date, ?)) < 24
       ORDER BY created_at DESC`,
      [
        userId,
        id,
        transaction.parsed_merchant,
        transaction.parsed_amount,
        transaction.parsed_date
      ]
    );

    res.json({
      success: true,
      message: 'Duplicate check completed',
      data: {
        has_duplicates: duplicates.length > 0,
        duplicates
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions/parse
 * @desc    Parse receipt text/image and create transaction
 * @access  Private
 */
exports.parseReceipt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { receipt_text } = req.body;

    if (!receipt_text) {
      return res.status(400).json({
        success: false,
        message: 'Receipt text is required'
      });
    }

    // Simple parsing logic (in production, use OCR service like AWS Textract or Google Vision)
    const lines = receipt_text.split('\n').map(l => l.trim()).filter(l => l);
    
    let merchant = lines[0] || 'Unknown Merchant';
    let amount = 0;
    let date = new Date();

    // Try to extract amount (look for INR/Rs patterns)
    const amountPattern = /Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
    for (const line of lines) {
      const match = line.match(amountPattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > 0) break;
      }
    }

    // Try to extract date
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
    for (const line of lines) {
      const match = line.match(datePattern);
      if (match) {
        const [, day, month, year] = match;
        date = new Date(year.length === 2 ? `20${year}` : year, month - 1, day);
        break;
      }
    }

    if (amount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract amount from receipt'
      });
    }

    // Create transaction
    const transactionId = uuidv4();
    await query(
      `INSERT INTO transactions 
       (id, user_id, raw_message, parsed_amount, parsed_merchant, parsed_date, parsed_payment_method, confidence, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        transactionId,
        userId,
        receipt_text,
        amount,
        merchant,
        date,
        'CASH',
        'MEDIUM',
        'PENDING_REVIEW'
      ]
    );

    res.json({
      success: true,
      message: 'Receipt parsed successfully',
      data: {
        transaction: {
          id: transactionId,
          parsed_date: date,
          parsed_merchant: merchant,
          parsed_amount: amount,
          parsed_payment_method: 'CASH',
          status: 'PENDING_REVIEW'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
