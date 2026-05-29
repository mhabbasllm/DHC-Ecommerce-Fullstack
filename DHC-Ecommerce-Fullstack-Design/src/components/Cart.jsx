import React, { useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Lock,
  Headphones,
  Truck,
  ShoppingCart,
  ChevronDown,
  Minus,
  Plus,
  MoreVertical
} from 'lucide-react';

// Import image assets
import cloth1 from '../assets/Layout/alibaba/Image/cloth/Bitmap.png';
import cloth3 from '../assets/Layout/alibaba/Image/cloth/Bitmap2.png';
import cloth5 from '../assets/Layout/alibaba/Image/cloth/image 26.png';
import cloth6 from '../assets/Layout/alibaba/Image/cloth/image 30.png';

import tech1 from '../assets/Image/tech/image 23.png';
import tech2 from '../assets/Image/tech/image 29.png';
import tech5 from '../assets/Image/tech/image 34.png';
import tech6 from '../assets/Image/tech/image 32.png';
import tech7 from '../assets/Image/tech/image 33.png';

import interior1 from '../assets/Image/interior/1.png';
import interior3 from '../assets/Image/interior/3.png';

import { useCart } from './CartContext';
import orderService from '../services/orderService';

const Cart = ({ onNavigate }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, addToCart, cartTotal, cartCount } = useCart();
  const [savedItems, setSavedItems] = useState([]);

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Math Calculations
  const subtotal = cartTotal || 0;
  const discountVal = couponApplied ? (subtotal * discountPercent) : 0;
  const tax = subtotal > 0 ? 14.00 : 0.00;
  const total = Math.max(0, subtotal - discountVal + tax);

  // Handlers
  const handleQtyChange = (id, val) => {
    updateQuantity(id, parseInt(val));
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const handleSaveForLater = (id) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    // Add to saved list
    setSavedItems(prev => [
      ...prev,
      { id: Date.now(), img: item.img, title: item.title, price: item.price }
    ]);

    // Remove from cart
    handleRemoveItem(id);
  };

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    setSavedItems(prev => prev.filter(i => i.id !== item.id));
  };

  const handleRemoveAll = () => {
    clearCart();
  };

  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const data = await orderService.validateCoupon(couponCode);
      setDiscountPercent(data.discountPercent / 100); // DB gives e.g. 15.00 for 15%
      setCouponApplied(true);
      alert(`Success! ${data.discountPercent}% discount applied.`);
    } catch (error) {
      setCouponApplied(false);
      setDiscountPercent(0);
      alert(error.message || 'Invalid coupon code');
    }
  };

  return (
    <main className="bg-[#f7f8fa] py-0 md:py-6 text-brand-dark font-sans min-h-[70vh]">
      <div className="container max-w-[1200px] mx-auto md:px-4 px-0">

        {/* ====== MOBILE CART HEADER ====== */}
        <div className="md:hidden flex items-center py-3 px-4 bg-white border-b border-gray-200">
          <button onClick={() => onNavigate('home')} className="text-[#1c1c1c] p-1 mr-3 cursor-pointer">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-lg font-semibold text-[#1c1c1c]">Shopping cart</h2>
        </div>

        {/* Page Title - Desktop only */}
        <h1 className="hidden md:block text-xl md:text-2xl font-bold text-brand-dark mb-6 select-none px-4">
          My cart ({cartCount})
        </h1>

        {/* Outer Split Columns Grid */}
        <div className="grid grid-cols-12 gap-0 md:gap-6 items-start">

          {/* Left Column: Cart items list (Span 9) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-0 md:gap-5">
            <div className="bg-white border-0 md:border md:border-gray-200 rounded-none md:rounded-md p-0 md:p-5 shadow-none md:shadow-sm">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center select-none">
                  <ShoppingCart size={48} className="text-gray-300 mb-3" />
                  <p className="text-brand-gray text-base font-semibold">Your shopping cart is empty.</p>
                  <button
                    onClick={() => onNavigate('products')}
                    className="mt-4 bg-brand-blue hover:bg-blue-700 text-white rounded-md py-2 px-6 text-sm font-semibold cursor-pointer shadow-sm transition-colors"
                  >
                    Go Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row gap-0 md:gap-5 py-4 border-b border-gray-200 last:border-0 items-start justify-between relative px-4 md:px-0"
                    >
                      {/* Mobile 3-dots menu */}
                      <button className="md:hidden absolute right-3 top-4 text-[#a5b2c7] p-1 cursor-pointer">
                        <MoreVertical size={20} />
                      </button>

                      {/* Image and details */}
                      <div className="flex gap-3 md:gap-4 flex-1 w-full">
                        {/* Thumbnail image */}
                        <div className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] border border-gray-200 rounded-md flex items-center justify-center p-1 md:p-1.5 flex-shrink-0 bg-white select-none overflow-hidden">
                          <img
                            src={item.img}
                            alt={item.title}
                            className={`max-h-[90%] max-w-[90%] object-contain ${item.img === cloth6 ? 'scale-[1.15]' :
                              item.img === interior3 ? 'scale-[1.3]' : ''
                              }`}
                          />
                        </div>

                        {/* Text descriptions */}
                        <div className="flex flex-col flex-1">
                          <h4 className="text-[14px] md:text-base font-medium md:font-semibold text-[#1c1c1c] md:text-brand-dark hover:text-brand-blue cursor-pointer transition-colors leading-snug line-clamp-2 pr-6 md:pr-0" onClick={() => onNavigate('product-details')}>
                            {item.title}
                          </h4>
                          <span className="text-[12px] text-[#a5b2c7] mt-1 leading-tight select-none">
                            <span className="hidden md:inline">Size: {item.size}, Color: {item.color}, Material: {item.material}</span>
                            <span className="inline md:hidden block">Size: {item.size}, Color: {item.color}</span>
                          </span>
                          <span className="text-[12px] text-[#a5b2c7] mt-0.5 select-none">
                            Seller: {item.seller}
                          </span>

                          {/* Remove and Save actions (Desktop only) */}
                          <div className="hidden md:flex items-center gap-4 mt-3 select-none">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-[#eb001b] font-semibold text-xs border border-gray-200 rounded px-2.5 py-1 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer bg-white"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => handleSaveForLater(item.id)}
                              className="text-brand-blue font-semibold text-xs border border-gray-200 rounded px-2.5 py-1 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer bg-white"
                            >
                              Save for later
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price & Quantity Selection */}
                      <div className="flex md:flex-col items-center sm:items-end w-full sm:w-auto mt-2 md:mt-0 justify-between select-none pl-[84px] md:pl-0">
                        {/* Quantity Controls */}
                        <div className="order-1 md:order-2">
                          {/* Quantity increment/decrement buttons (Mobile only) */}
                          <div className="flex md:hidden items-center border border-[#e3e8ee] rounded overflow-hidden bg-white shadow-sm h-[32px]">
                            <button
                              className="px-3 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 border-r border-[#e3e8ee]"
                              onClick={() => handleQtyChange(item.id, Math.max(1, (item.quantity || item.qty || 1) - 1))}
                              disabled={(item.quantity || item.qty) <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <div className="w-10 h-full flex items-center justify-center text-[14px] font-medium text-[#1c1c1c]">
                              {item.quantity || item.qty}
                            </div>
                            <button
                              className="px-3 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer border-l border-[#e3e8ee]"
                              onClick={() => handleQtyChange(item.id, (item.quantity || item.qty || 0) + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Dropdown box (Desktop only) */}
                          <div className="relative hidden md:block">
                            <select
                              value={item.quantity || item.qty}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm bg-white outline-none cursor-pointer text-brand-dark font-medium hover:border-brand-blue transition-colors shadow-sm"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => (
                                <option key={n} value={n}>Qty: {n}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Price (order 2 on mobile, 1 on desktop) */}
                        <span className="text-[15px] md:text-lg font-bold md:font-semibold text-[#1c1c1c] block order-2 md:order-1 mt-0 md:mb-1">
                          ${(item.price * (item.quantity || item.qty)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Actions footer row */}
                  <div className="hidden md:flex justify-between items-center pt-5 border-t border-gray-200 select-none">
                    <button
                      onClick={() => onNavigate('products')}
                      className="bg-brand-blue hover:bg-blue-700 text-white rounded-md py-2 px-5 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span>Back to shop</span>
                    </button>
                    <button
                      onClick={handleRemoveAll}
                      className="border border-gray-300 hover:border-red-200 hover:text-[#eb001b] text-brand-blue rounded-md py-2 px-5 text-sm font-semibold cursor-pointer bg-white transition-all shadow-sm"
                    >
                      Remove all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Badges and Customer properties bar */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 select-none mt-5 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-[#a5b2c7] flex-shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-brand-dark leading-tight">Secure payment</h4>
                  <p className="text-[11px] text-brand-gray mt-0.5 leading-normal">Have you ever finally just</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-[#a5b2c7] flex-shrink-0">
                  <Headphones size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-brand-dark leading-tight">Customer support</h4>
                  <p className="text-[11px] text-brand-gray mt-0.5 leading-normal">Have you ever finally just</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-[#a5b2c7] flex-shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-brand-dark leading-tight">Free delivery</h4>
                  <p className="text-[11px] text-brand-gray mt-0.5 leading-normal">Have you ever finally just</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Pricing Summary & Coupon (Span 3) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-0 md:gap-4 select-none">

            {/* Coupon Promo box (Desktop only) */}
            <div className="hidden md:block border border-gray-200 rounded-md p-4 bg-white shadow-sm">
              <span className="block text-xs font-semibold text-brand-gray mb-2">
                Have a coupon?
              </span>
              <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white text-xs shadow-sm">
                <input
                  type="text"
                  placeholder="Add coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 outline-none text-brand-dark bg-white font-medium focus:ring-1 focus:ring-brand-blue"
                />
                <button
                  onClick={applyCoupon}
                  className="border-l border-gray-300 px-4 py-2 hover:bg-gray-50 text-brand-blue font-bold cursor-pointer transition-colors bg-white shadow-sm active:bg-gray-100"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Subtotal Checkout Card */}
            <div className="bg-white md:bg-white md:border md:border-gray-200 rounded-none md:rounded-md pt-5 pb-5 px-4 md:p-5 shadow-none md:shadow-sm flex flex-col gap-3 text-[14px]">

              {/* Desktop labels */}
              <div className="hidden md:flex justify-between items-center text-brand-gray">
                <span>Subtotal:</span>
                <span className="font-medium text-brand-dark">${subtotal.toFixed(2)}</span>
              </div>
              <div className="hidden md:flex justify-between items-center text-brand-gray">
                <span>Discount:</span>
                <span className="font-medium text-[#eb001b] font-semibold">-${discountVal.toFixed(2)}</span>
              </div>

              {/* Mobile labels */}
              <div className="md:hidden flex justify-between items-center text-[#8b96a5]">
                <span>Items ({cartItems.reduce((acc, i) => acc + (i.quantity || i.qty || 0), 0)}):</span>
                <span className="font-medium text-[#1c1c1c]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="md:hidden flex justify-between items-center text-[#8b96a5]">
                <span>Shipping:</span>
                <span className="font-medium text-[#1c1c1c]">$10.00</span>
              </div>

              {/* Shared Tax */}
              <div className="flex justify-between items-center text-[#8b96a5] md:text-brand-gray">
                <span>Tax:</span>
                <span className="font-medium text-[#1c1c1c] md:text-brand-dark md:text-[#00b517] md:font-semibold">${tax.toFixed(2)}</span>
              </div>

              <hr className="border-gray-200 md:border-gray-100 hidden md:block" />

              <div className="flex justify-between items-baseline pt-2 md:pt-1">
                <span className="font-bold text-[#1c1c1c] md:text-brand-dark text-[16px]">Total:</span>
                <span className="font-bold text-[#1c1c1c] md:text-brand-dark text-[16px] md:text-xl leading-none">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Green checkout button */}
              <button
                onClick={() => onNavigate('checkout')}
                className="bg-[#00b517] hover:bg-[#009b13] text-white rounded-md py-3 md:py-3 text-center font-bold text-[15px] md:text-base cursor-pointer shadow-sm transition-colors w-full mt-4 md:mt-4"
              >
                <span className="hidden md:inline">Checkout</span>
                <span className="md:hidden">Checkout ({cartItems.reduce((acc, i) => acc + (i.quantity || i.qty || 0), 0)} items)</span>
              </button>

              {/* Payments cards row (Desktop only) */}
              <div className="hidden md:flex items-center justify-center gap-2 mt-4 select-none opacity-80">
                <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">Visa</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">MC</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">PayPal</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">Apple</span>
              </div>
            </div>

          </div>

        </div>

        {/* Saved For Later Grid Section */}
        <div className="mt-0 md:mt-10 select-none bg-transparent">
          <h3 className="font-bold text-[16px] md:text-xl text-[#1c1c1c] md:text-brand-dark mb-3 px-4 md:px-0 pt-4 md:pt-0">
            Saved for later
          </h3>

          {savedItems.length === 0 ? (
            <div className="text-center py-6 text-brand-gray text-sm bg-white border border-gray-200 rounded-md select-none mx-4 md:mx-0">
              No items saved for later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-5 px-3 md:px-0 bg-transparent">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-all group flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-0 cursor-pointer"
                >
                  {/* Item Image */}
                  <div className="w-[72px] h-[72px] md:w-full md:h-[140px] flex items-center justify-center md:p-3 select-none mb-0 md:mb-3 overflow-hidden bg-white flex-shrink-0 rounded-md">
                    <img
                      src={item.img}
                      alt={item.title}
                      className={`max-h-[95%] max-w-[95%] object-contain transition-transform duration-300 group-hover:scale-105 ${item.img === tech7 ? 'scale-[1.35]' :
                        item.img === tech2 ? 'scale-[1.3]' :
                          item.img === tech6 ? 'scale-[1.25]' :
                            item.img === tech5 ? 'scale-[1.1]' : ''
                        }`}
                    />
                  </div>

                  {/* Details and Actions */}
                  <div className="flex-1 flex flex-col justify-between h-full py-0">
                    <div className="flex flex-col">
                      <h4 className="text-[14px] md:text-xs text-[#1c1c1c] md:text-brand-gray md:group-hover:text-brand-blue transition-colors leading-snug line-clamp-1 md:line-clamp-2 order-1 md:order-2 md:mt-1 pr-2">
                        {item.title}
                      </h4>
                      <span className="text-[15px] md:text-base font-bold text-[#1c1c1c] md:text-brand-dark block order-2 md:order-1 mt-0.5 md:mt-0">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 md:mt-4">
                      {/* Move to cart action button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMoveToCart(item); }}
                        className="flex-1 border border-gray-300 md:border-gray-300 md:hover:border-brand-blue text-brand-blue rounded px-1 py-[5px] md:py-2 text-center text-[12px] md:text-xs font-semibold transition-all bg-white flex items-center justify-center gap-1.5 cursor-pointer hover:bg-blue-50 leading-tight"
                      >
                        <span className="hidden md:inline"><ShoppingCart size={13} /></span>
                        <span>Move to cart</span>
                      </button>

                      {/* Remove button (Mobile only) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSavedItems(prev => prev.filter(i => i.id !== item.id)); }}
                        className="md:hidden border border-gray-300 text-[#eb001b] rounded px-3 py-[5px] text-center text-[12px] font-medium transition-all bg-white cursor-pointer hover:bg-red-50 leading-tight"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vibrant Blue Promo Banner */}
        <div className="bg-[#237cff] md:bg-gradient-to-r md:from-brand-blue md:to-blue-700 mx-4 md:mx-0 rounded-md p-6 md:p-7 text-white flex flex-col items-start md:flex-row justify-between md:items-center gap-4 md:gap-6 shadow-md relative overflow-hidden select-none mt-6 mb-4 md:mt-10">
          {/* Subtle design element */}
          <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-white opacity-[0.03] transform skew-x-12 hidden md:block"></div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">
              Super discount on more than 100 USD
            </h2>
            <p className="text-white opacity-85 text-[13px] md:text-sm mt-1.5">
              Have you ever finally just write dummy info
            </p>
          </div>

          <button className="bg-[#ff9017] hover:bg-orange-600 text-white font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-md transition-colors shadow-sm flex-shrink-0 cursor-pointer text-[15px]">
            Shop now
          </button>
        </div>

      </div>
    </main>
  );
};

export default Cart;
