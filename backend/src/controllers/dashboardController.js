const { query } = require('../config/database');

/**
 * Get dashboard summary statistics
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let dateCondition = '';
    let params = [userId];

    if (month && year) {
      dateCondition = ' AND YEAR(expense_date) = ? AND MONTH(expense_date) = ?';
      params.push(parseInt(year), parseInt(month));
    } else if (year) {
      dateCondition = ' AND YEAR(expense_date) = ?';
      params.push(parseInt(year));
    }

    // Get total expenses
    const [expenseSummary] = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_expenses,
        COALESCE(AVG(amount), 0) as average_expense
       FROM expenses
       WHERE user_id = ? AND status = 'COMPLETED'${dateCondition}`,
      params
    );

    // Get monthly income from profile
    const [profile] = await query(
      'SELECT monthly_income, currency FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    const monthlyIncome = profile ? profile.monthly_income : 0;
    const currency = profile ? profile.currency : 'INR';
    const remaining = monthlyIncome - expenseSummary.total_expenses;

    res.json({
      success: true,
      data: {
        totalIncome: monthlyIncome,
        totalExpenses: expenseSummary.total_expenses,
        remaining,
        transactionCount: expenseSummary.total_transactions,
        averageExpense: expenseSummary.average_expense,
        currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category breakdown
 */
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year, limit = 10 } = req.query;

    let dateCondition = '';
    let params = [userId];

    if (month && year) {
      dateCondition = ' AND YEAR(e.expense_date) = ? AND MONTH(e.expense_date) = ?';
      params.push(parseInt(year), parseInt(month));
    }

    const [breakdown] = await query(
      `SELECT 
        c.id, c.name, c.color,
        COUNT(e.id) as transaction_count,
        SUM(e.amount) as total_amount,
        AVG(e.amount) as average_amount
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = ? AND e.status = 'COMPLETED'${dateCondition}
       GROUP BY c.id, c.name, c.color
       ORDER BY total_amount DESC
       LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get spending trends
 */
const getTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', limit = 12 } = req.query;

    let groupBy = 'YEAR(expense_date), MONTH(expense_date)';
    let selectPeriod = 'YEAR(expense_date) as year, MONTH(expense_date) as month';

    if (period === 'daily') {
      groupBy = 'DATE(expense_date)';
      selectPeriod = 'DATE(expense_date) as date';
    } else if (period === 'yearly') {
      groupBy = 'YEAR(expense_date)';
      selectPeriod = 'YEAR(expense_date) as year';
    }

    const [trends] = await query(
      `SELECT 
        ${selectPeriod},
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
       FROM expenses
       WHERE user_id = ? AND status = 'COMPLETED'
       GROUP BY ${groupBy}
       ORDER BY ${groupBy} DESC
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    res.json({
      success: true,
      data: trends.reverse(), // Show oldest to newest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top merchants
 */
const getTopMerchants = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const [merchants] = await query(
      `SELECT 
        merchant,
        COUNT(*) as transaction_count,
        SUM(amount) as total_spent,
        AVG(amount) as average_spent
       FROM expenses
       WHERE user_id = ? AND status = 'COMPLETED'
       GROUP BY merchant
       ORDER BY total_spent DESC
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    res.json({
      success: true,
      data: merchants,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getTopMerchants,
};
