const { body, param, query } = require('express-validator');

exports.generateReportValidator = [
  body('report_type').optional().isIn(['summary', 'detailed', 'category', 'merchant']).withMessage('Invalid report type'),
  body('report_period').optional().isIn(['monthly', 'quarterly', 'yearly', 'custom']).withMessage('Invalid report period'),
  body('start_date').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  body('end_date').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date').custom((value, { req }) => {
    if (new Date(value) < new Date(req.body.start_date)) {
      throw new Error('End date must be after start date');
    }
    return true;
  })
];

exports.exportTransactionsValidator = [
  query('format').optional().isIn(['csv', 'json']).withMessage('Invalid format. Supported: csv, json'),
  query('start_date').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  query('end_date').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date')
];

exports.reportIdValidator = [
  param('id').isUUID().withMessage('Invalid report ID')
];
