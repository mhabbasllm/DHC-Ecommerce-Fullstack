import React from 'react';
import { ArrowLeft, Calendar, Mail, MapPin, Package, Receipt, User } from 'lucide-react';

const OrderDetails = ({ order, loading, onBack }) => {
    const items = order?.items || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Processing': return 'bg-blue-100 text-blue-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Pending': return 'bg-orange-100 text-orange-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
                Loading order details...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
                <p className="text-gray-500 mb-4">Order details could not be loaded.</p>
                <button onClick={onBack} className="text-brand-blue font-semibold hover:underline">Back to orders</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-brand-blue hover:border-brand-blue transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id?.substring(0, 8)}</h1>
                        <p className="text-sm text-gray-500">Full customer, shipping, and item details</p>
                    </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Items</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <div className="px-6 py-10 text-center text-gray-500">No items found for this order.</div>
                        ) : items.map((item) => (
                            <div key={item.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={22} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{item.productTitle}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Qty {item.quantity}
                                        {item.size ? ` · Size ${item.size}` : ''}
                                        {item.color ? ` · ${item.color}` : ''}
                                        {item.material ? ` · ${item.material}` : ''}
                                    </p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="font-bold text-gray-900">${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">${(item.unitPrice || 0).toFixed(2)} each</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Customer</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-gray-700">
                                <User size={16} className="text-gray-400" />
                                <span className="font-medium">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail size={16} className="text-gray-400" />
                                <span className="truncate">{order.customerEmail}</span>
                            </div>
                            <div className="flex items-start gap-3 text-gray-600">
                                <MapPin size={16} className="text-gray-400 mt-0.5" />
                                <span>{order.shippingAddress}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Calendar size={16} className="text-gray-400" />
                                <span>{new Date(order.orderDate).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Receipt size={18} />
                            Payment
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span>
                                <span>-${(order.discountAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (5%)</span>
                                <span>${(order.tax || 0).toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-base">
                                <span>Total</span>
                                <span>${(order.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
