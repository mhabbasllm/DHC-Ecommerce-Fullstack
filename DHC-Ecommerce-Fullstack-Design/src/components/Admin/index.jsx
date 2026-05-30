import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  MoreVertical
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import AdminLayout from './layout';
import AdminProducts from './products';
import AdminSuppliers from './suppliers';
import AdminOrders from './orders';
import UserManagement from './userManagement';
import adminService from '../../services/adminService';
import NotificationsList from './NotificationsList';
import signalRService from '../../services/signalRService';
import { useAuth } from '../Auth/AuthContext';
import Swal from 'sweetalert2';

const revenueData = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 139 },
  { name: 'Mar', revenue: 5200, orders: 380 },
  { name: 'Apr', revenue: 4500, orders: 320 },
  { name: 'May', revenue: 6000, orders: 480 },
  { name: 'Jun', revenue: 5800, orders: 410 },
  { name: 'Jul', revenue: 7200, orders: 550 },
];

const AdminDashboard = ({ onNavigate }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = user?.roles?.includes('Admin');

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      signalRService.startConnection();

      signalRService.onNewOrder((order) => {
        // 1. Update stats real-time
        setStats(prev => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          totalSales: prev.totalSales + order.amount,
          recentOrders: [order, ...prev.recentOrders.slice(0, 4)]
        }));

        // 2. Add to notifications
        setNotifications(prev => [{
          id: Date.now(),
          title: 'New Order Received',
          message: `${order.customer} placed an order for $${order.amount.toFixed(2)}`,
          time: new Date(),
          isRead: false
        }, ...prev]);

        // 3. Show Toast
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'New Order!',
          text: `From ${order.customer}`,
          showConfirmButton: false,
          timer: 4000
        });
      });

      if (activeTab === 'dashboard') {
        fetchDashboardData();
      }
    }

    return () => {
      // Don't necessarily stop connection if we want it to persist across tabs
    };
  }, [isAdmin, activeTab]);

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-brand-blue font-bold">Verifying Access...</div>;

  if (!isAuthenticated || !isAdmin) {
    return null; // App.jsx will handle redirection
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.totalSales?.toLocaleString() || '0'}`, increase: '+20.1%', icon: <DollarSign size={20} className="text-brand-blue" /> },
    { title: 'Orders', value: stats.totalOrders?.toLocaleString() || '0', increase: '+15.4%', icon: <ShoppingCart size={20} className="text-green-500" /> },
    { title: 'Total Products', value: stats.totalProducts?.toLocaleString() || '0', increase: '+2.1%', icon: <Package size={20} className="text-purple-500" /> },
    { title: 'Active Users', value: stats.totalUsers?.toLocaleString() || '0', increase: '+4.3%', icon: <Users size={20} className="text-orange-500" /> }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout
      isSidebarOpen={isSidebarOpen}
      setSidebarOpen={setSidebarOpen}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onNavigate={onNavigate}
      notifications={notifications}
      setNotifications={setNotifications}
    >
      {/* ================= DASHBOARD TAB ================= */}
      {activeTab === 'dashboard' && (
        <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    {stat.increase}
                  </span>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                  <p className="text-2xl font-bold text-brand-dark mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-brand-dark">Revenue Overview</h2>
                <p className="text-xs text-gray-500">Monthly revenue for the current year</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Revenue (USD)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-brand-dark">Orders Summary</h2>
                <p className="text-xs text-gray-500">Monthly order volume</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} name="Total Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-brand-dark">Recent Orders</h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-sm text-brand-blue font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {stats.recentOrders.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No orders recently.</td></tr>
                  ) : stats.recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-brand-dark">#{order.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                            {order.customer?.charAt(0)}
                          </div>
                          {order.customer}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-brand-dark">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS TAB ================= */}
      {activeTab === 'products' && <AdminProducts />}

      {/* ================= ORDERS TAB ================= */}
      {activeTab === 'orders' && <AdminOrders />}

      {/* ================= SUPPLIERS TAB ================= */}
      {activeTab === 'suppliers' && <AdminSuppliers />}

      {/* ================= SYSTEM ACCESS / USERS TAB ================= */}
      {(activeTab === 'users' || activeTab === 'system access') && isAdmin && <UserManagement />}

      {/* ================= NOTIFICATIONS TAB ================= */}
      {activeTab === 'notifications' && (
        <NotificationsList
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
