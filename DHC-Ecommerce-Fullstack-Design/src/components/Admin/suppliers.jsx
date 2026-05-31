import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Globe, ShieldCheck } from 'lucide-react';
import adminService from '../../services/adminService';
import Swal from 'sweetalert2';
import SupplierForm from './SupplierForm';

const AdminSuppliers = ({ onNavigate, routeAction, routeId }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list');
    const [editingSupplier, setEditingSupplier] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (routeAction === 'new') {
            setEditingSupplier(null);
            setView('form');
            return;
        }

        if (routeAction === 'edit' && routeId) {
            const supplier = suppliers.find(s => s.id === routeId);
            if (supplier) {
                setEditingSupplier(supplier);
                setView('form');
            } else if (!loading) {
                Swal.fire('Error!', 'Supplier could not be loaded.', 'error');
                goToList();
            }
            return;
        }

        setEditingSupplier(null);
        setView('list');
    }, [routeAction, routeId, suppliers, loading]);

    const fetchSuppliers = async () => {
        try {
            const data = await adminService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        onNavigate('admin', { adminTab: 'suppliers', adminAction: 'new' });
    };

    const handleEdit = (supplier) => {
        onNavigate('admin', { adminTab: 'suppliers', adminAction: 'edit', adminId: supplier.id });
    };

    const goToList = () => {
        onNavigate('admin', { adminTab: 'suppliers' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await adminService.deleteSupplier(id);
                setSuppliers(prev => prev.filter(s => s.id !== id));
                Swal.fire('Deleted!', 'Supplier has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete supplier.', 'error');
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingSupplier) {
                const updated = await adminService.updateSupplier(editingSupplier.id, formData);
                setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updated : s));
                Swal.fire('Updated!', 'Supplier details updated successfully.', 'success');
            } else {
                const created = await adminService.createSupplier(formData);
                setSuppliers(prev => [created, ...prev]);
                Swal.fire('Success!', 'New supplier added.', 'success');
            }
            setEditingSupplier(null);
            goToList();
        } catch (error) {
            Swal.fire('Error!', 'Operation failed.', 'error');
            throw error;
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === 'form') {
        return (
            <SupplierForm
                supplier={editingSupplier}
                onCancel={() => {
                    setEditingSupplier(null);
                    goToList();
                }}
                onSubmit={handleSubmit}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers & Partners</h1>
                    <p className="text-sm text-gray-500">Manage your global distribution and sourcing network</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Supplier
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search suppliers by name or country..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Company</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Logistics</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading suppliers...</td></tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No suppliers found.</td></tr>
                            ) : filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{supplier.companyName}</div>
                                                <div className="text-xs text-gray-500">Joined {new Date(supplier.joinedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {supplier.city}, {supplier.country}
                                    </td>
                                    <td className="px-6 py-4">
                                        {supplier.isVerified ? (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                                                <ShieldCheck size={14} />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full w-fit border border-gray-200">
                                                Standard
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                            <Globe size={14} className="text-gray-400" />
                                            {supplier.worldwideShipping ? 'Worldwide' : 'Local Only'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(supplier)}
                                                className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplier.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSuppliers;
