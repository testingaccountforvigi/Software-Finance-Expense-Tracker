import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Plus, FileText } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

const Reimbursements = () => {
  const { expenses, currentUser, refreshData } = useApp();
  const { success, error: showError } = useToast();
  
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    expenseId: '',
    description: '',
  });

  // Fetch reimbursements from database
  useEffect(() => {
    loadReimbursements();
  }, []);

  const loadReimbursements = async () => {
    try {
      setLoading(true);
      const response = await api.reimbursement.getReimbursements();
      if (response.success) {
        setReimbursements(response.data.reimbursements || []);
      }
    } catch (err) {
      console.error('Failed to load reimbursements:', err);
      showError('Failed to load reimbursements');
    } finally {
      setLoading(false);
    }
  };

  const recentExpenses = expenses.slice(0, 20);
  const expenseOptions = recentExpenses.map(exp => ({
    value: exp.id,
    label: `${exp.merchant} - ₹${parseFloat(exp.amount).toLocaleString('en-IN')} (${new Date(exp.date).toLocaleDateString('en-IN')})`,
  }));

  const statusColors = {
    DRAFT: 'bg-neutral-100 text-neutral-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PAID: 'bg-green-100 text-green-700',
  };

  const handleSubmit = async () => {
    if (!formData.expenseId || !formData.description) {
      showError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const expense = expenses.find(e => e.id === formData.expenseId);
      
      const response = await api.reimbursement.createReimbursement({
        expense_id: formData.expenseId,
        amount: expense.amount,
        description: formData.description,
      });

      if (response.success) {
        success('Reimbursement created');
        setShowAddModal(false);
        setFormData({ expenseId: '', description: '' });
        loadReimbursements();
        refreshData();
      }
    } catch (err) {
      console.error('Failed to create reimbursement:', err);
      showError(err.message || 'Failed to create reimbursement');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this reimbursement as paid?')) return;

    try {
      setLoading(true);
      const response = await api.reimbursement.markAsPaid(id);
      
      if (response.success) {
        success('Reimbursement marked as paid');
        loadReimbursements();
      }
    } catch (err) {
      console.error('Failed to mark as paid:', err);
      showError(err.message || 'Failed to mark as paid');
    } finally {
      setLoading(false);
    }
  };

  if (loading && reimbursements.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-16 h-16 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Reimbursements</h1>
          <p className="text-neutral-600">Submit and track expense reimbursements</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center">
          <Plus size={18} strokeWidth={2} className="mr-2" />
          New Reimbursement
        </Button>
      </div>

      {reimbursements.length > 0 ? (
        <div className="space-y-4">
          {reimbursements.map(reimb => (
            <div key={reimb.id} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900 mr-3">{reimb.merchant}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[reimb.status]}`}>
                      {reimb.status.replace('_', ' ')}
                    </span>
                    {reimb.payment_status === 'PAID' && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        PAID
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{reimb.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Amount</p>
                      <p className="font-semibold text-neutral-900">₹{parseFloat(reimb.amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Expense Date</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(reimb.expense_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    {reimb.submitted_at && (
                      <div>
                        <p className="text-neutral-500">Submitted</p>
                        <p className="font-medium text-neutral-900">
                          {new Date(reimb.submitted_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-neutral-200">
                {(reimb.status === 'DRAFT' || reimb.status === 'SUBMITTED' || reimb.status === 'APPROVED') && reimb.payment_status !== 'PAID' && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkPaid(reimb.id)}
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-12">
          <EmptyState
            icon={<FileText size={48} strokeWidth={1.5} className="text-neutral-400" />}
            title="No reimbursements yet"
            description="Submit eligible expenses for reimbursement"
            action="New Reimbursement"
            onAction={() => setShowAddModal(true)}
          />
        </div>
      )}

      {/* Add Reimbursement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Reimbursement"
      >
        <div className="space-y-4">
          <Select
            label="Select Expense"
            value={formData.expenseId}
            onChange={(e) => setFormData({ ...formData, expenseId: e.target.value })}
            options={[{ value: '', label: 'Choose an expense...' }, ...expenseOptions]}
            required
          />

          {formData.expenseId && (
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-sm text-neutral-600 mb-1">Amount to Claim</p>
              <p className="text-xl font-semibold text-neutral-900">
                ₹{parseFloat(expenses.find(e => e.id === formData.expenseId)?.amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Description / Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain why this expense should be reimbursed..."
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.expenseId || !formData.description || loading}>
              {loading ? 'Creating...' : 'Create Reimbursement'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reimbursements;
