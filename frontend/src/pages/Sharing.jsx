import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Plus, Users as UsersIcon, User, Check, DollarSign, Calculator } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

const Sharing = () => {
  const { expenses, currentUser, refreshData } = useApp();
  const { success, error: showError } = useToast();
  
  const [sharedExpenses, setSharedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    expenseId: '',
    title: '',
    participants: [{ name: currentUser?.full_name || 'You', share: '' }],
  });

  // Fetch shared expenses from database
  useEffect(() => {
    loadSharedExpenses();
  }, []);

  const loadSharedExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.sharedExpense.getSharedExpenses();
      if (response.success) {
        setSharedExpenses(response.data.shared_expenses || []);
      }
    } catch (err) {
      console.error('Failed to load shared expenses:', err);
      showError('Failed to load shared expenses');
    } finally {
      setLoading(false);
    }
  };

  const recentExpenses = expenses.slice(0, 20);
  const expenseOptions = recentExpenses.map(exp => ({
    value: exp.id,
    label: `${exp.merchant} - ₹${parseFloat(exp.amount).toLocaleString('en-IN')} (${new Date(exp.date).toLocaleDateString('en-IN')})`,
  }));

  const handleAddParticipant = () => {
    setFormData({
      ...formData,
      participants: [...formData.participants, { name: '', share: '' }],
    });
  };

  const handleRemoveParticipant = (index) => {
    if (index === 0) return; // Can't remove yourself
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index),
    });
  };

  const handleEqualSplit = () => {
    if (!formData.expenseId) return;
    
    const expense = expenses.find(e => e.id === formData.expenseId);
    if (!expense) return;

    const totalAmount = parseFloat(expense.amount);
    const participantCount = formData.participants.length;
    const sharePerPerson = (totalAmount / participantCount).toFixed(2);

    // Update all participants with equal share
    const updatedParticipants = formData.participants.map(p => ({
      ...p,
      share: sharePerPerson
    }));

    setFormData({ ...formData, participants: updatedParticipants });
    success(`Split equally: ₹${sharePerPerson} per person`);
  };

  const handleSubmit = async () => {
    if (!formData.expenseId || formData.participants.some(p => !p.name || !p.share)) {
      showError('Please fill all participant names and share amounts');
      return;
    }

    const expense = expenses.find(e => e.id === formData.expenseId);
    
    try {
      setLoading(true);
      
      const response = await api.sharedExpense.createSharedExpense({
        expense_id: formData.expenseId,
        title: formData.title || `Split: ${expense.merchant}`,
        split_method: 'MANUAL',
        participants: formData.participants.map((p, index) => ({
          participant_name: p.name, // Keep name as-is
          email: `${p.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          share_amount: parseFloat(p.share),
          is_creator: index === 0 // Mark first participant (creator) as true
        }))
      });

      if (response.success) {
        success('Shared expense created successfully');
        setShowAddModal(false);
        setFormData({
          expenseId: '',
          title: '',
          participants: [{ name: currentUser?.full_name || 'You', share: '' }],
        });
        loadSharedExpenses();
        refreshData();
      }
    } catch (err) {
      console.error('Failed to create shared expense:', err);
      showError('Failed to create shared expense');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (sharedExpenseId, participantId) => {
    try {
      const response = await api.sharedExpense.settleParticipant(sharedExpenseId, participantId);
      if (response.success) {
        success('Payment recorded');
        loadSharedExpenses();
      }
    } catch (err) {
      console.error('Failed to mark as paid:', err);
      showError('Failed to record payment');
    }
  };

  if (loading && sharedExpenses.length === 0) {
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
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Shared Expenses</h1>
          <p className="text-neutral-600">Split expenses with friends and track settlements</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center">
          <Plus size={18} strokeWidth={2} className="mr-2" />
          Create Shared Expense
        </Button>
      </div>

      {sharedExpenses.length > 0 ? (
        <div className="space-y-4">
          {sharedExpenses.map(shared => {
            const userParticipant = shared.participants?.find(p => p.user_id === currentUser?.id);
            const totalAmount = parseFloat(shared.total_amount);

            return (
              <div key={shared.id} className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{shared.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      {shared.merchant} • {new Date(shared.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-neutral-900">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      shared.status === 'FULLY_SETTLED' ? 'bg-green-100 text-green-700' :
                      shared.status === 'PARTIALLY_SETTLED' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {shared.status === 'FULLY_SETTLED' ? 'Settled' :
                       shared.status === 'PARTIALLY_SETTLED' ? 'Partially Settled' :
                       'Open'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-neutral-700">
                      Participants ({shared.participants?.length || 0})
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Split: ₹{(totalAmount / (shared.participants?.length || 1)).toFixed(2)} each
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {shared.participants?.map((participant, index) => {
                      const isCurrentUser = participant.user_id === currentUser?.id;
                      const shareAmount = parseFloat(participant.share);
                      const paidAmount = parseFloat(participant.paid);
                      const owesAmount = parseFloat(participant.owes);
                      const owedAmount = parseFloat(participant.owed);
                      const isSettled = participant.settlement_status === 'SETTLED';

                      return (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 mr-3">
                              <User size={18} strokeWidth={1.8} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {participant.name} {isCurrentUser && '(You)'}
                              </p>
                              <div className="flex items-center space-x-3 mt-0.5">
                                <p className="text-xs text-neutral-500">
                                  Share: ₹{shareAmount.toLocaleString('en-IN')}
                                </p>
                                {paidAmount > 0 && (
                                  <p className="text-xs text-green-600 font-medium">
                                    Paid: ₹{paidAmount.toLocaleString('en-IN')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isSettled ? (
                              <div className="flex items-center text-green-600">
                                <Check size={16} strokeWidth={2} className="mr-1" />
                                <span className="text-sm font-medium">Settled</span>
                              </div>
                            ) : (
                              <>
                                {owedAmount > 0 && (
                                  <p className="text-sm font-medium text-green-600">
                                    Owed ₹{owedAmount.toLocaleString('en-IN')}
                                  </p>
                                )}
                                {owesAmount > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-red-600">
                                      Owes ₹{owesAmount.toLocaleString('en-IN')}
                                    </p>
                                    {!isCurrentUser && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleMarkPaid(shared.id, participant.id)}
                                        className="text-xs px-3 py-1"
                                      >
                                        Mark Paid
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-12">
          <EmptyState
            icon={<UsersIcon size={48} strokeWidth={1.5} className="text-neutral-400" />}
            title="No shared expenses yet"
            description="Create a shared expense to split costs with friends"
            action="Create Shared Expense"
            onAction={() => setShowAddModal(true)}
          />
        </div>
      )}

      {/* Add Shared Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Shared Expense"
        size="lg"
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
            <>
              <Input
                label="Title (Optional)"
                placeholder="E.g., Team dinner, Weekend trip"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-700">Total Amount</p>
                  <p className="text-2xl font-semibold text-neutral-900">
                    ₹{parseFloat(expenses.find(e => e.id === formData.expenseId)?.amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                {formData.participants.length > 0 && (
                  <p className="text-xs text-neutral-600">
                    Split among {formData.participants.length} people = ₹
                    {(parseFloat(expenses.find(e => e.id === formData.expenseId)?.amount || 0) / formData.participants.length).toFixed(2)} per person
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-700">Participants</label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleEqualSplit}
                    className="flex items-center"
                  >
                    <Calculator size={14} strokeWidth={2} className="mr-1" />
                    Equal Split
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.participants.map((participant, index) => (
                    <div key={index} className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Input
                          placeholder={index === 0 ? 'Your name' : 'Participant name'}
                          value={participant.name}
                          onChange={(e) => {
                            const updated = [...formData.participants];
                            updated[index].name = e.target.value;
                            setFormData({ ...formData, participants: updated });
                          }}
                          disabled={index === 0}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="Amount"
                          type="number"
                          step="0.01"
                          value={participant.share}
                          onChange={(e) => {
                            const updated = [...formData.participants];
                            updated[index].share = e.target.value;
                            setFormData({ ...formData, participants: updated });
                          }}
                        />
                      </div>
                      {index > 0 && (
                        <Button
                          variant="danger"
                          size="md"
                          onClick={() => handleRemoveParticipant(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddParticipant}
                  className="mt-3 w-full"
                >
                  Add Participant
                </Button>
              </div>
            </>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.expenseId || formData.participants.length < 2 || loading}
            >
              {loading ? 'Creating...' : 'Create Shared Expense'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sharing;
