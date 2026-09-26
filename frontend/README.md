# FinanceTracker - Personal Finance & Expense Management

A premium, modern personal finance and expense management application built with React.js, designed for young professionals aged 16-28.

## 🚀 Features

### Core Functionality
- **Manual Expense Entry** - Add expenses with full details (amount, merchant, category, payment method)
- **Simulated Notification Capture** - Experience automatic transaction detection through simulated bank notifications
- **Transaction Review** - Review and categorize auto-captured transactions with duplicate detection
- **Category Management** - Create, edit, reorder, and customize expense categories
- **Expense Tracking** - Comprehensive expense list with search, filters, and sorting
- **Analytics Dashboard** - Visual insights with charts showing spending trends and patterns
- **Reports** - Generate monthly, quarterly, and yearly expense reports with export capabilities
- **Shared Expenses** - Split expenses with friends and track settlements
- **Reimbursements** - Submit and manage expense reimbursements with approval workflows

### User Experience
- **Premium Design** - Minimal, sophisticated interface with excellent typography and spacing
- **Fully Responsive** - Works beautifully on desktop, tablet, and mobile devices
- **Real-time Updates** - All changes reflect immediately across the application
- **5-Year History** - Access to historical expense data spanning five years
- **Smart State Management** - LocalStorage-based persistence ensures data survives refreshes

## 🛠 Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization

### State Management
- **React Context API** - Global state management
- **LocalStorage** - Client-side data persistence

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone or navigate to the project**
   ```bash
   cd /Users/vigilant/Documents/Sem5Sprint1/Software
   ```

2. **Install dependencies** (Already done)
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🎯 Usage

### Getting Started

1. **Login/Register**
   - Use any email and password to log in (mock authentication)
   - Or create a new account with the registration form

2. **Dashboard**
   - View spending overview, trends, and recent activity
   - Quick actions to add expenses or try the simulator

3. **Add Expense**
   - Click "Add Expense" from Dashboard or Expenses page
   - Fill in amount, merchant, date, category, and payment method
   - Submit to add to your expense list

4. **Try the Simulator**
   - Navigate to Simulator from the sidebar
   - Select a sample bank notification or create a custom one
   - Watch as the notification is "captured" and sent to review

5. **Review Transactions**
   - Go to Transactions → Review Queue
   - Review parsed transaction details
   - Select category and approve to create expense
   - Duplicate detection warns about potential duplicates

6. **Manage Categories**
   - Navigate to Categories
   - Add new categories with custom colors and icons
   - Reorder categories using up/down arrows
   - Edit or deactivate existing categories

7. **Analyze Spending**
   - Visit Analytics page for visual insights
   - View spending trends, category distribution, and top merchants
   - Filter by time period (month, quarter, year)

8. **Generate Reports**
   - Go to Reports page
   - Select report type (monthly, quarterly, yearly)
   - Choose specific period and category
   - Export as PDF, CSV, or Excel (mock action)

9. **Share Expenses**
   - Navigate to Sharing
   - Select an expense to split
   - Add participants and define shares
   - Track who owes what and mark settlements

10. **Submit Reimbursements**
    - Go to Reimbursements
    - Select eligible expense
    - Add description/justification
    - Submit for review and track status

## 📱 Available Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Main dashboard with overview |
| `/expenses` | Expense list with filters |
| `/expenses/new` | Add new expense |
| `/expenses/:id` | View/edit expense details |
| `/categories` | Manage expense categories |
| `/transactions/review` | Review uncategorized transactions |
| `/simulator` | Payment notification simulator |
| `/sharing` | Shared expenses management |
| `/reimbursements` | Reimbursement tracking |
| `/analytics` | Visual spending analytics |
| `/reports` | Generate and export reports |
| `/profile` | User profile and settings |

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Modal.jsx
│   ├── Toast.jsx
│   ├── EmptyState.jsx
│   └── LoadingSpinner.jsx
├── context/            # Global state management
│   └── AppContext.jsx
├── data/               # Mock data
│   └── mockData.js
├── layouts/            # Layout components
│   ├── AppLayout.jsx
│   └── Sidebar.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Expenses.jsx
│   ├── AddExpense.jsx
│   ├── ExpenseDetail.jsx
│   ├── Categories.jsx
│   ├── TransactionReview.jsx
│   ├── Simulator.jsx
│   ├── Sharing.jsx
│   ├── Reimbursements.jsx
│   ├── Analytics.jsx
│   ├── Reports.jsx
│   └── Profile.jsx
├── App.jsx             # Main app component with routing
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## 🎨 Design Philosophy

