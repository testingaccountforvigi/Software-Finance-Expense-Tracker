// Notification templates for simulator (UI templates only - not real data)
export const notificationTemplates = [
  {
    id: 'template_1',
    bank: 'HDFC Bank',
    category: 'UPI',
    template: 'Rs. 250 debited from a/c ****1234 on 22-Sep-24 for UPI payment to SWIGGY. Avl Bal: Rs. 45,230'
  },
  {
    id: 'template_2',
    bank: 'ICICI Bank',
    category: 'Card',
    template: 'Rs. 1,500 spent on ICICI Credit Card ****5678 at AMAZON on 22-09-2024. Outstanding: Rs. 12,340'
  },
  {
    id: 'template_3',
    bank: 'Axis Bank',
    category: 'UPI',
    template: 'INR 85.00 debited from Axis Bank a/c ****4821 for UPI-UBER transaction on 22-Sep-24. Balance: Rs. 28,450'
  },
  {
    id: 'template_4',
    bank: 'SBI',
    category: 'Debit',
    template: 'Dear Customer, Rs. 3,200 has been debited from your SBI a/c ****9012 on 22-09-24 towards PETROL PUMP. Avl Bal: Rs. 18,900'
  },
  {
    id: 'template_5',
    bank: 'Paytm',
    category: 'Wallet',
    template: 'Rs. 450 paid to ZOMATO using Paytm on 22-Sep-24. Transaction ID: PAY123456789. Wallet Balance: Rs. 1,250'
  }
];

// Category icon mapping (used for UI rendering only)
export const categoryIcons = {
  'Food & Dining': '🍽️',
  'Food & Dining': '🍔',
  'Shopping': '🛍️',
  'Transportation': '🚗',
  'Groceries': '🛒',
  'Entertainment': '🎬',
  'Healthcare': '⚕️',
  'Utilities': '💡',
  'Education': '📚',
  'Travel': '✈️',
  'Other': '📌'
};

// Export empty arrays for backward compatibility
// All real data now comes from the backend API
export const mockUser = null;
export const mockExpenses = [];
export const defaultCategories = [];
export const paymentMethods = [];
export const mockUncategorizedTransactions = [];
export const mockSharedExpenses = [];
export const mockReimbursements = [];
