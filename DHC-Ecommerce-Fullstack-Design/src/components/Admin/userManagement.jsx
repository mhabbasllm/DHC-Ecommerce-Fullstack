import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Power, Search, Mail } from 'lucide-react';
import adminService from '../../services/adminService';
import Swal from 'sweetalert2';
import EmployeeForm from './EmployeeForm';

const UserManagement = ({ onNavigate, routeAction }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setView(routeAction === 'new' ? 'form' : 'list');
    }, [routeAction]);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            Swal.fire('Error', 'Failed to fetch users. You might not have permission.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const result = await adminService.toggleUserStatus(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: result.isActive } : u));
            Swal.fire({
                title: 'Success!',
                text: result.message,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleAddAdmin = async (newAdmin) => {
        try {
            await adminService.createAdmin(newAdmin);
            Swal.fire('Success', 'New employee account created successfully.', 'success');
            onNavigate('admin', { adminTab: 'users' });
            fetchUsers();
        } catch (error) {
            const msg = error.message || (error[0] && error[0].description) || 'Failed to create employee';
            Swal.fire('Error', msg, 'error');
            throw error;
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === 'form') {
        return (
            <EmployeeForm
                onCancel={() => onNavigate('admin', { adminTab: 'users' })}
                onSubmit={handleAddAdmin}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Access Control</h1>
                    <p className="text-sm text-gray-500">Manage administrator accounts and system permissions</p>
                </div>
                <button
                    onClick={() => onNavigate('admin', { adminTab: 'users', adminAction: 'new' })}
                    className="flex items-center justify-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <UserPlus size={20} />
                    Add Employee
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-dark focus:border-transparent outline-none text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500">Loading user accounts...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500">No matching accounts found.</div>
                ) : filteredUsers.map((user) => (
                    <div key={user.id} className={`bg-white rounded-2xl border ${user.isActive ? 'border-gray-200 shadow-sm' : 'border-red-100 bg-red-50/30'} overflow-hidden transition-all hover:shadow-md`}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${user.isActive ? 'bg-brand-dark' : 'bg-gray-400'}`}>
                                    <Shield size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg truncate">{user.fullName || 'Unnamed User'}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Mail size={14} />
                                <span className="truncate">{user.email}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {user.roles && user.roles.map((role, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                                        {role}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    Joined {new Date(user.joinAt).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => handleToggleStatus(user.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${user.isActive
                                        ? 'text-red-500 hover:bg-red-50'
                                        : 'text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    <Power size={16} />
                                    {user.isActive ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserManagement;
