const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Shared Expense Controller
 * Handles shared expenses, participants, splits, and settlements
 */

/**
 * @route   GET /api/shared-expenses
 * @desc    Get all shared expenses for the user
 * @access  Private
 */
exports.getSharedExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get shared expenses
    const [sharedExpenses] = await db.query(
      `SELECT 
        se.id,
        se.expense_id,
        se.title,
        se.total_amount,
        se.currency,
        se.split_method,
        se.status,
        se.created_at,
        e.expense_date as date,
        e.merchant,
        e.description
      FROM shared_expenses se
      LEFT JOIN expenses e ON se.expense_id = e.id
      WHERE se.created_by = ?
      ORDER BY se.created_at DESC`,
      [userId]
    );

    if (sharedExpenses.length === 0) {
      return res.json({
        success: true,
        message: 'No shared expenses found',
        data: { shared_expenses: [] }
      });
    }

    // Get all participants
    const sharedExpenseIds = sharedExpenses.map(se => se.id);
    const placeholders = sharedExpenseIds.map(() => '?').join(',');
    
    const [allParticipants] = await db.query(
      `SELECT 
        shared_expense_id,
        id,
        user_id,
        participant_name as name,
        participant_email as email,
        share_amount as share,
        paid_amount as paid,
        owes_amount as owes,
        owed_amount as owed,
        settlement_status
      FROM shared_expense_participants
      WHERE shared_expense_id IN (${placeholders})
      ORDER BY created_at`,
      sharedExpenseIds
    );

    // Group participants by shared_expense_id
    const participantMap = {};
    allParticipants.forEach(p => {
      const seId = p.shared_expense_id;
      if (!participantMap[seId]) {
        participantMap[seId] = [];
      }
      // Remove shared_expense_id from participant object
      const { shared_expense_id, ...participant } = p;
      participantMap[seId].push(participant);
    });

    // Attach participants to each shared expense
    sharedExpenses.forEach(se => {
      se.participants = participantMap[se.id] || [];
    });

    res.json({
      success: true,
      message: 'Shared expenses retrieved successfully',
      data: { shared_expenses: sharedExpenses }
    });
  } catch (error) {
    console.error('Error in getSharedExpenses:', error);
    next(error);
  }
};

/**
 * @route   GET /api/shared-expenses/:id
 * @desc    Get shared expense details with participants
 * @access  Private
 */
