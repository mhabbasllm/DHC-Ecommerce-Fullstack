import React, { useState, useEffect } from 'react';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import MainBody from './components/MainBody';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Checkout from './components/Checkout';
import MyOrders from './components/MyOrders';
import Admin from './components/Admin/index.jsx';
import NotFound from './components/shared/NotFound';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { CartProvider } from './components/CartContext';
import './App.css';

const KNOWN_PAGES = ['home', 'products', 'product-details', 'cart', 'checkout', 'login', 'register', 'orders', 'admin'];
const ADMIN_TABS = ['dashboard', 'products', 'orders', 'suppliers', 'users', 'notifications'];
const ADMIN_ROUTE_ACTIONS = {
  dashboard: [],
  products: ['new', 'edit'],
  orders: ['details'],
  suppliers: ['new', 'edit'],
  users: ['new'],
  notifications: [],
};

const parseAdminPath = (path) => {
  if (path === '/admin') return 'admin';

  const parts = path.split('/').filter(Boolean).map(part => decodeURIComponent(part));
  if (parts[0] !== 'admin') return null;

  const adminTab = parts[1] || 'dashboard';
  if (!ADMIN_TABS.includes(adminTab)) return '404';

  const adminAction = parts[2];
  const adminId = parts[3];
  const hasExtraParts = parts.length > 4;
  const allowedActions = ADMIN_ROUTE_ACTIONS[adminTab] || [];

  if (hasExtraParts) return '404';
  if (!adminAction) return { name: 'admin', adminTab };
  if (!allowedActions.includes(adminAction)) return '404';
  if (['edit', 'details'].includes(adminAction) && !adminId) return '404';
  if (adminAction === 'new' && adminId) return '404';

  return {
    name: 'admin',
    adminTab,
    adminAction,
    ...(adminId ? { adminId } : {})
  };
};

const parsePathToPage = (path) => {
  if (path === '/') return 'home';
  if (path === '/products') return 'products';

  const productDetailMatch = path.match(/^\/product-details\/([^/]+)$/);
  if (productDetailMatch) return { name: 'product-details', productId: decodeURIComponent(productDetailMatch[1]) };

  const adminPage = parseAdminPath(path);
  if (adminPage) return adminPage;

  if (path === '/cart') return 'cart';
  if (path === '/checkout') return 'checkout';
  if (path === '/orders') return 'orders';
  if (path === '/login') return 'login';
  if (path === '/register') return 'register';
  if (path === '/404') return '404';

  return '404';
};

const AppContent = ({ currentPage, setCurrentPage, navigateTo }) => {
  const pageName = typeof currentPage === 'string' ? currentPage : currentPage?.name;
  const adminTab = currentPage?.adminTab || 'dashboard';
  const adminAction = currentPage?.adminAction;
  const adminId = currentPage?.adminId;
  // Protected Routes
  const { user, isAuthenticated, isLoading } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('Admin') || roles.includes('SuperAdmin');

  useEffect(() => {
    if (isLoading) return;

    if ((pageName === 'checkout' || pageName === 'orders') && !isAuthenticated) {
      navigateTo('login', { redirectTo: pageName });
    }

    if (pageName === 'admin') {
      if (!isAuthenticated) {
        navigateTo('login', { redirectTo: 'admin' });
      } else if (!isAdmin) {
        navigateTo('home');
      }
    }
  }, [pageName, isAuthenticated, isAdmin, isLoading, navigateTo]);

  const isUnknownPage = !KNOWN_PAGES.includes(pageName);

  return (
    <div className={`min-h-screen ${pageName === 'admin' ? 'bg-[#f1f5f9]' : 'bg-bg-main'} flex flex-col justify-between`}>
      <div>
        {pageName !== 'admin' && <Header onNavigate={navigateTo} currentPage={pageName} />}
        {pageName === 'home' && <MainBody onNavigate={navigateTo} />}
        {pageName === 'products' && <ProductList onNavigate={navigateTo} initialSearchQuery={currentPage?.searchQuery} />}
        {pageName === 'product-details' && <ProductDetails onNavigate={navigateTo} productId={currentPage.productId} />}
        {pageName === 'cart' && <Cart onNavigate={navigateTo} />}
        {pageName === 'checkout' && isAuthenticated && <Checkout onNavigate={navigateTo} />}
        {pageName === 'login' && <Login onNavigate={navigateTo} redirectTo={currentPage?.redirectTo} />}
        {pageName === 'register' && <Register onNavigate={navigateTo} />}
        {pageName === 'orders' && isAuthenticated && <MyOrders onNavigate={navigateTo} />}
        {pageName === 'admin' && <Admin onNavigate={navigateTo} initialTab={adminTab} initialAction={adminAction} initialId={adminId} />}
        {isUnknownPage && <NotFound onNavigate={navigateTo} />}
      </div>
      {pageName !== 'admin' && <Footer />}
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return parsePathToPage(window.location.pathname);
    }
    return 'home';
  });

  const getPageName = (page) => typeof page === 'string' ? page : page?.name;

  const navigateTo = (page, options = {}) => {
    const pageName = getPageName(page);
    const productId = options.productId || page?.productId;
    const searchQuery = options.searchQuery || page?.searchQuery;
    const redirectTo = options.redirectTo || page?.redirectTo;
    const adminTab = options.adminTab || page?.adminTab;
    const adminAction = options.adminAction || page?.adminAction;
    const adminId = options.adminId || page?.adminId;

    let nextPage = pageName;
    if (pageName === 'product-details' && productId) {
      nextPage = { name: 'product-details', productId };
    } else if (pageName === 'product-details') {
      nextPage = '404';
    } else if (pageName === 'products' && searchQuery) {
      nextPage = { name: 'products', searchQuery };
    } else if (pageName === 'login' && redirectTo) {
      nextPage = { name: 'login', redirectTo };
    } else if (pageName === 'admin' && adminTab) {
      nextPage = { name: 'admin', adminTab };
      if (adminAction) nextPage.adminAction = adminAction;
      if (adminId) nextPage.adminId = adminId;
    }

    setCurrentPage(nextPage);
    let newPath = '/';
    const nextPageName = getPageName(nextPage);
    if (nextPageName === 'products') newPath = '/products';
    else if (nextPageName === 'product-details') newPath = `/product-details/${productId}`;
    else if (pageName === 'cart') newPath = '/cart';
    else if (pageName === 'checkout') newPath = '/checkout';
    else if (pageName === 'login') newPath = '/login';
    else if (pageName === 'register') newPath = '/register';
    else if (pageName === 'orders') newPath = '/orders';
    else if (nextPageName === 'admin') {
      newPath = adminTab ? `/admin/${adminTab}` : '/admin';
      if (adminAction) newPath += `/${adminAction}`;
      if (adminId) newPath += `/${adminId}`;
    }
    else if (nextPageName === '404') newPath = '/404';

    if (window.location.pathname !== newPath) {
      window.history.pushState({ page: nextPage }, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      } else {
        setCurrentPage(parsePathToPage(window.location.pathname));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <CartProvider>
      <AuthProvider>
        <AppContent currentPage={currentPage} setCurrentPage={setCurrentPage} navigateTo={navigateTo} />
      </AuthProvider>
    </CartProvider>
  );
};

export default App;
