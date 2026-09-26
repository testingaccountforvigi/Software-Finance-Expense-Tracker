import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Search, Eye } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';

const Expenses = () => {
  const { expenses, categories, paymentMethods } = useApp();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(exp => exp.categoryId === categoryFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(exp => exp.paymentMethodId === paymentFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateFilter === 'year') {
        filterDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(exp => new Date(exp.date) >= filterDate);
    }

    // Sort
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'amount-desc') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
      filtered.sort((a, b) => a.amount - b.amount);
    }

    return filtered;
  }, [expenses, searchTerm, categoryFilter, paymentFilter, dateFilter, sortBy]);

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name })),
  ];

  const paymentOptions = [
    { value: 'all', label: 'All Payment Methods' },
    ...paymentMethods.map(pm => ({ value: pm.id, label: pm.name })),
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' },
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'amount-desc', label: 'Highest Amount' },
    { value: 'amount-asc', label: 'Lowest Amount' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Expenses</h1>
          <p className="text-neutral-600">Track and manage your spending</p>
        </div>
        <Button
          onClick={() => navigate('/expenses/new')}
          className="mt-4 sm:mt-0 flex items-center"
        >
          <Plus size={18} strokeWidth={2} className="mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
          />
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={paymentOptions}
          />
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            options={dateOptions}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Showing {filteredExpenses.length} expenses</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600">Total Amount</p>
            <p className="text-xl font-semibold text-neutral-900">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200">
          <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredExpenses.map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/expenses/${expense.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: category?.color + '20' || '#f5f5f5' }}>
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: category?.color || '#6b7280' }} />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-900">{expense.merchant}</p>
                            <p className="text-xs text-neutral-500">{expense.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: category?.color + '20', color: category?.color }}
                        >
                          {expense.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {new Date(expense.date).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {paymentMethods.find(pm => pm.id === expense.paymentMethodId)?.type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/expenses/${expense.id}`);
                          }}
                          className="text-neutral-600 hover:text-neutral-900 inline-flex items-center"
                        >
                          <Eye size={16} strokeWidth={1.8} className="mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-12">
          <EmptyState
            icon={<Search size={48} strokeWidth={1.5} className="text-neutral-400" />}
            title="No expenses found"
            description="Try adjusting your filters or add your first expense."
            action="Add Expense"
            onAction={() => navigate('/expenses/new')}
          />
        </div>
      )}
    </div>
  );
};

export default Expenses;