### Visual Principles
- **Minimal & Premium** - Clean whitespace, refined typography, subtle colors
- **Calm & Sophisticated** - No excessive gradients, animations, or bright colors
- **Modern Fintech** - Inspired by best-in-class consumer finance products
- **Intentional Layouts** - Strong visual hierarchy, purposeful use of cards and sections

### Color Palette
- **Neutral Base** - Off-white backgrounds, near-black text, muted grays
- **Accent Colors** - Reserved for categories, status indicators, and important actions
- **Category Colors** - Distinct colors for each expense category

### Typography
- Modern sans-serif font stack
- Strong type hierarchy
- Excellent readability

## 📊 Mock Data

The application includes comprehensive mock data:

- **5 Years of Historical Expenses** - Realistic spending data from 2021-2026
- **10 Default Categories** - Food, Transport, Shopping, Bills, Entertainment, Health, Travel, Education, Personal Care, Other
- **5 Payment Methods** - Credit cards, debit cards, UPI, and cash
- **Sample Notifications** - Multiple bank notification templates
- **Shared Expenses** - Example split expenses with multiple participants
- **Reimbursements** - Sample reimbursement requests in various states

All mock data is stored in `src/data/mockData.js` and can be easily customized.

## 🔄 State Management

### Context Architecture
- **AppContext** - Global application state
- **LocalStorage** - Persistent storage across sessions
- **Real-time Updates** - Changes propagate immediately across all components

### Key State Functions
- `addExpense()` - Create new expense
- `updateExpense()` - Modify existing expense
- `deleteExpense()` - Remove expense
- `addCategory()` - Create category
- `approveTransaction()` - Convert transaction to expense
- `addSharedExpense()` - Create split expense
- `addReimbursement()` - Submit reimbursement claim

## 🚫 What's NOT Included (Frontend-Only Phase)

This is the **frontend-only** implementation. The following are NOT implemented:

- Real backend API
- Database integration
- Real authentication/authorization
- Actual SMS/notification access
- Real payment gateway integration
- Actual PDF/CSV/Excel file generation
- Real email notifications
- Multi-user collaboration
- Cloud sync

These features are represented through realistic UI/UX and will be integrated with a backend in the future.

## 🔐 Authentication

Current authentication is **mock-only**:
- Any email and password combination will work for login
- Registration creates a local user profile
- Data is stored in browser's LocalStorage
- Logout clears session

## 🎯 Future Backend Integration Points

When integrating with a backend, update these areas:

1. **API Service Layer** - Create `src/services/api.js` with REST/GraphQL calls
2. **Auth Service** - Replace mock authentication with JWT/OAuth
3. **Real-time Updates** - Add WebSocket support for notifications
4. **File Upload** - Implement receipt image upload
5. **Export Service** - Generate actual PDF/CSV/Excel files server-side
6. **SMS Parser** - Integrate real SMS/notification capture (with permissions)
7. **Payment Integration** - Connect to payment gateways for settlements

## 📱 Responsive Design

The application is fully responsive:

- **Desktop** - Sidebar navigation, spacious layouts
- **Tablet** - Adapted sidebar, responsive grids
- **Mobile** - Drawer navigation, stacked layouts, touch-optimized

## ✅ Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The production build outputs to `dist/` directory.

## 🐛 Known Limitations

- Data persists only in browser LocalStorage (cleared on cache clear)
- No server-side validation
- Mock authentication has no security
- Export functions show toast notifications instead of generating files
- Simulator doesn't access real device notifications
- No offline support beyond LocalStorage
- No data sync across devices

## 📝 Development Notes

### Code Quality
- Clean, reusable React components
- Consistent naming conventions
- No console errors
- Proper error handling
- Loading and empty states
- Form validation

### Accessibility
- Semantic HTML
- Keyboard navigation support
- Visible focus states
- Adequate color contrast
- ARIA labels where needed

## 👥 Target Users

Young professionals, approximately 16-28 years old:
- Students managing pocket money
- Early career professionals tracking expenses
- Young adults learning financial management
- Anyone wanting a clean, modern expense tracker

## 🎓 Learning Resources

This project demonstrates:
- React.js best practices
- Context API for state management
- React Router for navigation
- Tailwind CSS utility-first styling
- Recharts data visualization
- LocalStorage for persistence
- Responsive design patterns
- Form handling and validation
- Component composition

## 📄 License

This is a demonstration project for educational purposes.

## 🙏 Acknowledgments

Built following modern React and UX best practices, with inspiration from leading fintech products.

---

**Current Status**: ✅ Fully functional frontend complete and running at `http://localhost:5173`
