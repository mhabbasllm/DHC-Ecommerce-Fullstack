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
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { CartProvider } from './components/CartContext';
import './App.css';

const AppContent = ({ currentPage, setCurrentPage, navigateTo }) => {
  const pageName = typeof currentPage === 'string' ? currentPage : currentPage?.name;
  const { isAuthenticated } = useAuth();

  // Protected Routes
  useEffect(() => {
    if ((pageName === 'checkout' || pageName === 'orders') && !isAuthenticated) {
      navigateTo('login', { redirectTo: pageName });
    }
  }, [pageName, isAuthenticated, navigateTo]);

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
        {pageName === 'admin' && <Admin onNavigate={navigateTo} />}
      </div>
      {pageName !== 'admin' && <Footer />}
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const productDetailMatch = path.match(/^\/product-details\/([^/]+)$/);
      if (path === '/products') return 'products';
      if (productDetailMatch) return { name: 'product-details', productId: productDetailMatch[1] };
      if (path === '/product-details') return 'product-details';
      if (path === '/cart') return 'cart';
      if (path === '/checkout') return 'checkout';
      if (path === '/orders') return 'orders';
      if (path === '/login') return 'login';
      if (path === '/register') return 'register';
      if (path === '/admin') return 'admin';
      return 'home';
    }
    return 'home';
  });

  const getPageName = (page) => typeof page === 'string' ? page : page?.name;

  const navigateTo = (page, options = {}) => {
    const pageName = getPageName(page);
    const productId = options.productId || page?.productId;
    const searchQuery = options.searchQuery || page?.searchQuery;
    const redirectTo = options.redirectTo || page?.redirectTo;

    let nextPage = pageName;
    if (pageName === 'product-details' && productId) {
      nextPage = { name: 'product-details', productId };
    } else if (pageName === 'products' && searchQuery) {
      nextPage = { name: 'products', searchQuery };
    } else if (pageName === 'login' && redirectTo) {
      nextPage = { name: 'login', redirectTo };
    }

    setCurrentPage(nextPage);
    let newPath = '/';
    if (pageName === 'products') newPath = '/products';
    else if (pageName === 'product-details') newPath = productId ? `/product-details/${productId}` : '/product-details';
    else if (pageName === 'cart') newPath = '/cart';
    else if (pageName === 'checkout') newPath = '/checkout';
    else if (pageName === 'login') newPath = '/login';
    else if (pageName === 'register') newPath = '/register';
    else if (pageName === 'orders') newPath = '/orders';
    else if (pageName === 'admin') newPath = '/admin';

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
        const path = window.location.pathname;
        const productDetailMatch = path.match(/^\/product-details\/([^/]+)$/);
        if (path === '/products') setCurrentPage('products');
        else if (path === '/checkout') setCurrentPage('checkout');
        else if (productDetailMatch) setCurrentPage({ name: 'product-details', productId: productDetailMatch[1] });
        else if (path === '/product-details') setCurrentPage('product-details');
        else if (path === '/cart') setCurrentPage('cart');
        else if (path === '/login') setCurrentPage('login');
        else if (path === '/register') setCurrentPage('register');
        else if (path === '/orders') setCurrentPage('orders');
        else if (path === '/admin') setCurrentPage('admin');
        else setCurrentPage('home');
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
