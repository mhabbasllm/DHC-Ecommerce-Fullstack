import React from 'react';
import { Package, LayoutDashboard, ShoppingCart, Users, Settings, ArrowLeft, LogOut, Truck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../Auth/AuthContext';

const AdminSidebar = ({ isSidebarOpen, setSidebarOpen, activeTab, setActiveTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const roles = user?.roles || [];
  const isSuperAdmin = roles.includes('SuperAdmin');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { id: 'suppliers', label: 'Suppliers', icon: <Truck size={20} /> },
  ];

  if (isSuperAdmin) {
    navItems.push({ id: 'users', label: 'System Access', icon: <ShieldAlert size={20} /> });
  }

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-brand-blue font-bold text-xl cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-8 h-8 bg-brand-blue rounded-md flex items-center justify-center text-white">
            <Package size={20} />
          </div>
          <span>Admin<span className="text-brand-dark">Pro</span></span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
              ? 'bg-blue-50 text-brand-blue'
              : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Back to store & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-brand-dark transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Store
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
