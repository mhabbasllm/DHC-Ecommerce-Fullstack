import React, { useState } from 'react';
import { ArrowLeft, Save, Truck } from 'lucide-react';

const SupplierForm = ({ supplier, onCancel, onSubmit }) => {
    const [formData, setFormData] = useState({
        companyName: supplier?.companyName || '',
        country: supplier?.country || '',
        city: supplier?.city || '',
        isVerified: supplier?.isVerified || false,
        worldwideShipping: supplier?.worldwideShipping ?? true
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSubmit(formData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onCancel}
                    className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-brand-blue hover:border-brand-blue transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h1>
                    <p className="text-sm text-gray-500">Manage supplier profile, verification, and logistics</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue text-white flex items-center justify-center">
                        <Truck size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Supplier Information</h2>
                        <p className="text-xs text-gray-500">This replaces the old popup form with a full page workflow.</p>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
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
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : supplier ? 'Save Supplier' : 'Create Supplier'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupplierForm;
