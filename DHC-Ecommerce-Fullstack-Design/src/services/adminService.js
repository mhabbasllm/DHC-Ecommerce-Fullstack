import authService from '../components/Auth/authService';

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5237/api')
    .replace(/\/+$/, '')
    .replace(/\/Auth$/i, '');
const API_URL = `${API_ROOT}/Admin`;

const adminService = {
    getDashboardStats: async () => {
        const response = await fetch(`${API_URL}/dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    },

    getSuppliers: async () => {
        const response = await fetch(`${API_URL}/suppliers`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        return await response.json();
    },

    createSupplier: async (supplierData) => {
        const response = await fetch(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(supplierData)
        });
        if (!response.ok) throw new Error('Failed to create supplier');
        return await response.json();
    },

    updateSupplier: async (id, supplierData) => {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(supplierData)
        });
        if (!response.ok) throw new Error('Failed to update supplier');
        return await response.json();
    },

    deleteSupplier: async (id) => {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete supplier');
        return await response.json();
    },

    getOrders: async () => {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return await response.json();
    },

    getOrderDetails: async (orderId) => {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch order details');
        return await response.json();
    },

    // User Management (SuperAdmin)
    getAllUsers: async () => {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    },

    toggleUserStatus: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}/toggle-status`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to toggle status');
        }
        return await response.json();
    },

    createAdmin: async (adminData) => {
        const response = await fetch(`${API_URL}/create-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(adminData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return await response.json();
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(status)
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return await response.json();
    },

    // Persistent Notifications
    getNotifications: async () => {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return await response.json();
    },

    markNotificationRead: async (id) => {
        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        return response.ok;
    },

    markAllNotificationsRead: async () => {
        const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        return response.ok;
    },

    deleteNotification: async (id) => {
        const response = await fetch(`${API_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        return response.ok;
    }
};

export default adminService;
