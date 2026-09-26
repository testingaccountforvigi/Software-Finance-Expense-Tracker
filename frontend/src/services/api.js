// API Service - Handles all backend API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response);
};

// ============================================
// AUTHENTICATION APIs
// ============================================

export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// ============================================
// USER APIs
// ============================================

export const userAPI = {
  updateProfile: async (updates) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getPaymentMethods: async () => {
    return apiRequest('/users/payment-methods');
  },
};

// ============================================
// EXPENSE APIs
// ============================================

export const expenseAPI = {
  getExpenses: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/expenses${params ? `?${params}` : ''}`);
  },

  getExpenseById: async (id) => {
    return apiRequest(`/expenses/${id}`);
  },

  createExpense: async (expenseData) => {
    return apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  updateExpense: async (id, updates) => {
    return apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteExpense: async (id) => {
    return apiRequest(`/expenses/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// CATEGORY APIs
// ============================================

export const categoryAPI = {
  getCategories: async () => {
    return apiRequest('/categories');
  },

  createCategory: async (categoryData) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id, updates) => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteCategory: async (id) => {
    return apiRequest(`/categories/${id}`, { method: 'DELETE' });
  },

  reorderCategories: async (categoryOrders) => {
    return apiRequest('/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ category_orders: categoryOrders }),
    });
  },
};

// ============================================
// DASHBOARD APIs
// ============================================

export const dashboardAPI = {
  getSummary: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/dashboard/summary${queryParams ? `?${queryParams}` : ''}`);
  },

  getCategoryBreakdown: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/dashboard/category-breakdown${queryParams ? `?${queryParams}` : ''}`);
  },

  getTrends: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/dashboard/trends${queryParams ? `?${queryParams}` : ''}`);
  },

  getTopMerchants: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/dashboard/top-merchants${queryParams ? `?${queryParams}` : ''}`);
  },
};

// ============================================
// TRANSACTION APIs
// ============================================

export const transactionAPI = {
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/transactions${params ? `?${params}` : ''}`);
  },

  simulateTransactions: async (count = 5, transactionData = null) => {
    const body = transactionData ? { transactionData } : { count };
    return apiRequest('/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  parseReceipt: async (receiptText) => {
    return apiRequest('/transactions/parse', {
      method: 'POST',
      body: JSON.stringify({ receipt_text: receiptText }),
    });
  },

  approveTransaction: async (id, categoryId, notes) => {
    return apiRequest(`/transactions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId, notes }),
    });
  },

  rejectTransaction: async (id, reason) => {
    return apiRequest(`/transactions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  checkDuplicates: async (id) => {
    return apiRequest(`/transactions/${id}/duplicates`);
  },
};

// ============================================
// SHARED EXPENSE APIs
// ============================================

export const sharedExpenseAPI = {
  getSharedExpenses: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/shared-expenses${params ? `?${params}` : ''}`);
  },

  getSharedExpenseById: async (id) => {
    return apiRequest(`/shared-expenses/${id}`);
  },

  createSharedExpense: async (data) => {
    return apiRequest('/shared-expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  settleParticipant: async (sharedExpenseId, participantId, amountPaid) => {
    return apiRequest(`/shared-expenses/${sharedExpenseId}/participants/${participantId}/settle`, {
      method: 'PATCH',
      body: JSON.stringify({ amount_paid: amountPaid }),
    });
  },

  sendReminder: async (id) => {
    return apiRequest(`/shared-expenses/${id}/remind`, { method: 'POST' });
  },

  deleteSharedExpense: async (id) => {
    return apiRequest(`/shared-expenses/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// REIMBURSEMENT APIs
// ============================================

export const reimbursementAPI = {
  getReimbursements: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/reimbursements${params ? `?${params}` : ''}`);
  },

  getReimbursementById: async (id) => {
    return apiRequest(`/reimbursements/${id}`);
  },

  createReimbursement: async (data) => {
    return apiRequest('/reimbursements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReimbursement: async (id, updates) => {
    return apiRequest(`/reimbursements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  submitReimbursement: async (id, recipientEmail, customEmailBody) => {
    return apiRequest(`/reimbursements/${id}/submit`, { 
      method: 'POST',
      body: JSON.stringify({ recipientEmail, customEmailBody })
    });
  },

  approveReimbursement: async (id, reviewerNotes) => {
    return apiRequest(`/reimbursements/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewer_notes: reviewerNotes }),
    });
  },

  rejectReimbursement: async (id, rejectionReason) => {
    return apiRequest(`/reimbursements/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
  },

  markAsPaid: async (id) => {
    return apiRequest(`/reimbursements/${id}/mark-paid`, { method: 'POST' });
  },

  addDocument: async (id, documentData) => {
    return apiRequest(`/reimbursements/${id}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  },

  removeDocument: async (id, documentId) => {
    return apiRequest(`/reimbursements/${id}/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  deleteReimbursement: async (id) => {
    return apiRequest(`/reimbursements/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// REPORT APIs
// ============================================

export const reportAPI = {
  getReports: async () => {
    return apiRequest('/reports');
  },

  generateReport: async (reportData) => {
    return apiRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  exportPDF: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports/${id}/export/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }
    
    return response.blob();
  },

  exportCSV: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports/${id}/export/csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }
    
    return response.blob();
  },

  exportExcel: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports/${id}/export/excel`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export Excel');
    }
    
    return response.blob();
  },

  exportTransactions: async (format, startDate, endDate) => {
    const token = getAuthToken();
    const params = new URLSearchParams({ format, start_date: startDate, end_date: endDate });
    const response = await fetch(`${API_BASE_URL}/reports/export/transactions?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }
    
    return response.blob();
  },

  deleteReport: async (id) => {
    return apiRequest(`/reports/${id}`, { method: 'DELETE' });
  },
};

// Helper function to download blob as file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default {
  auth: authAPI,
  user: userAPI,
  expense: expenseAPI,
  category: categoryAPI,
  dashboard: dashboardAPI,
  transaction: transactionAPI,
  sharedExpense: sharedExpenseAPI,
  reimbursement: reimbursementAPI,
  report: reportAPI,
  downloadFile,
};
