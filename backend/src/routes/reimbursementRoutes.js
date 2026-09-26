const express = require('express');
const router = express.Router();
const reimbursementController = require('../controllers/reimbursementController');
const { authenticate } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const {
  createReimbursementValidator,
  updateReimbursementValidator,
  submitReimbursementValidator,
  approveReimbursementValidator,
  rejectReimbursementValidator,
  addDocumentValidator,
  removeDocumentValidator,
  getReimbursementsValidator
} = require('../validators/reimbursementValidator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all reimbursements
router.get('/', authenticate, getReimbursementsValidator, validate, reimbursementController.getReimbursements);

// Get reimbursement by ID
router.get('/:id', authenticate, reimbursementController.getReimbursementById);

// Create reimbursement
router.post('/', authenticate, createReimbursementValidator, validate, reimbursementController.createReimbursement);

// Update reimbursement
router.put('/:id', authenticate, updateReimbursementValidator, validate, reimbursementController.updateReimbursement);

// Submit reimbursement
router.post('/:id/submit', authenticate, submitReimbursementValidator, validate, reimbursementController.submitReimbursement);

// Approve reimbursement
router.post('/:id/approve', authenticate, approveReimbursementValidator, validate, reimbursementController.approveReimbursement);

// Reject reimbursement
router.post('/:id/reject', authenticate, rejectReimbursementValidator, validate, reimbursementController.rejectReimbursement);

// Mark as paid
router.post('/:id/mark-paid', authenticate, reimbursementController.markAsPaid);

// Add document
router.post('/:id/documents', authenticate, addDocumentValidator, validate, reimbursementController.addDocument);

// Remove document
router.delete('/:id/documents/:documentId', authenticate, removeDocumentValidator, validate, reimbursementController.removeDocument);

// Delete reimbursement
router.delete('/:id', authenticate, reimbursementController.deleteReimbursement);

module.exports = router;
