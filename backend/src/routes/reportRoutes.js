const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const {
  generateReportValidator,
  exportTransactionsValidator,
  reportIdValidator
} = require('../validators/reportValidator');

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

// Get all reports
router.get('/', authenticate, reportController.getReports);

// Generate report
router.post('/generate', authenticate, generateReportValidator, validate, reportController.generateReport);

// Export transactions directly
router.get('/export/transactions', authenticate, exportTransactionsValidator, validate, reportController.exportTransactions);

// Export report as PDF
router.get('/:id/export/pdf', authenticate, reportIdValidator, validate, reportController.exportPDF);

// Export report as CSV
router.get('/:id/export/csv', authenticate, reportIdValidator, validate, reportController.exportCSV);

// Export report as Excel
router.get('/:id/export/excel', authenticate, reportIdValidator, validate, reportController.exportExcel);

// Delete report
router.delete('/:id', authenticate, reportIdValidator, validate, reportController.deleteReport);

module.exports = router;
