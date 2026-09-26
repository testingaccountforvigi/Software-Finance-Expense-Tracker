import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenses, categories, paymentMethods, updateExpense, deleteExpense } = useApp();
  const { success, error: showError } = useToast();

  const expense = expenses.find(exp => exp.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState(expense || {});
  const [errors, setErrors] = useState({});

  if (!expense) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-600 mb-4">Expense not found</p>
          <Button onClick={() => navigate('/expenses')}>Back to Expenses</Button>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === expense.categoryId);
  const paymentMethod = paymentMethods.find(pm => pm.id === expense.paymentMethodId);

  const handleEdit = () => {
    // Format date for input field (YYYY-MM-DD)
    let formattedDate = expense.date;
    if (expense.date) {
      const dateObj = new Date(expense.date);
      formattedDate = dateObj.toISOString().split('T')[0];
    }
    
    setFormData({
      ...expense,
      date: formattedDate
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrors({ amount: 'Amount must be greater than 0' });
      return;
    }

    try {
      await updateExpense(id, {
        amount: parseFloat(formData.amount),
        merchant: formData.merchant,
        description: formData.description || '',
        categoryId: formData.categoryId,
        paymentMethodId: formData.paymentMethodId,
        expenseDate: formData.date,
        currency: formData.currency || 'INR',
        status: formData.status || 'COMPLETED'
      });

      success('Expense updated successfully');
      setIsEditing(false);
    } catch (error) {
      showError('Failed to update expense');
      console.error('Update error:', error);
    }
  };

  const handleDelete = () => {
    deleteExpense(id);
    success('Expense deleted successfully');
    navigate('/expenses');
  };

  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
  const paymentOptions = paymentMethods.map(pm => ({ value: pm.id, label: pm.name }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/expenses')}
          className="text-sm text-neutral-600 hover:text-neutral-900 mb-4 inline-flex items-center"
        >
          <ArrowLeft size={16} strokeWidth={1.8} className="mr-1" />
          Back to Expenses
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Expense Details</h1>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {!isEditing ? (
          <>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: category?.color + '20' || '#f5f5f5' }}>
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: category?.color || '#6b7280' }} />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-semibold text-neutral-900">{expense.merchant}</h2>
                  <p className="text-neutral-600">{expense.description || 'No description'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-neutral-900">₹{expense.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Category</p>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: category?.color + '20', color: category?.color }}
                >
                  {category?.icon} {expense.categoryName}
                </span>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Payment Method</p>
                <p className="text-sm font-medium text-neutral-900">{paymentMethod?.name || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Date</p>
                <p className="text-sm font-medium text-neutral-900">
                  {new Date(expense.date).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Source</p>
                <p className="text-sm font-medium text-neutral-900">
                  {expense.source === 'MANUAL' ? 'Manual Entry' : 'Auto Captured'}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Status</p>
                <p className="text-sm font-medium text-green-600">{expense.status || 'Completed'}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-1">Created</p>
                <p className="text-sm font-medium text-neutral-900">
                  {new Date(expense.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200">
              <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="flex items-center">
                <Trash2 size={16} strokeWidth={1.8} className="mr-2" />
                Delete
              </Button>
              <Button onClick={handleEdit} className="flex items-center">
                <Edit2 size={16} strokeWidth={1.8} className="mr-2" />
                Edit
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={errors.amount}
                step="0.01"
                required
              />
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <Input
              label="Merchant"
              type="text"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                options={categoryOptions}
                required
              />
              <Select
                label="Payment Method"
                value={formData.paymentMethodId}
                onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
                options={paymentOptions}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Expense"
      >
        <p className="text-neutral-600 mb-6">
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end space-x-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseDetail;
