import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Globe, ShieldCheck } from 'lucide-react';
import adminService from '../../services/adminService';
import Swal from 'sweetalert2';

const AdminSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        country: '',
        city: '',
        isVerified: false,
        worldwideShipping: true
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

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

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            companyName: supplier.companyName,
            country: supplier.country,
            city: supplier.city,
            isVerified: supplier.isVerified,
            worldwideShipping: supplier.worldwideShipping
        });
        setShowModal(true);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({ companyName: '', country: '', city: '', isVerified: false, worldwideShipping: true });
        } catch (error) {
            Swal.fire('Error!', 'Operation failed.', 'error');
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers & Partners</h1>
                    <p className="text-sm text-gray-500">Manage your global distribution and sourcing network</p>
                </div>
                <button
                    onClick={() => { setEditingSupplier(null); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Supplier
                </button>
            </div>

            {/* Filter Bar */}
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

            {/* Suppliers Table */}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                        checked={formData.isVerified}
                                        onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Verified Supplier</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                        checked={formData.worldwideShipping}
                                        onChange={(e) => setFormData({ ...formData, worldwideShipping: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Supports Worldwide Shipping</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSuppliers;
