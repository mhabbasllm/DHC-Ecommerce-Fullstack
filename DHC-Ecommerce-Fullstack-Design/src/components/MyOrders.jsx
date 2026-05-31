import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ChevronDown, ChevronUp, ShoppingBag, MapPin, Calendar, CreditCard } from 'lucide-react';
import orderService from '../services/orderService';
import signalRService from '../services/signalRService';
import { useAuth } from './Auth/AuthContext';
import Swal from 'sweetalert2';

const MyOrders = ({ onNavigate }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await orderService.getUserOrders();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        // SignalR: Listen for status updates
        signalRService.startConnection();
        signalRService.onOrderStatusUpdated((data) => {
            if (data.userId === user?.id) {
                setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o));

                Swal.fire({
                    toast: true,
                    position: 'bottom-end',
                    icon: 'info',
                    title: 'Order Status Updated',
                    text: `Your order #${data.orderId.substring(0, 8)} is now ${data.status}`,
                    showConfirmButton: false,
                    timer: 5000
                });
            }
        });
    }, [user?.id]);

    const toggleOrderDetails = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'processing': return 'text-blue-600 bg-blue-50';
            case 'shipped': return 'text-indigo-600 bg-indigo-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-gray animate-pulse">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                    <Package size={32} />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark mb-2">Oops! Something went wrong</h2>
                <p className="text-brand-gray mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-brand-blue text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8 md:py-12 px-6">
            <div className="max-w-5xl mx-auto md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#7c3aed] rounded-lg flex items-center justify-center text-white shadow-md">
                            <ShoppingBag size={20} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">My Orders</h1>
                    </div>
                    <button
                        onClick={() => onNavigate('products')}
                        className="text-[#7c3aed] font-medium hover:underline text-sm flex items-center gap-1"
                    >
                        Continue Shopping
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Package size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-brand-dark mb-2">No orders yet</h2>
                        <p className="text-brand-gray mb-8">Items you order will show up here.</p>
                        <button
                            onClick={() => onNavigate('products')}
                            className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                                {/* Order Header */}
                                <div
                                    className="p-5 md:p-6 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                                    onClick={() => toggleOrderDetails(order.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-[#7c3aed]">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brand-dark">Order #{order.id.split('-')[0].toUpperCase()}</h3>
                                            <div className="flex items-center gap-3 text-sm text-brand-gray mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.orderDate).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="font-bold text-brand-dark">${order.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        {expandedOrder === order.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Order Details (Collapsible) */}
                                {expandedOrder === order.id && (
                                    <div className="border-t border-gray-50 bg-gray-50/30 p-5 md:p-8 animate-fade-in">
                                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-brand-dark uppercase tracking-wide flex items-center gap-2">
                                                    <MapPin size={16} className="text-[#7c3aed]" /> Shipping Address
                                                </h4>
                                                <p className="text-sm text-brand-gray leading-relaxed bg-white p-4 rounded-xl border border-gray-100 italic">
                                                    {order.shippingAddress}
                                                </p>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-brand-dark uppercase tracking-wide flex items-center gap-2">
                                                    <CreditCard size={16} className="text-[#7c3aed]" /> Order Summary
                                                </h4>
                                                <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-brand-gray">Subtotal</span>
                                                        <span className="font-bold text-brand-dark">${order.subtotal.toFixed(2)}</span>
                                                    </div>
                                                    {order.discountAmount > 0 && (
                                                        <div className="flex justify-between text-sm text-green-600">
                                                            <span>Discount</span>
                                                            <span>-${order.discountAmount.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-brand-gray">Tax (5%)</span>
                                                        <span className="font-bold text-brand-dark">${order.tax.toFixed(2)}</span>
                                                    </div>
                                                    <div className="border-t border-gray-50 pt-2 flex justify-between items-center mt-2">
                                                        <span className="font-bold text-brand-dark">Grand Total</span>
                                                        <span className="text-lg font-bold text-[#7c3aed]">${order.total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Items ({order.orderItems?.length})</h4>
                                            <div className="grid gap-4">
                                                {order.orderItems?.map((item) => (
                                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 transition-all hover:border-purple-100 shadow-sm">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center p-2 border border-gray-100">
                                                            <img
                                                                src={item.product?.imageUrl || 'https://via.placeholder.com/150'}
                                                                alt={item.product?.title}
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="font-bold text-brand-dark text-sm mb-0.5 truncate">{item.product?.title}</h5>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray">
                                                                <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded italic">
                                                                    Color: {item.color}
                                                                </span>
                                                                <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded italic">
                                                                    Size: {item.size}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-brand-dark">${item.unitPrice.toFixed(2)}</div>
                                                            <div className="text-xs text-brand-gray">Qty: {item.quantity}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider hover:bg-purple-50 px-4 py-2 rounded-lg transition-all"
                                                onClick={() => onNavigate({ name: 'products', searchQuery: order.orderItems?.[0]?.product?.title })}
                                            >
                                                Buy Again
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
