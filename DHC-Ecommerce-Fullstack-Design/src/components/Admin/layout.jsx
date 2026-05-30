import React from 'react';
import AdminSidebar from './shared/sidebar';
import AdminHeader from './shared/header';

const AdminLayout = ({ children, isSidebarOpen, setSidebarOpen, activeTab, setActiveTab, onNavigate, notifications, setNotifications }) => {
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
