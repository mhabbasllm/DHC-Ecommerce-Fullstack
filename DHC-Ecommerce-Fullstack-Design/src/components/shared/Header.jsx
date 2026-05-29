import React, { useState } from 'react';
import {
  User,
  MessageSquare,
  Heart,
  ShoppingCart,
  Menu,
  ChevronDown,
  X,
  Home,
  Grid3X3,
  ClipboardList,
  Globe,
  Phone,
  Info,
  Search,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';
import { useCart } from '../CartContext';
import logo from '../../assets/Layout/Brand/logo-colored.png';
import flagDE from '../../assets/Layout1/Image/flags/DE@2x.png';

const Header = ({ onNavigate, currentPage }) => {
  const { cartCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hasOwnMobileHeader = ['products', 'product-details', 'cart'].includes(currentPage);
  const { isAuthenticated, user, logout } = useAuth();

  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin') || roles.includes('SuperAdmin');

  const [searchQuery, setSearchQuery] = useState('');

  const handleLogoClick = () => {
    if (onNavigate) onNavigate('home');
  };

  const handleProductsClick = (query) => {
    const finalQuery = typeof query === 'string' ? query : searchQuery;
    if (onNavigate) onNavigate('products', { searchQuery: finalQuery });
  };

  const handleDrawerNav = (page) => {
    setDrawerOpen(false);
    if (onNavigate) onNavigate(page);
  };

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate('home');
  };

  return (
    <>
      {/* ======== DESKTOP HEADER (hidden on mobile) ======== */}
      <header className="bg-white border-b border-gray-200 py-4 hidden md:block">
        <div className="container flex items-center justify-between gap-5">
          <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
            <img src={logo} alt="Brand Logo" className="h-10 animate-fade-in" />
          </div>

          {currentPage !== 'cart' && (
            <div className="flex-1 flex max-w-[600px]">
              <input
                type="text"
                className="flex-1 px-4 py-2 border-2 border-brand-blue rounded-l-md outline-none text-brand-dark"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProductsClick()}
              />
              <div
                className="px-4 py-2 border-2 border-brand-blue border-l-0 bg-white cursor-pointer flex items-center gap-1 text-brand-gray select-none hover:bg-gray-50 transition-colors"
                onClick={() => handleProductsClick()}
              >
                All category <ChevronDown size={16} />
              </div>
              <button
                className="bg-brand-blue text-white px-6 py-2 rounded-r-md font-semibold hover:bg-blue-700 transition-colors"
                onClick={() => handleProductsClick()}
              >
                Search
              </button>
            </div>
          )}

          <div className="flex gap-5">
            {[
              isAdmin && { icon: <Shield size={20} className="text-brand-blue" />, label: 'Admin', onClick: () => onNavigate('admin') },
              isAuthenticated && user
                ? {
                  icon: (
                    <div className="w-5 h-5 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                  ),
                  label: 'Logout',
                  onClick: handleLogout
                }
                : { icon: <User size={20} />, label: 'Profile', onClick: () => onNavigate('login') },
              { icon: <MessageSquare size={20} />, label: 'Message', onClick: () => onNavigate('home') },
              { icon: <Heart size={20} />, label: 'Orders', onClick: () => onNavigate('orders') },
              {
                icon: (
                  <div className="relative">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                        {cartCount}
                      </span>
                    )}
                  </div>
                ),
                label: 'My cart',
                onClick: () => onNavigate('cart')
              },
            ].filter(Boolean).map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-xs text-brand-gray gap-1 cursor-pointer hover:text-brand-blue transition-colors group"
                onClick={item.onClick || undefined}
                title={item.label === 'Logout' && user ? `Logged in as ${user.fullName}` : undefined}
              >
                <div className="group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ======== DESKTOP NAV BAR (hidden on mobile, hidden on cart page) ======== */}
      {currentPage !== 'cart' && (
        <nav className="bg-white border-b border-gray-200 py-2.5 select-none hidden md:block">
          <div className="container flex justify-between items-center">
            <div className="flex gap-6 font-medium text-brand-dark">
              <span className="flex items-center gap-1 cursor-pointer group" onClick={handleProductsClick}>
                <Menu size={18} className="text-brand-dark" />
                <span className="group-hover:text-brand-blue transition-colors">All category</span>
              </span>
              <span className="cursor-pointer hover:text-brand-blue transition-colors" onClick={handleProductsClick}>Hot offers</span>
              <span className="cursor-pointer hover:text-brand-blue transition-colors" onClick={handleProductsClick}>Gift boxes</span>
              <span className="cursor-pointer hover:text-brand-blue transition-colors" onClick={handleProductsClick}>Projects</span>
              <span className="cursor-pointer hover:text-brand-blue transition-colors" onClick={handleProductsClick}>Menu item</span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-brand-blue transition-colors">Help <ChevronDown size={14} /></span>
            </div>
            <div className="flex gap-5 font-medium text-brand-dark">
              {isAdmin && (
                <span className="flex items-center gap-1 cursor-pointer text-brand-blue font-bold hover:underline" onClick={() => onNavigate('admin')}>
                  <Shield size={14} /> Admin Panel
                </span>
              )}
              <span className="flex items-center gap-1 cursor-pointer hover:text-brand-blue transition-colors">English, USD <ChevronDown size={14} /></span>
              <span className="flex items-center gap-2 cursor-pointer hover:text-brand-blue transition-colors">
                Ship to <img src={flagDE} alt="DE" className="w-5 object-contain" /> <ChevronDown size={14} />
              </span>
            </div>
          </div>
        </nav>
      )}

      {/* ======== MOBILE HEADER (visible only on mobile, hidden when page has own header) ======== */}
      {!hasOwnMobileHeader && (
        <header className="bg-white border-b border-gray-200 py-3 px-4 md:hidden">
          {/* Top row: hamburger, logo, cart + user */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-brand-dark p-1 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
                <img src={logo} alt="Brand Logo" className="h-8 animate-fade-in" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart
                  size={22}
                  className="text-brand-dark cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => onNavigate('cart')}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              {isAuthenticated && user ? (
                <div
                  className="w-7 h-7 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-blue-600 transition-colors"
                  onClick={handleLogout}
                  title={`Logout from ${user.fullName}`}
                >
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User
                  size={22}
                  className="text-brand-dark cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => onNavigate('login')}
                />
              )}
            </div>
          </div>

          {/* Search bar row */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <div className="pl-3 flex items-center text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="flex-1 px-2 py-2 outline-none text-brand-dark text-sm bg-white"
              placeholder="Search"
              onKeyDown={(e) => e.key === 'Enter' && handleProductsClick()}
            />
          </div>

          {/* Category pills row */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 select-none">
            {['All category', 'Gadgets', 'Clothes', 'Accessories', 'Electronics'].map((cat, idx) => (
              <span
                key={idx}
                className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-md border cursor-pointer transition-colors flex-shrink-0 ${idx === 0
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-brand-dark border-gray-300 hover:border-brand-blue hover:text-brand-blue'
                  }`}
                onClick={handleProductsClick}
              >
                {cat}
              </span>
            ))}
          </div>
        </header>
      )}

      {/* ======== MOBILE DRAWER OVERLAY ======== */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Drawer panel */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {isAuthenticated && user ? (
                  <>
                    <div className="w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-base">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-brand-dark">Hi, {user.fullName}</span>
                      <button
                        onClick={() => {
                          setDrawerOpen(false);
                          handleLogout();
                        }}
                        className="text-xs text-red-500 font-semibold hover:underline block text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-400" />
                    </div>
                    <span
                      className="text-sm font-medium text-brand-dark cursor-pointer hover:text-brand-blue"
                      onClick={() => handleDrawerNav('login')}
                    >
                      Sign in | Register
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-brand-dark cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer navigation links */}
            <nav className="flex-1 overflow-y-auto py-3">
              <ul className="px-4 space-y-1">
                {[
                  { icon: <Home size={18} />, label: 'Home', page: 'home' },
                  isAdmin && { icon: <Shield size={18} className="text-brand-blue" />, label: 'Admin Panel', page: 'admin' },
                  { icon: <Grid3X3 size={18} />, label: 'Categories', page: 'products' },
                  { icon: <Heart size={18} />, label: 'Favorites', page: 'products' },
                  { icon: <ClipboardList size={18} />, label: 'My orders', page: 'orders' },
                ].filter(Boolean).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-brand-dark font-medium rounded-md cursor-pointer hover:bg-blue-50 hover:text-brand-blue transition-colors"
                    onClick={() => handleDrawerNav(item.page)}
                  >
                    <span className="text-brand-gray">{item.icon}</span>
                    {item.label}
                  </li>
                ))}
              </ul>

              <hr className="my-3 mx-4 border-gray-100" />

              <ul className="px-4 space-y-1">
                {[
                  { icon: <Globe size={18} />, label: 'English | USD', page: 'home' },
                  { icon: <Phone size={18} />, label: 'Contact us', page: 'home' },
                  { icon: <Info size={18} />, label: 'About', page: 'home' },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-brand-dark font-medium rounded-md cursor-pointer hover:bg-blue-50 hover:text-brand-blue transition-colors"
                    onClick={() => handleDrawerNav(item.page)}
                  >
                    <span className="text-brand-gray">{item.icon}</span>
                    {item.label}
                  </li>
                ))}
              </ul>

              <hr className="my-3 mx-4 border-gray-100" />

              <ul className="px-7 space-y-2.5">
                {['User agreement', 'Partnership', 'Privacy policy'].map((link, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-brand-gray cursor-pointer hover:text-brand-blue transition-colors"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
