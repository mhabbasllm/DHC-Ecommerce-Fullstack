import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../Auth/AuthContext';

const AdminHeader = ({ setSidebarOpen, activeTab, notifications = [], setNotifications, setActiveTab }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Filter for unread notifications for the dropdown
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;

  // Primary Role logic
  const roles = user?.roles || [];
  const primaryRole = roles.includes('Admin') ? 'Administrator' : 'Staff';

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-dark hidden sm:block capitalize">
          {activeTab === 'notifications' ? 'All Notifications' : `${activeTab} Overview`}
        </h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Search */}
        <div className="hidden md:flex relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm outline-none focus:border-brand-blue bg-gray-50 focus:bg-white w-64 transition-colors"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-gray-500 hover:text-brand-dark transition-colors outline-none"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-brand-dark text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-brand-blue hover:underline font-bold flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {unreadNotifications.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-400">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={20} className="opacity-20" />
                    </div>
                    <p className="text-xs font-medium">No unread notifications</p>
                  </div>
                ) : (
                  unreadNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        setShowNotifications(false);
                      }}
                      className="px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Bell size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{n.title}</p>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium tracking-wide">
                            <Clock size={10} />
                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  setActiveTab('notifications');
                }}
                className="w-full py-3 text-xs font-bold text-brand-blue border-t border-gray-50 hover:bg-gray-100 transition-all uppercase tracking-wider"
              >
                See All Notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer select-none">
          <div className="w-9 h-9 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-blue-50">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-brand-dark leading-tight">
              {user?.fullName || 'Admin User'}
            </p>
            <p className="text-gray-500 text-xs font-medium">{primaryRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
