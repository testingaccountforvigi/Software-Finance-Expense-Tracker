const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { sendReimbursementEmail } = require('../services/emailService');

/**
 * Reimbursement Controller
 * Handles reimbursement requests with state machine: Draft → Submitted → Under Review → Approved/Rejected → Paid
 */

/**
 * @route   GET /api/reimbursements
 * @desc    Get all reimbursements for the user
 * @access  Private
 */
exports.getReimbursements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, start_date, end_date } = req.query;

    let query = `
      SELECT 
        r.id,
        r.expense_id,
        r.claim_amount as amount,
        r.currency,
        r.description,
        r.status,
        r.payment_status,
        r.submitted_at,
        r.reviewed_at,
        r.paid_at,
        r.reviewer_name,
        r.review_notes as reviewer_notes,
        r.rejection_reason,
        r.created_at,
        e.expense_date,
        e.merchant,
        e.description as expense_description,
        e.category_id,
        c.name as category_name,
        (SELECT COUNT(*) FROM reimbursement_documents WHERE reimbursement_id = r.id) as document_count
      FROM reimbursements r
      LEFT JOIN expenses e ON r.expense_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE r.claimant_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (start_date) {
      query += ' AND r.submitted_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND r.submitted_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY r.created_at DESC';

    const [reimbursements] = await db.query(query, params);

    res.json({
      success: true,
      message: 'Reimbursements retrieved successfully',
      data: { reimbursements }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reimbursements/:id
 * @desc    Get reimbursement details with documents
 * @access  Private
 */
exports.getReimbursementById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get reimbursement
    const [reimbursements] = await db.query(
      `SELECT 
        r.*,
        e.date as expense_date,
        e.merchant,
        e.description,
        e.payment_method,
        e.receipt_url,
        e.category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM reimbursements r
      LEFT JOIN expenses e ON r.expense_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE r.id = ? AND r.user_id = ?`,
      [id, userId]
    );

    if (reimbursements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found or access denied'
      });
    }

    // Get documents
    const [documents] = await db.query(
      'SELECT id, document_type, file_name, file_url, file_size, uploaded_at FROM reimbursement_documents WHERE reimbursement_id = ? ORDER BY uploaded_at',
      [id]
    );

    const reimbursement = {
      ...reimbursements[0],
      documents
    };

    res.json({
      success: true,
      message: 'Reimbursement retrieved successfully',
      data: { reimbursement }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reimbursements
 * @desc    Create a new reimbursement request
 * @access  Private
 */
exports.createReimbursement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { expense_id, title, description, amount, currency } = req.body;

    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // If expense_id provided, verify ownership
      if (expense_id) {
        const [expenses] = await connection.query(
          'SELECT id, amount, currency FROM expenses WHERE id = ? AND user_id = ?',
          [expense_id, userId]
        );

        if (expenses.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Expense not found or access denied'
          });
        }
      }

      // Create reimbursement
      const reimbursementId = uuidv4();
      await connection.query(
        `INSERT INTO reimbursements 
         (id, claimant_id, expense_id, description, claim_amount, currency, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          reimbursementId,
          userId,
          expense_id || null,
          description || null,
          amount,
          currency || 'INR',
          'DRAFT'
        ]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Reimbursement created successfully',
        data: { reimbursement_id: reimbursementId }
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
 * @route   PUT /api/reimbursements/:id
 * @desc    Update a reimbursement (only in draft status)
 * @access  Private
 */
