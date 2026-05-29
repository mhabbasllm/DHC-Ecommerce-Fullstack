import React, { useState } from 'react';
import {
    Lock,
    Truck,
    CreditCard,
    MapPin,
    Phone,
    User,
    ChevronRight,
    CheckCircle2,
    Package,
    Banknote
} from 'lucide-react';
import { useCart } from './CartContext';
import orderService from '../services/orderService';
import Swal from 'sweetalert2';

const Checkout = ({ onNavigate }) => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'card'
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        zipCode: '',
        phone: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        // Validate form (simplified)
        if (!formData.fullName || !formData.address || !formData.phone) {
            setError('Please fill in all shipping details');
            return;
        }

        if (cartItems.length === 0) {
            setError('Your cart is empty');
            return;
        }

        try {
            setIsPlacingOrder(true);
            setError('');

            // 1. Sync local cart to DB for the backend OrderController logic
            await orderService.syncCartDB(cartItems);

            // 2. Perform Checkout
            const fullAddress = `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.zipCode}, Phone: ${formData.phone}`;
            await orderService.placeOrder(fullAddress);

            // 3. Success
            setOrderPlaced(true);
            clearCart();

            Swal.fire({
                title: 'Order Successful!',
                text: 'Your order has been placed successfully.',
                icon: 'success',
                confirmButtonText: 'View My Orders',
                confirmButtonColor: '#7c3aed',
                timer: 5000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            }).then((result) => {
                onNavigate('orders');
            });

        } catch (err) {
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold text-brand-dark mb-2">Order Placed Successfully!</h2>
                <p className="text-brand-gray mb-8">Thank you for your purchase. Your order #DHC-{Math.floor(Math.random() * 10000)} is being processed.</p>
                <button
                    onClick={() => onNavigate('home')}
                    className="bg-brand-blue text-white px-8 py-3 rounded-md font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                    Back to Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8 md:py-12">
            <div className="container max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-[#7c3aed] rounded-lg flex items-center justify-center text-white shadow-md">
                        <Lock size={20} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Checkout</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Forms */}
                    <div className="flex-1 space-y-6">

                        {/* Shipping Information */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-white px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <Truck className="text-[#7c3aed]" size={20} />
                                <h2 className="font-bold text-brand-dark">Shipping Information</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs text-brand-gray font-medium mb-1.5 block">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition-all text-brand-dark"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-brand-gray font-medium mb-1.5 block">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="123 Main Street, Apt 4"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition-all text-brand-dark"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-brand-gray font-medium mb-1.5 block">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="New York"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition-all text-brand-dark"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-brand-gray font-medium mb-1.5 block">ZIP Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            placeholder="10001"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition-all text-brand-dark"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-brand-gray font-medium mb-1.5 block">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition-all text-brand-dark"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-white px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <CreditCard className="text-[#7c3aed]" size={20} />
                                <h2 className="font-bold text-brand-dark">Payment Method</h2>
                            </div>

                            <div className="p-6 space-y-3">
                                <label
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#7c3aed] bg-purple-50' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#7c3aed]' : 'border-gray-300'
                                            }`}>
                                            {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[#7c3aed] rounded-full" />}
                                        </div>
                                        <Banknote className="text-green-600" size={20} />
                                        <span className="font-medium text-brand-dark text-sm">Cash on Delivery</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                </label>

                                <label
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#7c3aed] bg-purple-50' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#7c3aed]' : 'border-gray-300'
                                            }`}>
                                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-[#7c3aed] rounded-full" />}
                                        </div>
                                        <CreditCard className="text-[#7c3aed]" size={20} />
                                        <span className="font-medium text-brand-dark text-sm">Card Payment</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-[380px]">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-8">
                            <div className="bg-white px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <Package className="text-[#7c3aed]" size={20} />
                                <h2 className="font-bold text-brand-dark">Order Summary</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Cart Items */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center p-1 border border-gray-100">
                                                <img src={item.imageUrl || item.img} alt={item.title} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-brand-dark truncate">{item.title}</h4>
                                                <p className="text-xs text-brand-gray">Qty: {item.quantity || item.qty}</p>
                                            </div>
                                            <span className="text-sm font-bold text-brand-dark">${(item.price * (item.quantity || item.qty)).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {cartItems.length === 0 && (
                                        <div className="text-center py-4 text-brand-gray text-sm">Your cart is empty</div>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-brand-gray">Subtotal</span>
                                        <span className="font-bold text-brand-dark">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-brand-gray">Shipping</span>
                                        <span className="font-bold text-green-500">Free</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                        <span className="text-lg font-bold text-brand-dark">Total</span>
                                        <span className="text-xl font-bold text-[#7c3aed]">${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                    className={`w-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white py-4 rounded-xl font-bold hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 ${isPlacingOrder ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isPlacingOrder ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={20} />
                                    )}
                                    {isPlacingOrder ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
