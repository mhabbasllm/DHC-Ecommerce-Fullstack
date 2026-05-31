import React, { useState } from 'react';
import { ArrowLeft, Key, Mail, Save, UserPlus } from 'lucide-react';

const EmployeeForm = ({ onCancel, onSubmit }) => {
    const [employee, setEmployee] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSubmit(employee);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onCancel}
                    className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-brand-dark hover:border-brand-dark transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
                    <p className="text-sm text-gray-500">Create an administrator account for system access</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-dark text-white flex items-center justify-center">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Employee Information</h2>
                        <p className="text-xs text-gray-500">The employee will be assigned the Admin role.</p>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                                value={employee.firstName}
                                onChange={(e) => setEmployee({ ...employee, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                                value={employee.lastName}
                                onChange={(e) => setEmployee({ ...employee, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="email"
                                required
                                placeholder="employee@company.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                                value={employee.email}
                                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="Minimum 6 characters"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                                value={employee.password}
                                onChange={(e) => setEmployee({ ...employee, password: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60"
                    >
                        <Save size={16} />
                        {saving ? 'Creating...' : 'Create Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
