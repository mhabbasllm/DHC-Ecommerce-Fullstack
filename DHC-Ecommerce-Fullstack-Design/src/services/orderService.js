import authService from '../components/Auth/authService';

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5237/api')
  .replace(/\/+$/, '')
  .replace(/\/Auth$/i, '');

const ORDER_URL = `${API_ROOT}/Order`;
const CART_URL = `${API_ROOT}/Cart`;

const orderService = {
  // Clear cart in DB
  clearCartDB: async () => {
    const token = authService.getToken();
    if (!token) return;

    try {
      await fetch(`${CART_URL}/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to clear DB cart:', error);
    }
  },

  // Sync local cart to DB
  syncCartDB: async (cartItems) => {
    const token = authService.getToken();
    if (!token) return;

    try {
      // First clear the DB cart to avoid duplicates or messy merges
      await orderService.clearCartDB();

      // Add each item to DB
      for (const item of cartItems) {
        await fetch(CART_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity || item.qty,
            size: item.size || 'Medium',
            color: item.color || 'Standard',
            material: item.material || 'Standard',
            isSavedForLater: false
          })
        });
      }
    } catch (error) {
      console.error('Failed to sync cart to DB:', error);
      throw error;
    }
  },

  // Place order
  placeOrder: async (shippingAddress, couponCode = null) => {
    const token = authService.getToken();
    if (!token) throw new Error('You must be logged in to place an order.');

    try {
      const response = await fetch(`${ORDER_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress,
          couponCode
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to place order');
      }

      return await response.json();
    } catch (error) {
      console.error('Order placement failed:', error);
      throw error;
    }
  },

  // Validate coupon
  validateCoupon: async (code) => {
    try {
      const response = await fetch(`${ORDER_URL}/coupon/${code}`);
      const data = await response.json();

      if (!response.ok || !data.isValid) {
        throw new Error(data.message || 'Invalid coupon code');
      }

      return data; // { isValid, code, discountPercent }
    } catch (error) {
      console.error('Coupon validation failed:', error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async () => {
    const token = authService.getToken();
    if (!token) throw new Error('You must be logged in to view your orders.');

    try {
      const response = await fetch(ORDER_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  }
};

export default orderService;
