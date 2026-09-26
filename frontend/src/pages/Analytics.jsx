import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Analytics = () => {
  const { expenses, categories } = useApp();
  const [dateRange, setDateRange] = useState('year'); // month, quarter, year

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (dateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'quarter') {
      startDate.setMonth(now.getMonth() - 3);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    return expenses.filter(exp => new Date(exp.date) >= startDate);
  }, [expenses, dateRange]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const monthMap = {};
    filteredExpenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthMap[month] = (monthMap[month] || 0) + exp.amount;
    });

    return Object.entries(monthMap)
      .map(([month, amount]) => ({ month, amount }))
      .slice(-12);
  }, [filteredExpenses]);

  // Category distribution
  const categoryData = useMemo(() => {
    return categories.map(cat => {
      const total = filteredExpenses
        .filter(exp => exp.categoryId === cat.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return { name: cat.name, value: total, color: cat.color };
    }).filter(cat => cat.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categories]);

  // Top merchants
  const topMerchants = useMemo(() => {
    const merchantMap = {};
    filteredExpenses.forEach(exp => {
      merchantMap[exp.merchant] = (merchantMap[exp.merchant] || 0) + exp.amount;
    });

    return Object.entries(merchantMap)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredExpenses]);

  // Payment method breakdown
  const paymentMethodData = useMemo(() => {
    const methodMap = {};
    filteredExpenses.forEach(exp => {
      const paymentName = exp.payment_method_name || exp.paymentMethodName || 'Other';
      const method = paymentName.includes('UPI') ? 'UPI' : 
                    paymentName.includes('Credit') ? 'Credit Card' :
                    paymentName.includes('Debit') ? 'Debit Card' : 'Other';
      methodMap[method] = (methodMap[method] || 0) + exp.amount;
    });

    return Object.entries(methodMap).map(([method, amount]) => ({ method, amount }));
  }, [filteredExpenses]);

  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgTransaction = totalSpent / (filteredExpenses.length || 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Analytics</h1>
          <p className="text-neutral-600">Understand your spending patterns</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Total Spent</p>
          <p className="text-3xl font-semibold text-neutral-900">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Transactions</p>
          <p className="text-3xl font-semibold text-neutral-900">{filteredExpenses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Average Transaction</p>
          <p className="text-3xl font-semibold text-neutral-900">₹{Math.round(avgTransaction).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Spending Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
            <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Line type="monotone" dataKey="amount" stroke="#171717" strokeWidth={2} dot={{ fill: '#171717', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Category Distribution</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${((entry.value / totalSpent) * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#a3a3a3' }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-neutral-500">
              No data available
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Methods</h2>
          {paymentMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="method" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Bar dataKey="amount" fill="#171717" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-neutral-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Top Merchants */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Top Merchants</h2>
        <div className="space-y-3">
          {topMerchants.map((merchant, index) => (
            <div key={merchant.merchant} className="flex items-center justify-between py-2">
              <div className="flex items-center flex-1">
                <span className="w-6 text-sm text-neutral-500">{index + 1}</span>
                <p className="text-sm font-medium text-neutral-900 ml-4">{merchant.merchant}</p>
              </div>
              <div className="flex items-center">
                <div className="w-48 bg-neutral-100 rounded-full h-2 mr-4">
                  <div
                    className="bg-neutral-900 h-2 rounded-full"
                    style={{ width: `${(merchant.amount / topMerchants[0].amount) * 100}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-neutral-900 w-28 text-right">
                  ₹{merchant.amount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
