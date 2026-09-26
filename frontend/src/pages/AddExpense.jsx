import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const AddExpense = () => {
  const navigate = useNavigate();
  const { addExpense, categories, paymentMethods } = useApp();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    description: '',
    categoryId: categories[0]?.id || '',
    paymentMethodId: paymentMethods[0]?.id || '',
    source: 'MANUAL',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.merchant) {
      newErrors.merchant = 'Merchant/Payee is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Payment method is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const category = categories.find(c => c.id === formData.categoryId);
      const paymentMethod = paymentMethods.find(pm => pm.id === formData.paymentMethodId);

      const expenseData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        merchant: formData.merchant,
        description: formData.description,
        categoryId: formData.categoryId,
        paymentMethodId: formData.paymentMethodId,
        expenseDate: formData.date,
        source: formData.source,
        status: 'COMPLETED',
        notes: formData.description
      };

      await addExpense(expenseData);
      success('Expense added successfully');
      navigate('/expenses');
    } catch (error) {
      console.error('Failed to add expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  const paymentOptions = paymentMethods.map(pm => ({
    value: pm.id,
    label: pm.name,
  }));

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
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Add Expense</h1>
        <p className="text-neutral-600">Record a new expense manually</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              error={errors.amount}
              placeholder="0.00"
              step="0.01"
              required
            />

            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              required
            />
          </div>

          <Input
            label="Merchant / Payee"
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            error={errors.merchant}
            placeholder="e.g., Swiggy, Uber, Amazon"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              error={errors.categoryId}
              options={categoryOptions}
              required
            />

            <Select
              label="Payment Method"
              name="paymentMethodId"
              value={formData.paymentMethodId}
              onChange={handleChange}
              error={errors.paymentMethodId}
              options={paymentOptions}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/expenses')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
