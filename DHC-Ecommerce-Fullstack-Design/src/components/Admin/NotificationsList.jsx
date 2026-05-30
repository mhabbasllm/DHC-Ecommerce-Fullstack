import React from 'react';
import { Bell, Clock, CheckCircle, Trash2, Tag, ShoppingBag, Shield } from 'lucide-react';

const NotificationsList = ({ notifications, setNotifications }) => {
    const markAsRead = async (id) => {
        try {
            await adminService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await adminService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await adminService.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const getIcon = (title) => {
        if (title.toLowerCase().includes('order')) return <ShoppingBag size={20} />;
        if (title.toLowerCase().includes('tag')) return <Tag size={20} />;
        if (title.toLowerCase().includes('security')) return <Shield size={20} />;
        return <Bell size={20} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
                    <p className="text-sm text-gray-500">Manage all your system alerts and activities</p>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm font-bold shadow-sm"
                    >
                        <CheckCircle size={18} className="text-brand-blue" />
                        Mark All as Read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Notifications</h3>
                        <p className="text-gray-500 text-sm mt-1">You're all up to date. New alerts will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-6 flex gap-4 transition-all hover:bg-gray-50/50 ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                    {getIcon(n.title)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-base font-bold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h4>
                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(n.time).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{n.message}</p>
                                    <div className="flex items-center gap-3">
                                        {!n.isRead && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="text-xs font-bold text-brand-blue hover:underline"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(n.id)}
                                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsList;
