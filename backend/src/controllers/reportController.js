const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

/**
 * Report Controller
 * Handles report generation and exports (PDF, CSV, Excel)
 */

/**
 * @route   GET /api/reports
 * @desc    Get all saved reports for the user
 * @access  Private
 */
exports.getReports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [reports] = await db.query(
      `SELECT 
        id,
        title,
        report_type,
        period_start as start_date,
        period_end as end_date,
        total_income,
        total_expenses,
        net_amount as net_balance,
        generated_at
      FROM reports
      WHERE user_id = ?
      ORDER BY generated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Reports retrieved successfully',
      data: { reports }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reports/generate
 * @desc    Generate a new report
 * @access  Private
 */
exports.generateReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { report_type, report_period, start_date, end_date } = req.body;

    // Get expense summary
    const [summary] = await db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE amount END), 0) as total_expenses,
        COUNT(*) as transaction_count
      FROM expenses
      WHERE user_id = ? AND expense_date BETWEEN ? AND ?`,
      [userId, start_date, end_date]
    );

    const totalIncome = parseFloat(summary[0].total_income) || 0;
    const totalExpenses = parseFloat(summary[0].total_expenses) || 0;
    const netBalance = totalIncome - totalExpenses;

    // Get category breakdown
    const [categoryBreakdown] = await db.query(
      `SELECT 
        c.name as category,
        c.icon,
        c.color,
        COUNT(e.id) as transaction_count,
        SUM(e.amount) as total_amount
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ? AND e.expense_date BETWEEN ? AND ?
      GROUP BY e.category_id, c.name, c.icon, c.color
      ORDER BY total_amount DESC`,
      [userId, start_date, end_date]
    );

    // Get top merchants
    const [topMerchants] = await db.query(
      `SELECT 
        merchant,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM expenses
      WHERE user_id = ? AND expense_date BETWEEN ? AND ? AND merchant IS NOT NULL
      GROUP BY merchant
      ORDER BY total_amount DESC
      LIMIT 10`,
      [userId, start_date, end_date]
    );

    // Save report
    const reportId = uuidv4();
    await db.query(
      `INSERT INTO reports 
       (id, user_id, title, report_type, period_start, period_end, total_income, total_expenses, net_amount, category_breakdown, merchant_breakdown, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        reportId,
        userId,
        `${report_period} Report ${start_date} to ${end_date}`,
        (report_type || 'CUSTOM').toUpperCase(),
        start_date,
        end_date,
        totalIncome,
        totalExpenses,
        netBalance,
        JSON.stringify(categoryBreakdown),
        JSON.stringify(topMerchants)
      ]
    );

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        report_id: reportId,
        summary: {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          net_balance: netBalance,
          transaction_count: summary[0].transaction_count
        },
        category_breakdown: categoryBreakdown,
        top_merchants: topMerchants
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:id/export/pdf
 * @desc    Export report as PDF
 * @access  Private
 */
exports.exportPDF = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get report
    const [reports] = await db.query(
      `SELECT 
        *,
        period_start as start_date,
        period_end as end_date,
        net_amount as net_balance,
        merchant_breakdown as top_merchants,
        title as report_period
      FROM reports WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied'
      });
    }

    const report = reports[0];
    
    // Parse JSON fields if they're strings, otherwise use as-is
    const categoryBreakdown = typeof report.category_breakdown === 'string' 
      ? JSON.parse(report.category_breakdown || '[]')
      : (report.category_breakdown || []);
    
    const topMerchants = typeof report.top_merchants === 'string'
      ? JSON.parse(report.top_merchants || '[]')
      : (report.top_merchants || []);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="expense-report-${report.report_period}-${Date.now()}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc.fontSize(20).text('Expense Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Period: ${report.report_period.toUpperCase()}`, { align: 'center' });
    doc.text(`${new Date(report.start_date).toLocaleDateString()} - ${new Date(report.end_date).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary section
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.fillColor('black').text(`Total Income: ₹${parseFloat(report.total_income).toFixed(2)}`);
    doc.fillColor('black').text(`Total Expenses: ₹${parseFloat(report.total_expenses).toFixed(2)}`);
    
    const netBalance = parseFloat(report.net_balance);
    if (netBalance >= 0) {
      doc.fillColor('green');
    } else {
      doc.fillColor('red');
    }
    doc.text(`Net Balance: ₹${netBalance.toFixed(2)}`);
    doc.fillColor('black'); // Reset to black
    doc.moveDown(2);

    // Category breakdown
    if (categoryBreakdown && categoryBreakdown.length > 0) {
      doc.fontSize(16).fillColor('black').text('Category Breakdown', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      
      categoryBreakdown.forEach(cat => {
        doc.fillColor('black').text(`${cat.category || 'Uncategorized'}: ₹${parseFloat(cat.total_amount).toFixed(2)} (${cat.transaction_count} transactions)`);
      });
      doc.moveDown(2);
    }

    // Top merchants
    if (topMerchants && topMerchants.length > 0) {
      doc.fontSize(16).fillColor('black').text('Top Merchants', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      
      topMerchants.forEach((merchant, index) => {
        doc.fillColor('black').text(`${index + 1}. ${merchant.merchant}: ₹${parseFloat(merchant.total_amount).toFixed(2)} (${merchant.transaction_count} transactions)`);
      });
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:id/export/csv
 * @desc    Export report as CSV
 * @access  Private
 */
exports.exportCSV = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get report
    const [reports] = await db.query(
      `SELECT 
        *,
        period_start as start_date,
        period_end as end_date,
        net_amount as net_balance,
        merchant_breakdown as top_merchants,
        title as report_period
      FROM reports WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied'
      });
    }

    const report = reports[0];

    // Get detailed expenses for the period
    const [expenses] = await db.query(
      `SELECT 
        e.expense_date as date,
        e.merchant,
        e.description,
        e.amount,
        e.currency,
        pm.name as payment_method,
        c.name as category,
        e.notes
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      WHERE e.user_id = ? AND e.expense_date BETWEEN ? AND ?
      ORDER BY e.expense_date DESC`,
      [userId, report.start_date, report.end_date]
    );

    // Convert to CSV
    const fields = ['date', 'merchant', 'description', 'category', 'amount', 'currency', 'payment_method', 'notes'];
    const parser = new Parser({ fields });
    const csv = parser.parse(expenses);

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expense-report-${report.report_period}-${Date.now()}.csv"`);
    
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:id/export/excel
 * @desc    Export report as Excel
 * @access  Private
 */
