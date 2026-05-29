import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

const AdminHeader = ({ setSidebarOpen, activeTab }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-dark hidden sm:block capitalize">
          {activeTab} Overview
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
        <button className="relative p-1.5 text-gray-500 hover:text-brand-dark transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Profile Dropdown (Visual only) */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer select-none">
          <div className="w-9 h-9 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold shadow-sm">
            A
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-brand-dark leading-tight">Admin User</p>
            <p className="text-gray-500 text-xs">Superadmin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
