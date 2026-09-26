import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Check, X, AlertTriangle, Smartphone, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import { useNavigate, useLocation } from 'react-router-dom';

const TransactionReview = () => {
  const { uncategorizedTransactions, categories, approveTransaction, removeTransaction, expenses, refreshData } = useApp();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [reviewingTransaction, setReviewingTransaction] = useState(null);
  const [formData, setFormData] = useState({});
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Refresh transactions when page loads or when navigated with refresh flag
  useEffect(() => {
    if (location.state?.refresh || location.state?.timestamp) {
      refreshData();
      // Clear the state so back button doesn't trigger refresh
      window.history.replaceState({}, document.title);
    } else {
      refreshData();
    }
  }, [location.state?.timestamp]); // Trigger when timestamp changes

  // Auto-select the first (newest) transaction when transactions list changes
  useEffect(() => {
    if (uncategorizedTransactions.length > 0) {
      // If no transaction is selected or the selected one was removed
      if (!reviewingTransaction || !uncategorizedTransactions.find(t => t.id === reviewingTransaction.id)) {
        const firstTransaction = uncategorizedTransactions[0];
        
        // Check for potential duplicates
        const potentialDuplicate = expenses.find(exp => 
          parseFloat(exp.amount) === parseFloat(firstTransaction.parsed_amount) &&
          exp.merchant.toLowerCase() === firstTransaction.parsed_merchant.toLowerCase() &&
          new Date(exp.expense_date).toDateString() === new Date(firstTransaction.parsed_date).toDateString()
        );

        setReviewingTransaction(firstTransaction);
        setFormData({
          amount: firstTransaction.parsed_amount,
          merchant: firstTransaction.parsed_merchant,
          date: firstTransaction.parsed_date ? new Date(firstTransaction.parsed_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          categoryId: categories[0]?.id || '',
        });
        setShowDuplicateWarning(!!potentialDuplicate);
      }
    } else {
      // No transactions, clear selection
      setReviewingTransaction(null);
      setFormData({});
      setShowDuplicateWarning(false);
    }
  }, [uncategorizedTransactions, expenses, categories]);

  const handleReview = (transaction) => {
    // Check for potential duplicates
    const potentialDuplicate = expenses.find(exp => 
      parseFloat(exp.amount) === parseFloat(transaction.parsed_amount) &&
      exp.merchant.toLowerCase() === transaction.parsed_merchant.toLowerCase() &&
      new Date(exp.expense_date).toDateString() === new Date(transaction.parsed_date).toDateString()
    );

    setReviewingTransaction(transaction);
    setFormData({
      amount: transaction.parsed_amount,
      merchant: transaction.parsed_merchant,
      date: transaction.parsed_date ? new Date(transaction.parsed_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      categoryId: categories[0]?.id || '',
    });

    if (potentialDuplicate) {
      setShowDuplicateWarning(true);
    } else {
      setShowDuplicateWarning(false);
    }
  };

  const handleApprove = async () => {
    if (!formData.categoryId) {
      return;
    }

    try {
      await approveTransaction(reviewingTransaction.id, formData.categoryId);
      success('Transaction approved and expense created');
      setReviewingTransaction(null);
      setFormData({});
      setShowDuplicateWarning(false);
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this transaction?')) {
      try {
        await removeTransaction(reviewingTransaction.id);
        // Don't show success toast - transaction was removed
        setReviewingTransaction(null);
        setFormData({});
        setShowDuplicateWarning(false);
      } catch (error) {
        console.error('Failed to reject transaction:', error);
      }
    }
  };

  const handleCancel = () => {
    setReviewingTransaction(null);
    setFormData({});
    setShowDuplicateWarning(false);
  };

  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));

  if (uncategorizedTransactions.length === 0 && !reviewingTransaction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Review Queue</h1>
          <p className="text-neutral-600">Review and categorize transactions</p>
        </div>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-12">
          <EmptyState
            icon={<CheckCircle size={48} strokeWidth={1.5} className="text-neutral-400" />}
            title="You're all caught up!"
            description="No transactions waiting for review. Try the simulator to capture a new transaction."
            action="Go to Simulator"
            onAction={() => navigate('/simulator')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Review Queue</h1>
        <p className="text-neutral-600">
          {uncategorizedTransactions.length} transaction{uncategorizedTransactions.length !== 1 ? 's' : ''} waiting for review
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction List */}
        <div className="space-y-4">
          {uncategorizedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                reviewingTransaction?.id === transaction.id
                  ? 'border-neutral-900 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => handleReview(transaction)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <Smartphone size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {transaction.parsed_bank || 'Bank Notification'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(transaction.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  transaction.confidence === 'HIGH'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {transaction.confidence}
                </span>
              </div>

              <div className="bg-neutral-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-neutral-600 font-mono leading-relaxed">
                  {transaction.raw_message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500">Amount:</span>
                  <span className="ml-2 font-semibold text-neutral-900">
                    ₹{parseFloat(transaction.parsed_amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Merchant:</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {transaction.parsed_merchant}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Review Panel */}
        <div className="lg:sticky lg:top-8 h-fit">
          {reviewingTransaction ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Review Transaction</h2>

              {showDuplicateWarning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle size={20} strokeWidth={2} className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900 mb-1">Possible Duplicate</p>
                      <p className="text-xs text-yellow-700">
                        A similar expense already exists with the same amount, merchant, and date.
                        Please verify before approving.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Raw Notification</h3>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-sm text-neutral-700 font-mono leading-relaxed">
                    {reviewingTransaction.raw_message}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <Input
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  step="0.01"
                />

                <Input
                  label="Merchant"
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                />

                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />

                <Select
                  label="Category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={categoryOptions}
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  size="md"
                  className="flex items-center"
                >
                  <X size={16} strokeWidth={2} className="mr-1.5" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center"
                  disabled={!formData.categoryId}
                >
                  <Check size={16} strokeWidth={2} className="mr-1.5" />
                  Approve
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <p className="text-neutral-500">Select a transaction to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionReview;