exports.exportExcel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get report
    const [reports] = await db.query(
      `SELECT 
        *,
        period_start as start_date,
        period_end as end_date,
        net_amount as net_balance,
        merchant_breakdown as top_merchants,
        title as report_period
      FROM reports WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied'
      });
    }

    const report = reports[0];
    
    // Parse JSON fields if they're strings, otherwise use as-is  
    const categoryBreakdown = typeof report.category_breakdown === 'string'
      ? JSON.parse(report.category_breakdown || '[]')
      : (report.category_breakdown || []);
    
    const topMerchants = typeof report.top_merchants === 'string'
      ? JSON.parse(report.top_merchants || '[]')
      : (report.top_merchants || []);

    // Get detailed expenses
    const [expenses] = await db.query(
      `SELECT 
        e.expense_date as date,
        e.merchant,
        e.description,
        e.amount,
        e.currency,
        pm.name as payment_method,
        c.name as category,
        e.notes
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      WHERE e.user_id = ? AND e.expense_date BETWEEN ? AND ?
      ORDER BY e.expense_date DESC`,
      [userId, report.start_date, report.end_date]
    );

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    
    summarySheet.addRows([
      { metric: 'Report Period', value: report.title || report.report_period },
      { metric: 'Start Date', value: new Date(report.start_date).toLocaleDateString('en-IN') },
      { metric: 'End Date', value: new Date(report.end_date).toLocaleDateString('en-IN') },
      { metric: '', value: '' },
      { metric: 'Total Income', value: parseFloat(report.total_income).toFixed(2) },
      { metric: 'Total Expenses', value: parseFloat(report.total_expenses).toFixed(2) },
      { metric: 'Net Balance', value: parseFloat(report.net_balance).toFixed(2) }
    ]);

    // Style header row
    summarySheet.getRow(1).font = { bold: true };

    // Category breakdown sheet
    if (categoryBreakdown && categoryBreakdown.length > 0) {
      const categorySheet = workbook.addWorksheet('Category Breakdown');
      categorySheet.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Transactions', key: 'transaction_count', width: 15 },
        { header: 'Total Amount (₹)', key: 'total_amount', width: 15 }
      ];
      
      categoryBreakdown.forEach(cat => {
        categorySheet.addRow({
          category: cat.category || 'Uncategorized',
          transaction_count: parseInt(cat.transaction_count) || 0,
          total_amount: parseFloat(cat.total_amount).toFixed(2)
        });
      });
      
      categorySheet.getRow(1).font = { bold: true };
      categorySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    // Top merchants sheet
    if (topMerchants && topMerchants.length > 0) {
      const merchantSheet = workbook.addWorksheet('Top Merchants');
      merchantSheet.columns = [
        { header: 'Merchant', key: 'merchant', width: 25 },
        { header: 'Transactions', key: 'transaction_count', width: 15 },
        { header: 'Total Amount (₹)', key: 'total_amount', width: 15 }
      ];
      
      topMerchants.forEach(merchant => {
        merchantSheet.addRow({
          merchant: merchant.merchant || 'Unknown',
          transaction_count: parseInt(merchant.transaction_count) || 0,
          total_amount: parseFloat(merchant.total_amount).toFixed(2)
        });
      });
      
      merchantSheet.getRow(1).font = { bold: true };
      merchantSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    // Transactions sheet
    const transactionSheet = workbook.addWorksheet('Transactions');
    transactionSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Merchant', key: 'merchant', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Payment Method', key: 'payment_method', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];
    
    expenses.forEach(expense => {
      transactionSheet.addRow({
        date: new Date(expense.date).toLocaleDateString('en-IN'),
        merchant: expense.merchant || 'Unknown',
        description: expense.description || '',
        category: expense.category || 'Uncategorized',
        amount: parseFloat(expense.amount).toFixed(2),
        currency: expense.currency || 'INR',
        payment_method: expense.payment_method || 'N/A',
        notes: expense.notes || ''
      });
    });
    
    transactionSheet.getRow(1).font = { bold: true };
    transactionSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="expense-report-${report.report_period}-${Date.now()}.xlsx"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/export/transactions
 * @desc    Export transactions directly without saving report
 * @access  Private
 */
exports.exportTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { format = 'csv', start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'start_date and end_date are required'
      });
    }

    // Get expenses
    const [expenses] = await db.query(
      `SELECT 
        e.expense_date as date,
        e.merchant,
        e.description,
        e.amount,
        e.currency,
        pm.name as payment_method,
        c.name as category,
        e.notes
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      WHERE e.user_id = ? AND e.expense_date BETWEEN ? AND ?
      ORDER BY e.expense_date DESC`,
      [userId, start_date, end_date]
    );

    if (format === 'csv') {
      const fields = ['date', 'merchant', 'description', 'category', 'amount', 'currency', 'payment_method', 'notes'];
      const parser = new Parser({ fields });
      const csv = parser.parse(expenses);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.json"`);
      res.json(expenses);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: csv, json'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a saved report
 * @access  Private
 */
exports.deleteReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM reports WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
