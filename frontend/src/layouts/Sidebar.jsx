import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Tag, 
  Users, 
  FileText, 
  TrendingUp, 
  FileBarChart,
  Smartphone,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, currentUser } = useApp();

  const mainNavigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Wallet },
    { name: 'Transactions', path: '/transactions/review', icon: Receipt },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: 'Sharing', path: '/sharing', icon: Users },
    { name: 'Reimbursements', path: '/reimbursements', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
  ];

  const secondaryNavigation = [
    { name: 'Simulator', path: '/simulator', icon: Smartphone },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-neutral-200">
            <h1 className="text-xl font-semibold text-neutral-900">FinanceTracker</h1>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`
                  }
                >
                  <item.icon size={20} strokeWidth={1.8} className="mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="space-y-1">
                {secondaryNavigation.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`
                    }
                  >
                    <item.icon size={20} strokeWidth={1.8} className="mr-3" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-semibold">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {currentUser?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <LogOut size={18} strokeWidth={1.8} className="mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