exports.getSharedExpenseById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get shared expense
    const [sharedExpenses] = await db.query(
      `SELECT 
        se.*,
        e.expense_date as date,
        e.merchant,
        e.description,
        e.payment_method_id,
        e.receipt_url
      FROM shared_expenses se
      LEFT JOIN expenses e ON se.expense_id = e.id
      WHERE se.id = ? 
        AND (se.created_by = ? OR se.id IN (SELECT shared_expense_id FROM shared_expense_participants WHERE user_id = ?))`,
      [id, userId, userId]
    );

    if (sharedExpenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shared expense not found or access denied'
      });
    }

    // Get participants
    const [participants] = await db.query(
      `SELECT 
        sep.id,
        sep.user_id,
        sep.participant_name as name,
        sep.participant_email as email,
        sep.share_amount as share,
        sep.paid_amount as paid,
        sep.owes_amount as owes,
        sep.owed_amount as owed,
        sep.settlement_status as status,
        sep.settled_at,
        up.full_name
      FROM shared_expense_participants sep
      LEFT JOIN user_profiles up ON sep.user_id = up.user_id
      WHERE sep.shared_expense_id = ?
      ORDER BY sep.created_at`,
      [id]
    );

    const sharedExpense = {
      ...sharedExpenses[0],
      participants
    };

    res.json({
      success: true,
      message: 'Shared expense retrieved successfully',
      data: { shared_expense: sharedExpense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/shared-expenses
 * @desc    Create a new shared expense
 * @access  Private
 */
exports.createSharedExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { expense_id, title, split_method, participants } = req.body;

    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required'
      });
    }

    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get expense details
      const [expenses] = await connection.query(
        'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
        [expense_id, userId]
      );

      if (expenses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or access denied'
        });
      }

      const expense = expenses[0];
      const totalAmount = parseFloat(expense.amount);

      // Create shared expense
      const sharedExpenseId = uuidv4();
      await connection.query(
        `INSERT INTO shared_expenses 
         (id, expense_id, created_by, title, total_amount, currency, split_method, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          sharedExpenseId,
          expense_id,
          userId,
          title || `Split: ${expense.merchant || 'Expense'}`,
          totalAmount,
          expense.currency || 'INR',
          split_method || 'EQUAL',
          'OPEN'
        ]
      );

      // Calculate splits
      const participantCount = participants.length;
      let remainingAmount = totalAmount;

      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        let shareAmount;

        if (split_method === 'EQUAL' || split_method === 'equal') {
          // Equal split
          if (i === participants.length - 1) {
            // Last participant gets remaining amount to handle rounding
            shareAmount = remainingAmount;
          } else {
            shareAmount = Math.round((totalAmount / participantCount) * 100) / 100;
          }
        } else if (split_method === 'MANUAL' || split_method === 'manual') {
          // Manual/custom amount
          shareAmount = parseFloat(participant.share_amount) || 0;
        } else if (split_method === 'PERCENTAGE' || split_method === 'percentage') {
          // Percentage split
          const percentage = parseFloat(participant.share_percentage) || 0;
          shareAmount = Math.round((totalAmount * percentage / 100) * 100) / 100;
        } else {
          // Default to equal
          shareAmount = Math.round((totalAmount / participantCount) * 100) / 100;
        }

        remainingAmount -= shareAmount;

        // Determine participant name - keep original case
        const participantName = participant.participant_name || participant.name || participant.email?.split('@')[0] || 'Unknown';
        
        // Check if this is the creator (first participant or marked as creator)
        const isCreator = i === 0 || participant.is_creator;
        
        // If creator, mark as already paid
        const paidAmount = isCreator ? shareAmount : 0.00;
        const owesAmount = isCreator ? 0.00 : shareAmount;
        const owedAmount = isCreator ? shareAmount : 0.00;
        const settlementStatus = isCreator ? 'SETTLED' : 'PENDING';

        await connection.query(
          `INSERT INTO shared_expense_participants 
           (id, shared_expense_id, user_id, participant_name, participant_email, share_amount, paid_amount, owes_amount, owed_amount, settlement_status, settled_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            uuidv4(),
            sharedExpenseId,
            participant.user_id || null,
            participantName,
            participant.email || null,
            shareAmount,
            paidAmount,
            owesAmount,
            owedAmount,
            settlementStatus,
            isCreator ? new Date() : null
          ]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Shared expense created successfully',
        data: { shared_expense_id: sharedExpenseId }
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
 * @route   PATCH /api/shared-expenses/:id/participants/:participantId/settle
 * @desc    Mark a participant's share as paid
 * @access  Private
 */
exports.settleParticipant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id, participantId } = req.params;
    const { amount_paid } = req.body;

    // Verify access
    const [sharedExpenses] = await db.query(
      'SELECT created_by FROM shared_expenses WHERE id = ?',
      [id]
    );

    if (sharedExpenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shared expense not found'
      });
    }

    const [participants] = await db.query(
      'SELECT * FROM shared_expense_participants WHERE id = ? AND shared_expense_id = ?',
      [participantId, id]
    );

    if (participants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    const participant = participants[0];
    const isCreator = sharedExpenses[0].created_by === userId;
    const isParticipant = participant.user_id === userId;

    if (!isCreator && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as settled
    await db.query(
      `UPDATE shared_expense_participants 
       SET settlement_status = 'SETTLED'
       WHERE id = ?`,
      [participantId]
    );

    // Check if all participants are settled
    const [allParticipants] = await db.query(
      `SELECT COUNT(*) as total, 
       SUM(CASE WHEN settlement_status = 'SETTLED' THEN 1 ELSE 0 END) as settled_count 
       FROM shared_expense_participants 
       WHERE shared_expense_id = ?`,
      [id]
    );

    if (allParticipants[0].total === allParticipants[0].settled_count) {
      await db.query(
        `UPDATE shared_expenses SET status = 'SETTLED' WHERE id = ?`,
        [id]
      );
    }

    res.json({
      success: true,
      message: 'Settlement recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/shared-expenses/:id
 * @desc    Delete/cancel a shared expense
 * @access  Private
 */
exports.deleteSharedExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verify ownership
      const [sharedExpenses] = await connection.query(
        'SELECT * FROM shared_expenses WHERE id = ? AND created_by = ?',
        [id, userId]
      );

      if (sharedExpenses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Shared expense not found or access denied'
        });
      }

      // Check if any payments have been made
      const [participants] = await connection.query(
        'SELECT COUNT(*) as paid_count FROM shared_expense_participants WHERE shared_expense_id = ? AND amount_paid > 0',
        [id]
      );

      if (participants[0].paid_count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete shared expense with payments already made'
        });
      }

      // Delete participants
      await connection.query(
        'DELETE FROM shared_expense_participants WHERE shared_expense_id = ?',
        [id]
      );

      // Delete shared expense
      await connection.query('DELETE FROM shared_expenses WHERE id = ?', [id]);

      await connection.commit();

      res.json({
        success: true,
        message: 'Shared expense deleted successfully'
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
 * @route   POST /api/shared-expenses/:id/remind
 * @desc    Send reminder to participants who haven't paid
 * @access  Private
 */
exports.sendReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const [sharedExpenses] = await db.query(
      'SELECT * FROM shared_expenses WHERE id = ? AND created_by = ?',
      [id, userId]
    );

    if (sharedExpenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shared expense not found or access denied'
      });
    }

    // Get unpaid participants
    const [participants] = await db.query(
      `SELECT email, amount_owed, amount_paid 
       FROM shared_expense_participants 
       WHERE shared_expense_id = ? AND status != 'paid'`,
      [id]
    );

    // In a real application, send emails here
    // For now, just return the list of participants to remind
    res.json({
      success: true,
      message: `Reminders would be sent to ${participants.length} participant(s)`,
      data: {
        participants: participants.map(p => ({
          email: p.email,
          amount_remaining: parseFloat(p.amount_owed) - parseFloat(p.amount_paid)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
