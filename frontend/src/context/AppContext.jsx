import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState([]);
  const [sharedExpenses, setSharedExpenses] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await api.auth.getCurrentUser();
          if (response.success) {
            setIsAuthenticated(true);
            setCurrentUser(response.data.user);
            // Load all user data
            await loadAppData();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
    };
    checkAuth();
  }, []);

  // Load all app data from backend
  const loadAppData = async () => {
    try {
      setLoading(true);
      
      // Load expenses, categories, transactions, etc. in parallel
      const [
        expensesRes,
        categoriesRes,
        paymentMethodsRes,
        transactionsRes,
        sharedExpensesRes,
        reimbursementsRes
      ] = await Promise.all([
        api.expense.getExpenses({ page: 1, limit: 1000 }).catch(() => ({ data: { expenses: [] } })),
        api.category.getCategories().catch(() => ({ data: { categories: [] } })),
        api.user.getPaymentMethods().catch(() => ({ data: { payment_methods: [] } })),
        api.transaction.getTransactions({ status: 'pending' }).catch(() => ({ data: { transactions: [] } })),
        api.sharedExpense.getSharedExpenses().catch(() => ({ data: { shared_expenses: [] } })),
        api.reimbursement.getReimbursements().catch(() => ({ data: { reimbursements: [] } }))
      ]);

      // Transform snake_case to camelCase for expenses
      const transformedExpenses = (Array.isArray(expensesRes.data) ? expensesRes.data : []).map(exp => ({
        ...exp,
        amount: parseFloat(exp.amount) || 0, // Ensure numeric
        date: exp.expense_date || exp.date,
        categoryId: exp.category_id || exp.categoryId,
        categoryName: exp.category_name || exp.categoryName,
        categoryColor: exp.category_color || exp.categoryColor,
        paymentMethodId: exp.payment_method_id || exp.paymentMethodId,
        paymentMethodName: exp.payment_method_name || exp.paymentMethodName,
        paymentMethodType: exp.payment_method_type || exp.paymentMethodType,
        receiptUrl: exp.receipt_url || exp.receiptUrl,
      }));
      
      // Transform shared expenses data
      const transformedSharedExpenses = (Array.isArray(sharedExpensesRes.data?.shared_expenses) ? sharedExpensesRes.data.shared_expenses : []).map(se => ({
        ...se,
        totalAmount: parseFloat(se.total_amount) || parseFloat(se.totalAmount) || 0,
        participants: (se.participants || []).map(p => ({
          ...p,
          userId: p.userId || p.user_id,
          share: parseFloat(p.share) || 0,
          paid: parseFloat(p.paid) || 0,
          owes: parseFloat(p.owes) || 0,
          owed: parseFloat(p.owed) || 0
        }))
      }));

      setExpenses(transformedExpenses);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setPaymentMethods(Array.isArray(paymentMethodsRes.data) ? paymentMethodsRes.data : []);
      setUncategorizedTransactions(Array.isArray(transactionsRes.data?.transactions) ? transactionsRes.data.transactions : []);
      setSharedExpenses(transformedSharedExpenses);
      setReimbursements(Array.isArray(reimbursementsRes.data?.reimbursements) ? reimbursementsRes.data.reimbursements : []);
    } catch (error) {
      console.error('Failed to load app data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AUTHENTICATION
  // ============================================

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.auth.login(email, password);
      
      if (response.success) {
        const { token, ...userData } = response.data;
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        setCurrentUser(userData);
        
        // Load user data
        await loadAppData();
        
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      const errorMsg = error.message || 'Invalid email or password';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.auth.register(userData);
      
      if (response.success) {
        const { token, ...user } = response.data;
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        // Load user data
        await loadAppData();
        
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error) {
      const errorMsg = error.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setExpenses([]);
      setCategories([]);
      setPaymentMethods([]);
      setUncategorizedTransactions([]);
      setSharedExpenses([]);
      setReimbursements([]);
      localStorage.removeItem('authToken');
    }
  };

  // ============================================
  // EXPENSE OPERATIONS
  // ============================================

  const addExpense = async (expenseData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.expense.createExpense(expenseData);
      
      if (response.success) {
        // Reload expenses with transformation
        const expensesRes = await api.expense.getExpenses({ page: 1, limit: 1000 });
        const transformedExpenses = (Array.isArray(expensesRes.data) ? expensesRes.data : []).map(exp => ({
          id: exp.id,
          amount: parseFloat(exp.amount) || 0,
          currency: exp.currency,
          merchant: exp.merchant,
          description: exp.description,
          date: exp.expense_date,
          categoryId: exp.category_id,
          categoryName: exp.category_name,
          categoryColor: exp.category_color,
          paymentMethodId: exp.payment_method_id,
          paymentMethodName: exp.payment_method_name,
          source: exp.source,
          status: exp.status,
          notes: exp.notes,
          receiptUrl: exp.receipt_url || exp.receiptUrl,
        }));
        setExpenses(transformedExpenses);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to add expense');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id, updates) => {
    try {
      setLoading(true);
      const response = await api.expense.updateExpense(id, updates);
      
      if (response.success) {
        // Update local state
        setExpenses(expenses.map(exp => exp.id === id ? { ...exp, ...updates } : exp));
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      setLoading(true);
      const response = await api.expense.deleteExpense(id);
      
      if (response.success) {
        // Remove from local state
        setExpenses(expenses.filter(exp => exp.id !== id));
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  const addCategory = async (categoryData) => {
    try {
      setLoading(true);
      const response = await api.category.createCategory(categoryData);
      
      if (response.success) {
        // Reload categories
        const categoriesRes = await api.category.getCategories();
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to add category');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      setLoading(true);
      const response = await api.category.updateCategory(id, updates);
      
      if (response.success) {
        // Update local state
        setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      const response = await api.category.deleteCategory(id);
      
      if (response.success) {
        // Reload categories (backend marks as inactive)
        const categoriesRes = await api.category.getCategories();
        setCategories(categoriesRes.data?.categories || []);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reorderCategories = async (newOrder) => {
    try {
      setLoading(true);
      const categoryOrders = newOrder.map((cat, index) => ({
        id: cat.id,
        display_order: index + 1
      }));
      
      const response = await api.category.reorderCategories(categoryOrders);
      
      if (response.success) {
        setCategories(newOrder);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TRANSACTION OPERATIONS
  // ============================================

  const addUncategorizedTransaction = async (count = 5, transactionData = null) => {
    try {
      setLoading(true);
      const response = await api.transaction.simulateTransactions(count, transactionData);
      
      if (response.success) {
        // Reload transactions
        const transactionsRes = await api.transaction.getTransactions({ status: 'pending' });
        setUncategorizedTransactions(transactionsRes.data?.transactions || []);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveTransaction = async (transactionId, categoryId, notes = '') => {
    try {
      setLoading(true);
      const response = await api.transaction.approveTransaction(transactionId, categoryId, notes);
      
      if (response.success) {
        // Reload both transactions and expenses with proper transformation
        const [transactionsRes, expensesRes] = await Promise.all([
          api.transaction.getTransactions({ status: 'pending' }),
          api.expense.getExpenses({ page: 1, limit: 1000 })
        ]);
        
        setUncategorizedTransactions(Array.isArray(transactionsRes.data?.transactions) ? transactionsRes.data.transactions : []);
        
        // Transform expenses data properly (same as loadAppData)
        const transformedExpenses = (Array.isArray(expensesRes.data) ? expensesRes.data : []).map(exp => ({
          ...exp,
          amount: parseFloat(exp.amount) || 0,
          date: exp.expense_date || exp.date,
          categoryId: exp.category_id || exp.categoryId,
          categoryName: exp.category_name || exp.categoryName,
          categoryColor: exp.category_color || exp.categoryColor,
          paymentMethodId: exp.payment_method_id || exp.paymentMethodId,
          paymentMethodName: exp.payment_method_name || exp.paymentMethodName,
          paymentMethodType: exp.payment_method_type || exp.paymentMethodType,
          receiptUrl: exp.receipt_url || exp.receiptUrl,
        }));
        
        setExpenses(transformedExpenses);
        
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to approve transaction');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeTransaction = async (transactionId, reason = '') => {
    try {
      setLoading(true);
      const response = await api.transaction.rejectTransaction(transactionId, reason);
      
      if (response.success) {
        // Remove from local state
        setUncategorizedTransactions(
          uncategorizedTransactions.filter(t => t.id !== transactionId)
        );
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SHARED EXPENSE OPERATIONS
  // ============================================

  const addSharedExpense = async (sharedExpenseData) => {
    try {
      setLoading(true);
      const response = await api.sharedExpense.createSharedExpense(sharedExpenseData);
      
      if (response.success) {
        // Reload shared expenses
        const sharedExpensesRes = await api.sharedExpense.getSharedExpenses();
        setSharedExpenses(sharedExpensesRes.data?.shared_expenses || []);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create shared expense');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSharedExpense = async (id, updates) => {
    try {
      setLoading(true);
      // Note: Backend doesn't have a generic update endpoint
      // This is handled through specific actions like settleParticipant
      setSharedExpenses(sharedExpenses.map(se => se.id === id ? { ...se, ...updates } : se));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REIMBURSEMENT OPERATIONS
  // ============================================

  const addReimbursement = async (reimbursementData) => {
    try {
      setLoading(true);
      const response = await api.reimbursement.createReimbursement(reimbursementData);
      
      if (response.success) {
        // Reload reimbursements
        const reimbursementsRes = await api.reimbursement.getReimbursements();
        setReimbursements(reimbursementsRes.data?.reimbursements || []);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create reimbursement');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateReimbursement = async (id, updates) => {
    try {
      setLoading(true);
      const response = await api.reimbursement.updateReimbursement(id, updates);
      
      if (response.success) {
        // Update local state
        setReimbursements(reimbursements.map(r => r.id === id ? { ...r, ...updates } : r));
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // USER PROFILE
  // ============================================

  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      const response = await api.user.updateProfile(updates);
      
      if (response.success) {
        // Fetch updated user data from backend
        const userResponse = await api.auth.getCurrentUser();
        if (userResponse.success) {
          setCurrentUser(userResponse.data.user);
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    isAuthenticated,
    currentUser,
    expenses,
    categories: categories.filter(c => c.active !== false),
    allCategories: categories,
    paymentMethods,
    uncategorizedTransactions,
    sharedExpenses,
    reimbursements,
    loading,
    error,
    
    // Authentication methods
    login,
    register,
    logout,
    
    // Expense methods
    addExpense,
    updateExpense,
    deleteExpense,
    
    // Category methods
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    
    // Transaction methods
    addUncategorizedTransaction,
    approveTransaction,
    removeTransaction,
    
    // Shared expense methods
    addSharedExpense,
    updateSharedExpense,
    
    // Reimbursement methods
    addReimbursement,
    updateReimbursement,
    
    // User profile methods
    updateUserProfile,
    
    // Utility methods
    refreshData: loadAppData,
    clearError: () => setError(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