exports.updateReimbursement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, amount } = req.body;

    // Verify ownership and status
    const [reimbursements] = await db.query(
      'SELECT * FROM reimbursements WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reimbursements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found or access denied'
      });
    }

    if (reimbursements[0].status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only update reimbursements in draft status'
      });
    }

    // Update reimbursement
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await db.query(
      `UPDATE reimbursements SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Reimbursement updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reimbursements/:id/submit
 * @desc    Submit a reimbursement for review
 * @access  Private
 */
exports.submitReimbursement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { recipientEmail, customEmailBody } = req.body;

    // Validate email
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid recipient email is required'
      });
    }

    // Get reimbursement details
    const [reimbursements] = await db.query(
      `SELECT r.*, up.full_name as claimant_name, e.expense_date, e.merchant
       FROM reimbursements r
       LEFT JOIN user_profiles up ON r.claimant_id = up.user_id
       LEFT JOIN expenses e ON r.expense_id = e.id
       WHERE r.id = ? AND r.claimant_id = ?`,
      [id, userId]
    );

    if (reimbursements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found or access denied'
      });
    }

    const reimb = reimbursements[0];

    if (reimb.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Can only submit reimbursements in DRAFT status'
      });
    }

    // Update status to SUBMITTED and save email details
    await db.query(
      `UPDATE reimbursements 
       SET status = ?, 
           submitted_at = NOW(), 
           reviewer_email = ?,
           custom_email_body = ?,
           email_sent = TRUE,
           email_sent_at = NOW()
       WHERE id = ?`,
      ['SUBMITTED', recipientEmail, customEmailBody || null, id]
    );

    // Send email notification
    try {
      await sendReimbursementEmail(
        recipientEmail, 
        {
          amount: reimb.claim_amount,
          reason: reimb.description || 'Reimbursement request',
          date: reimb.expense_date || reimb.created_at,
          claimantName: reimb.claimant_name || 'User'
        },
        customEmailBody
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError.message);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Reimbursement submitted for review and email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/reimbursements/:id/approve;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reimbursements/:id/approve
 * @desc    Approve a reimbursement (admin function - simplified for demo)
 * @access  Private
 */
exports.approveReimbursement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reviewer_notes } = req.body;

    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get reimbursement
      const [reimbursements] = await connection.query(
        'SELECT * FROM reimbursements WHERE id = ?',
        [id]
      );

      if (reimbursements.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reimbursement not found'
        });
      }

      const reimbursement = reimbursements[0];

      if (reimbursement.status !== 'submitted' && reimbursement.status !== 'under_review') {
        return res.status(400).json({
          success: false,
          message: 'Can only approve submitted or under review reimbursements'
        });
      }

      // Update status
      await connection.query(
        'UPDATE reimbursements SET status = "approved", reviewed_at = NOW(), reviewer_notes = ?, updated_at = NOW() WHERE id = ?',
        [reviewer_notes || null, id]
      );

      // Log audit event
      await connection.query(
        `INSERT INTO audit_events 
         (id, user_id, event_type, event_action, resource_type, resource_id, old_values, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          uuidv4(),
          userId,
          'reimbursement',
          'approve',
          'reimbursement',
          id,
          JSON.stringify({ reviewer_notes }),
          req.ip || null,
          req.get('user-agent') || null
        ]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Reimbursement approved successfully'
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
 * @route   POST /api/reimbursements/:id/reject
 * @desc    Reject a reimbursement (admin function - simplified for demo)
 * @access  Private
 */
exports.rejectReimbursement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get reimbursement
      const [reimbursements] = await connection.query(
        'SELECT * FROM reimbursements WHERE id = ?',
        [id]
      );

      if (reimbursements.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reimbursement not found'
        });
      }

      const reimbursement = reimbursements[0];

      if (reimbursement.status !== 'submitted' && reimbursement.status !== 'under_review') {
        return res.status(400).json({
          success: false,
          message: 'Can only reject submitted or under review reimbursements'
        });
      }

      // Update status
      await connection.query(
        'UPDATE reimbursements SET status = "rejected", reviewed_at = NOW(), rejection_reason = ?, updated_at = NOW() WHERE id = ?',
        [rejection_reason, id]
      );

      // Log audit event
      await connection.query(
        `INSERT INTO audit_events 
         (id, user_id, event_type, event_action, resource_type, resource_id, old_values, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          uuidv4(),
          userId,
          'reimbursement',
          'reject',
          'reimbursement',
          id,
          JSON.stringify({ rejection_reason }),
          req.ip || null,
          req.get('user-agent') || null
        ]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Reimbursement rejected'
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
 * @route   POST /api/reimbursements/:id/mark-paid
 * @desc    Mark a reimbursement as paid
 * @access  Private
 */
exports.markAsPaid = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get reimbursement
      const [reimbursements] = await connection.query(
        'SELECT * FROM reimbursements WHERE id = ?',
        [id]
      );

      if (reimbursements.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reimbursement not found'
        });
      }

      if (reimbursements[0].status !== 'APPROVED' && reimbursements[0].status !== 'SUBMITTED') {
        return res.status(400).json({
          success: false,
          message: 'Can only mark approved or submitted reimbursements as paid'
        });
      }

      // Update status
      await connection.query(
        'UPDATE reimbursements SET status = "PAID", payment_status = "PAID", paid_at = NOW(), updated_at = NOW() WHERE id = ?',
        [id]
      );

      // Log audit event
      await connection.query(
        `INSERT INTO audit_events 
         (id, user_id, event_type, event_action, resource_type, resource_id, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          uuidv4(),
          userId,
          'reimbursement',
          'mark_paid',
          'reimbursement',
          id,
          req.ip || null,
          req.get('user-agent') || null
        ]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Reimbursement marked as paid'
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
 * @route   POST /api/reimbursements/:id/documents
 * @desc    Add a document to a reimbursement
 * @access  Private
 */
exports.addDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { document_type, file_name, file_url, file_size } = req.body;

    // Verify ownership
    const [reimbursements] = await db.query(
      'SELECT * FROM reimbursements WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reimbursements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found or access denied'
      });
    }

    if (reimbursements[0].status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only add documents to draft reimbursements'
      });
    }

    // Add document
    const documentId = uuidv4();
    await db.query(
      `INSERT INTO reimbursement_documents 
       (id, reimbursement_id, document_type, file_name, file_url, file_size, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [documentId, id, document_type || 'receipt', file_name, file_url, file_size || null]
    );

    res.status(201).json({
      success: true,
      message: 'Document added successfully',
      data: { document_id: documentId }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reimbursements/:id/documents/:documentId
 * @desc    Remove a document from a reimbursement
 * @access  Private
 */
exports.removeDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id, documentId } = req.params;

    // Verify ownership
    const [reimbursements] = await db.query(
      'SELECT * FROM reimbursements WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reimbursements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found or access denied'
      });
    }

    if (reimbursements[0].status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only remove documents from draft reimbursements'
      });
    }

    // Delete document
    const [result] = await db.query(
      'DELETE FROM reimbursement_documents WHERE id = ? AND reimbursement_id = ?',
      [documentId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reimbursements/:id
 * @desc    Delete a reimbursement (only in draft status)
 * @access  Private
 */
exports.deleteReimbursement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verify ownership and status
      const [reimbursements] = await connection.query(
        'SELECT * FROM reimbursements WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (reimbursements.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reimbursement not found or access denied'
        });
      }

      if (reimbursements[0].status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Can only delete reimbursements in draft status'
        });
      }

      // Delete documents
      await connection.query(
        'DELETE FROM reimbursement_documents WHERE reimbursement_id = ?',
        [id]
      );

      // Delete reimbursement
      await connection.query('DELETE FROM reimbursements WHERE id = ?', [id]);

      await connection.commit();

      res.json({
        success: true,
        message: 'Reimbursement deleted successfully'
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
