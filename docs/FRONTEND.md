# Frontend Documentation

**Personal Finance & Expense Management System - React Frontend**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [State Management](#state-management)
5. [Routing](#routing)
6. [Pages](#pages)
7. [Components](#components)
8. [API Integration](#api-integration)
9. [Styling](#styling)
10. [Build & Deploy](#build--deploy)

---

## 🎯 Overview

The frontend is a single-page application (SPA) built with React that provides a modern, responsive interface for personal finance management. It communicates with the backend REST API and manages application state using React Context.

**Key Features:**
- JWT-based authentication with persistent login
- Real-time expense tracking and management
- Interactive charts and analytics
- Responsive design (mobile-friendly)
- Toast notifications for user feedback
- Loading states and error handling

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.8 | UI framework |
| **React Router DOM** | 7.18.3 | Client-side routing |
| **Recharts** | 3.10.1 | Data visualization (charts) |
| **Lucide React** | 1.45.0 | Icon library |
| **Tailwind CSS** | 4.3.3 | Utility-first CSS framework |
| **Vite** | 8.3.0 | Build tool and dev server |
| **OxLint** | 1.81.0 | JavaScript linter |

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg                # SVG sprite for icons
│
├── src/
│   ├── assets/                  # Static assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/              # Reusable UI Components
│   │   ├── Button.jsx           # Primary button component
│   │   ├── EmptyState.jsx       # Empty state placeholder
│   │   ├── Icon.jsx             # Icon wrapper component
│   │   ├── Input.jsx            # Form input component
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   ├── Modal.jsx            # Modal dialog component
│   │   ├── Select.jsx           # Dropdown select component
│   │   └── Toast.jsx            # Toast notification system
│   │
│   ├── context/                 # React Context
│   │   └── AppContext.jsx       # Global application state
│   │
│   ├── data/                    # Mock/Reference Data
│   │   └── mockData.js          # Sample data for reference
│   │
│   ├── layouts/                 # Layout Components
│   │   ├── AppLayout.jsx        # Main app layout wrapper
│   │   └── Sidebar.jsx          # Navigation sidebar
│   │
│   ├── pages/                   # Page Components (14 pages)
│   │   ├── AddExpense.jsx       # Create new expense
│   │   ├── Analytics.jsx        # Spending analytics & charts
│   │   ├── Categories.jsx       # Manage categories
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── ExpenseDetail.jsx    # View/edit single expense
│   │   ├── Expenses.jsx         # List all expenses
│   │   ├── Login.jsx            # User login
│   │   ├── Profile.jsx          # User profile & settings
│   │   ├── Register.jsx         # User registration
│   │   ├── Reimbursements.jsx   # Reimbursement tracking
│   │   ├── Reports.jsx          # Financial reports
│   │   ├── Sharing.jsx          # Shared expenses
│   │   ├── Simulator.jsx        # SMS transaction simulator
│   │   └── TransactionReview.jsx # Review pending transactions
│   │
│   ├── services/                # API Integration
│   │   └── api.js               # Centralized API service
│   │
│   ├── App.jsx                  # Main App component with routing
│   ├── App.css                  # App-specific styles
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles & Tailwind imports
│
├── dist/                        # Production build output
├── .env                         # Environment variables
├── .gitignore
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vite.config.js               # Vite build configuration
└── README.md
```

---

## 🗂️ State Management

### **AppContext** (`src/context/AppContext.jsx`)

Centralized global state management using React Context API.

**State Variables:**
```javascript
{
  currentUser: null,           // Logged-in user object
  expenses: [],                // All user expenses
  categories: [],              // User's categories
  paymentMethods: [],          // User's payment methods
  dashboardStats: {},          // Dashboard statistics
  loading: false               // Global loading state
}
```

**Key Functions:**
```javascript
login(token, user)              // Set authentication
logout()                        // Clear authentication
loadAppData()                   // Load all user data from API
refreshData()                   // Refresh data after changes
addExpense(expense)             // Add expense to state
updateExpense(id, expense)      // Update expense in state
deleteExpense(id)               // Remove expense from state
approveTransaction(id)          // Approve pending transaction
```

**Usage Example:**
```javascript
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { currentUser, expenses, loadAppData } = useApp();
  
  useEffect(() => {
    loadAppData();
  }, []);
  
  return <div>{expenses.length} expenses</div>;
}
```

---

## 🛣️ Routing

**React Router DOM v7** handles all client-side routing.

### **Route Structure** (`src/App.jsx`)

```javascript
// Public Routes (no auth required)
/login                  → Login page
/register               → Registration page

// Protected Routes (auth required)
/                       → Dashboard
/expenses               → Expenses list
/expenses/add           → Add new expense
/expenses/:id           → Expense detail
/simulator              → Transaction simulator
/transactions           → Transaction review
/sharing                → Shared expenses
/reimbursements         → Reimbursements
/reports                → Financial reports
/analytics              → Analytics & charts
/categories             → Category management
/profile                → User profile
```

### **Protected Route Component**

Redirects to `/login` if user is not authenticated:

```javascript
function ProtectedRoute({ children }) {
  const { currentUser } = useApp();
  return currentUser ? children : <Navigate to="/login" />;
}
```

---

## 📄 Pages

### **1. Login** (`src/pages/Login.jsx`)
**Purpose:** User authentication

**Features:**
- Email and password login
- JWT token storage in localStorage
- Error handling for invalid credentials
- Navigate to dashboard on success
- Link to registration page

**API Call:** `POST /api/auth/login`

---

### **2. Register** (`src/pages/Register.jsx`)
**Purpose:** New user registration

**Features:**
- Multi-field registration form
- Password confirmation validation
- Profile details (name, age, professional status, organization, income)
- Auto-login after successful registration
- Navigate to dashboard on success

**API Call:** `POST /api/auth/register`

---

### **3. Dashboard** (`src/pages/Dashboard.jsx`)
**Purpose:** Main landing page with spending overview

**Features:**
- Total spending for current month
- Number of transactions this month
- Average expense amount
- 7-day spending line graph (Recharts)
- Top spending categories (pie chart)
- Recent transactions list (last 5)
- Quick action buttons

**API Calls:**
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/expenses` - All expenses for graphs

**Charts:**
- 7-day spending trend (LineChart)
- Category breakdown (PieChart with percentages)

---

### **4. Expenses** (`src/pages/Expenses.jsx`)
**Purpose:** View and manage all expenses

**Features:**
- List all expenses with merchant, amount, date, category
- Filter by category, payment method, date range
- Sort by date, amount, merchant
- Search by merchant or description
- Edit and delete expense actions
- Pagination (if needed)
- Color-coded category badges

**API Calls:**
- `GET /api/expenses`
- `DELETE /api/expenses/:id`

**UI Elements:**
- Category color badges
- Payment method icons
- Amount in INR format (₹)
- Date in DD/MM/YYYY format

---

### **5. Add Expense** (`src/pages/AddExpense.jsx`)
**Purpose:** Create new expense

**Form Fields:**
- Merchant name (required)
- Amount (required, number)
- Date (required, date picker)
- Category (required, dropdown)
- Payment method (required, dropdown)
- Description (optional, textarea)
- Receipt URL (optional)
- Tags (optional, comma-separated)

**Validation:**
- Amount must be > 0
- Date cannot be future
- All required fields must be filled

**API Call:** `POST /api/expenses`

**Success Action:** Navigate to `/expenses` with success toast

---

### **6. Expense Detail** (`src/pages/ExpenseDetail.jsx`)
**Purpose:** View and edit single expense

**Features:**
- View all expense details
- Edit mode with inline form
- Update expense fields
- Delete expense with confirmation
- Back to expenses list
- Category badge display
- Payment method display

**API Calls:**
- `GET /api/expenses/:id`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

**Navigation:**
- Back button to expenses list
- Delete redirects to expenses list

---

### **7. Simulator** (`src/pages/Simulator.jsx`)
**Purpose:** Simulate SMS transaction messages

**Features:**
- Text input for SMS-style message
- Parse transaction from message
- Preview parsed transaction details
- Confidence level indicator (HIGH/MEDIUM/LOW)
- Submit transaction for review
- Transaction history

**Message Format Examples:**
```
HDFC Bank Acct XX4567: Rs 380.00 debited for Swiggy on 22/09/2026
SBI Card XX8901: Rs 1250.00 spent at Amazon on 20-09-2026
Paytm: Payment of Rs 299.00 to Netflix
```

**Parsed Fields:**
- Amount
- Merchant
- Date
- Payment method
- Bank name
- Confidence level

**API Call:** `POST /api/transactions/simulate`

**Success Action:** Show parsed details, add to pending transactions

---

### **8. Transaction Review** (`src/pages/TransactionReview.jsx`)
**Purpose:** Review and approve/reject pending transactions

**Features:**
- List all pending transactions
- View parsed transaction details
- Approve transaction → creates expense
- Reject transaction → mark as rejected
- Confidence badge (HIGH/MEDIUM/LOW)
- Filter by confidence level
- Bulk actions support

**Transaction Card Shows:**
- Merchant name
- Amount
- Date
- Payment method
- Bank (if available)
- Confidence level
- Approve/Reject buttons

**API Calls:**
- `GET /api/transactions` (filter: status=PENDING_REVIEW)
- `POST /api/transactions/:id/approve`
- `POST /api/transactions/:id/reject`

**Approve Flow:**
- Creates new expense from transaction
- Marks transaction as APPROVED
- Refreshes expense list
- Shows success toast

---

### **9. Sharing** (`src/pages/Sharing.jsx`)
**Purpose:** Split expenses with friends and track settlements

**Features:**
- Create new shared expense from existing expense
- Add participants with name and email
- Choose split method (EQUAL, MANUAL, PERCENTAGE)
- View all shared expenses
- Track settlement status (PENDING/SETTLED)
- Mark participant as settled
- View who owes/is owed
- Calculate split amounts automatically

**Shared Expense Card Shows:**
- Title
- Total amount
- Split method
- Status (OPEN/PARTIALLY_SETTLED/FULLY_SETTLED)
- Participants list with amounts
- Settlement status for each participant
- Action buttons (Settle)

**API Calls:**
- `GET /api/shared-expenses`
- `POST /api/shared-expenses`
- `POST /api/shared-expenses/:id/settle`

**Split Methods:**
- **EQUAL**: Divide total equally among all participants
- **MANUAL**: Manually specify each person's share
- **PERCENTAGE**: Assign percentage to each participant

**Settlement Flow:**
- Click "Mark as Settled" on participant
- Updates settlement_status to SETTLED
- Updates overall shared expense status
- Shows success toast

---

### **10. Reimbursements** (`src/pages/Reimbursements.jsx`)
**Purpose:** Track expense reimbursement claims

**Features:**
- Create reimbursement from expense
- View all reimbursements
- Status tracking (DRAFT/SUBMITTED/APPROVED/PAID)
- Mark as paid
- Description/justification field
- Amount display
- Expense date reference

**Reimbursement Card Shows:**
- Merchant name (from expense)
- Amount
- Expense date
- Description/reason
- Status badge
- Submitted date (if applicable)
- Payment status badge
- Action button (Mark as Paid)

**API Calls:**
- `GET /api/reimbursements`
- `POST /api/reimbursements`
- `POST /api/reimbursements/:id/mark-paid`

**Status Flow:**
```
DRAFT → Mark as Paid → PAID
SUBMITTED → Mark as Paid → PAID
APPROVED → Mark as Paid → PAID
```

**Note:** Reviewer functionality has been removed. Simple workflow only.

---

### **11. Reports** (`src/pages/Reports.jsx`)
**Purpose:** Generate and download financial reports

**Features:**
- Select report type (MONTHLY/QUARTERLY/YEARLY/CUSTOM)
- Date range picker
- Generate report preview
- Download as PDF, CSV, or Excel
- Report summary statistics
- Category breakdown
- Merchant breakdown
- Expense list in report

**Report Data Includes:**
- Total income (if set in profile)
- Total expenses
- Net amount (income - expenses)
- Category breakdown with amounts
- Top merchants
- Daily/weekly spending trends
- Number of transactions

**API Calls:**
- `POST /api/reports/generate` (with date range and type)
- `GET /api/reports/:id/download?format=pdf`
- `GET /api/reports/:id/download?format=csv`
- `GET /api/reports/:id/download?format=excel`

**Report Types:**
- **MONTHLY**: Current or past month
- **QUARTERLY**: 3-month period
- **YEARLY**: 12-month period
- **CUSTOM**: User-defined date range

---

### **12. Analytics** (`src/pages/Analytics.jsx`)
**Purpose:** Visualize spending patterns and trends

**Features:**
- Monthly spending trend (bar chart)
- Category-wise spending (pie chart)
- Top merchants (horizontal bar chart)
- Payment method breakdown
- Time period selector (1M, 3M, 6M, 1Y, All)
- Spending insights and recommendations
- Average daily/weekly spending
- Comparison with previous period

**Charts (Recharts):**
1. **Monthly Spending Trend** - BarChart showing spend per month
2. **Category Breakdown** - PieChart with percentages
3. **Top 10 Merchants** - BarChart sorted by total spending
4. **Payment Method Split** - PieChart showing usage

**Data Calculations:**
- Total spending for period
- Average per day/week/month
- Highest spending category
- Most frequent merchant
- Most used payment method
- Spending growth/decline percentage

**API Calls:**
- `GET /api/expenses` (with date filters)
- Data aggregated on frontend

---

### **13. Categories** (`src/pages/Categories.jsx`)
**Purpose:** Manage expense categories

**Features:**
- View all categories
- Create new category with name and color
- Edit category name and color
- Delete category (with warning if in use)
- Color picker for category colors
- Reorder categories (drag and drop)
- Mark category as active/inactive
- Category icon selection

**Category Properties:**
- Name (required, unique per user)
- Color (hex code, default: #6b7280)
- Icon (optional, from icon set)
- Active status (boolean)
- Display order (for sorting)

**API Calls:**
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

**Validation:**
- Category name must be unique for user
- Cannot delete category in use by expenses
- Color must be valid hex code

**Default Categories:**
- Food & Dining (#10b981)
- Transport (#3b82f6)
- Shopping (#f59e0b)
- Entertainment (#8b5cf6)
- Health & Fitness (#ef4444)
- Bills & Utilities (#6b7280)
- Education (#06b6d4)
- Travel (#ec4899)
- Personal Care (#14b8a6)
- Other (#64748b)

---

### **14. Profile** (`src/pages/Profile.jsx`)
**Purpose:** User profile and settings management

**Features:**
- View user profile
- Edit profile information
- Update personal details
- Change password
- View account statistics
- Logout button

**Editable Fields:**
- Full name
- Age
- Professional status (Student/Working/Business/Other)
- Organization
- Role/Position
- Monthly income
- Currency preference

**Account Stats Display:**
- Total expenses
- Total transactions
- Categories created
- Payment methods
- Member since date

**API Calls:**
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `PUT /api/users/password` (if change password implemented)

**Profile Card Shows:**
- User email (not editable)
- Full name
- Professional details
- Income information
- Account statistics

---

## 🧩 Components

### **1. Button** (`src/components/Button.jsx`)
**Purpose:** Reusable button component with variants

**Props:**
```javascript
{
  children,          // Button text/content
  variant,           // 'primary' | 'secondary' | 'danger'
  size,              // 'sm' | 'md' | 'lg'
  disabled,          // boolean
  loading,           // boolean (shows spinner)
  onClick,           // Function
  type,              // 'button' | 'submit' | 'reset'
  className          // Additional classes
}
```

**Variants:**
- **primary**: Dark background (default)
- **secondary**: Light background
- **danger**: Red background for destructive actions

**Usage:**
```jsx
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>
```

---

### **2. Input** (`src/components/Input.jsx`)
**Purpose:** Form input field with label and validation

**Props:**
```javascript
{
  label,             // Input label text
  type,              // 'text' | 'email' | 'password' | 'number' | 'date'
  value,             // Controlled value
  onChange,          // Change handler
  placeholder,       // Placeholder text
  required,          // boolean
  error,             // Error message
  disabled,          // boolean
  min, max,          // For number/date inputs
  className          // Additional classes
}
```

**Features:**
- Required field indicator (*)
- Error message display
- Full styling included
- Accessible labels

**Usage:**
```jsx
<Input
  label="Amount"
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  required
  min={0}
  error={errors.amount}
/>
```

---

### **3. Select** (`src/components/Select.jsx`)
**Purpose:** Dropdown select component

**Props:**
```javascript
{
  label,             // Select label
  value,             // Selected value
  onChange,          // Change handler
  options,           // Array of {value, label}
  required,          // boolean
  error,             // Error message
  disabled,          // boolean
  placeholder,       // Placeholder option
  className          // Additional classes
}
```

**Usage:**
```jsx
<Select
  label="Category"
  value={categoryId}
  onChange={(e) => setCategoryId(e.target.value)}
  options={categories.map(c => ({
    value: c.id,
    label: c.name
  }))}
  required
/>
```

---

### **4. Modal** (`src/components/Modal.jsx`)
**Purpose:** Modal dialog overlay

**Props:**
```javascript
{
  isOpen,            // boolean
  onClose,           // Close handler
  title,             // Modal title
  children,          // Modal content
  size,              // 'sm' | 'md' | 'lg' | 'xl'
  className          // Additional classes
}
```

**Features:**
- Overlay backdrop with click-to-close
- ESC key to close
- Animated entrance/exit
- Scrollable content
- Responsive sizing

**Usage:**
```jsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense">
  <ExpenseForm />
</Modal>
```

---

### **5. Toast** (`src/components/Toast.jsx`)
**Purpose:** Notification system for user feedback

**Hook Usage:**
```javascript
import { useToast } from '../components/Toast';

function MyComponent() {
  const { success, error, info, warning } = useToast();
  
  const handleSubmit = () => {
    success('Expense added successfully!');
    error('Failed to save expense');
    info('Processing your request');
    warning('This action cannot be undone');
  };
}
```

**Toast Types:**
- **success**: Green background, check icon
- **error**: Red background, X icon
- **info**: Blue background, info icon
- **warning**: Yellow background, alert icon

**Features:**
- Auto-dismiss after 3 seconds
- Manual dismiss button
- Stacked toasts
- Animated slide-in/out
- Position: top-right

---

### **6. EmptyState** (`src/components/EmptyState.jsx`)
**Purpose:** Placeholder for empty lists

**Props:**
```javascript
{
  icon,              // Icon component
  title,             // Main message
  description,       // Secondary message
  action,            // Action button text
  onAction           // Action button handler
}
```

**Usage:**
```jsx
<EmptyState
  icon={<FileText size={48} />}
  title="No expenses yet"
  description="Start tracking your expenses"
  action="Add Expense"
  onAction={() => navigate('/expenses/add')}
/>
```

---

### **7. LoadingSpinner** (`src/components/LoadingSpinner.jsx`)
**Purpose:** Loading indicator

**Props:**
```javascript
{
  size,              // 'sm' | 'md' | 'lg'
  className          // Additional classes
}
```

**Usage:**
```jsx
{loading ? <LoadingSpinner /> : <Content />}
```

---

### **8. Icon** (`src/components/Icon.jsx`)
**Purpose:** SVG icon wrapper using Lucide React

**Usage:**
```jsx
import { Plus, Edit, Trash, Check } from 'lucide-react';

<Plus size={20} strokeWidth={2} />
<Edit size={16} />
<Trash size={18} className="text-red-500" />
```

**Common Icons:**
- Plus, Edit, Trash, Check, X
- Home, DollarSign, FileText, TrendingUp
- Users, Settings, LogOut
- ChevronDown, ChevronRight, Search

---

## 🌐 API Integration

### **API Service** (`src/services/api.js`)

Centralized API service layer for all backend communication.

**Base Configuration:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
```

**Axios Instance:**
```javascript
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**API Methods:**

```javascript
// Authentication
api.auth.register(userData)
api.auth.login(email, password)
api.auth.getMe()

// Expenses
api.expenses.getAll()
api.expenses.getById(id)
api.expenses.create(expense)
api.expenses.update(id, expense)
api.expenses.delete(id)

// Categories
api.categories.getAll()
api.categories.create(category)
api.categories.update(id, category)
api.categories.delete(id)

// Payment Methods
api.paymentMethods.getAll()
api.paymentMethods.create(method)
api.paymentMethods.update(id, method)
api.paymentMethods.delete(id)

// Transactions
api.transactions.getAll()
api.transactions.simulate(message)
api.transactions.approve(id)
api.transactions.reject(id)

// Shared Expenses
api.sharedExpenses.getAll()
api.sharedExpenses.create(data)
api.sharedExpenses.settleParticipant(id, participantId)

// Reimbursements
api.reimbursement.getReimbursements()
api.reimbursement.createReimbursement(data)
api.reimbursement.markAsPaid(id)

// Reports
api.reports.generate(type, startDate, endDate)
api.reports.download(id, format)

// Dashboard
api.dashboard.getStats()

// User Profile
api.user.getProfile()
api.user.updateProfile(data)
```

---

## 🎨 Styling

### **Tailwind CSS**

Utility-first CSS framework for rapid UI development.

**Configuration** (`tailwind.config.js`):
```javascript
{
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
}
```

**Common Utility Classes:**
```css
/* Layout */
.flex, .grid, .container, .mx-auto

/* Spacing */
.p-4, .m-2, .px-6, .py-3, .space-y-4

/* Typography */
.text-sm, .text-lg, .font-bold, .text-gray-700

/* Colors */
.bg-white, .text-neutral-900, .border-gray-200

/* Responsive */
.sm:hidden, .md:flex, .lg:grid-cols-3
```

**Custom CSS** (`src/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
body {
  @apply bg-neutral-50 text-neutral-900;
}
```

---

## 🏗️ Build & Deploy

### **Development**
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
# Hot module replacement (HMR) enabled
```

### **Production Build**
```bash
npm run build
# Outputs to ./dist folder
# Minified and optimized
```

### **Preview Production Build**
```bash
npm run preview
# Serves the dist folder locally
```

### **Lint**
```bash
npm run lint
# Runs OxLint for code quality
```

### **Build Configuration** (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
```

---

## 🔐 Authentication Flow

1. **User enters email/password on Login page**
2. **POST /api/auth/login** → Backend validates
3. **Receives JWT token** → Stored in localStorage
4. **Token added to all API requests** via interceptor
5. **Protected routes check token** → Redirect to login if missing
6. **Token expires** → 401 error → Redirect to login
7. **Logout** → Remove token from localStorage

---

## 📱 Responsive Design

**Breakpoints:**
- **sm**: 640px (mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

**Mobile Optimizations:**
- Collapsible sidebar
- Touch-friendly buttons (min 44px)
- Simplified charts on small screens
- Stack layouts vertically
- Reduced padding on mobile

---

## ⚡ Performance Optimizations

- **Code splitting** with React Router
- **Lazy loading** for large components
- **Memoization** with React.memo
- **Debounced search** inputs
- **Virtual scrolling** for large lists (if needed)
- **Image optimization** with Vite
- **Production build** minification and tree-shaking

---

## 🧪 Testing Recommendations

**Unit Tests:**
- Component rendering
- State management logic
- Form validation
- Utility functions

**Integration Tests:**
- API service calls
- Authentication flow
- Form submissions
- Navigation

**E2E Tests:**
- Login → Dashboard → Add Expense
- Transaction approval flow
- Report generation

**Tools:**
- Vitest for unit tests
- React Testing Library
- Cypress/Playwright for E2E

---

## 🐛 Debugging

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Profile performance

**Console Logs:**
```javascript
console.log('User data:', currentUser);
console.table(expenses);
```

**Network Tab:**
- Check API requests/responses
- Verify JWT token in headers
- Check status codes

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Vite](https://vitejs.dev)

---

**Next:** [Backend Documentation](./BACKEND.md) | [Database Documentation](./DATABASE.md)
