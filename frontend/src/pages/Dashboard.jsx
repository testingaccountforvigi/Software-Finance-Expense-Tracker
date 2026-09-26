import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plus, Bell } from 'lucide-react';
import Button from '../components/Button';

const Dashboard = () => {
  const { expenses, categories, currentUser, uncategorizedTransactions } = useApp();
  const navigate = useNavigate();

  // Calculate current month spending
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expenseCount = currentMonthExpenses.length;

  // Category breakdown
  const categoryData = categories.map(cat => {
    const catExpenses = currentMonthExpenses.filter(exp => exp.categoryId === cat.id);
    const total = catExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: cat.name,
      value: total,
      color: cat.color,
    };
  }).filter(cat => cat.value > 0);

  // Last 7 days trend
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      expDate.setHours(0, 0, 0, 0);
      return expDate.getTime() === date.getTime();
    });
    
    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    last7Days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: total,
    });
  }

  // Recent expenses
  const recentExpenses = expenses.slice(0, 5);

  // Greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
          {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-neutral-600">Here's your financial overview</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Total Spent This Month</p>
          <p className="text-3xl font-semibold text-neutral-900">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-neutral-500 mt-2">{expenseCount} transactions</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Categories Used</p>
          <p className="text-3xl font-semibold text-neutral-900">{categoryData.length}</p>
          <p className="text-sm text-neutral-500 mt-2">out of {categories.length} total</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Pending Review</p>
          <p className="text-3xl font-semibold text-neutral-900">{uncategorizedTransactions.length}</p>
          <button
            onClick={() => navigate('/transactions/review')}
            className="text-sm text-neutral-700 hover:text-neutral-900 mt-2"
          >
            Review now →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending Trend */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">7-Day Spending</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
              <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Line type="monotone" dataKey="amount" stroke="#171717" strokeWidth={2} dot={{ fill: '#171717' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Category Breakdown</h2>
          {categoryData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                      <span className="text-neutral-700">{cat.name}</span>
                    </div>
                    <span className="font-medium text-neutral-900">₹{cat.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-neutral-500">
              No expenses this month
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Expenses</h2>
            <button
              onClick={() => navigate('/expenses')}
              className="text-sm text-neutral-700 hover:text-neutral-900"
            >
              View all →
            </button>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: categories.find(c => c.id === expense.categoryId)?.color + '20' || '#f5f5f5' }}>
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: categories.find(c => c.id === expense.categoryId)?.color || '#6b7280' }} />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{expense.merchant}</p>
                      <p className="text-xs text-neutral-500">{expense.categoryName} • {new Date(expense.date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 ml-4">₹{expense.amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No recent expenses
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full flex items-center justify-center"
              onClick={() => navigate('/expenses/new')}
            >
              <Plus size={18} strokeWidth={2} className="mr-2" />
              Add Expense
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/simulator')}
            >
              Try Simulator
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/categories')}
            >
              Manage Categories
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
