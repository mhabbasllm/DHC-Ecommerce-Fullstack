const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5237/api/Auth';
const TOKEN_KEY = 'authToken';
const USER_EMAIL_KEY = 'userEmail';
const STORAGE_KEY = 'authStorage';

const readStoredValue = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);

const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_EMAIL_KEY);
};

const getErrorMessage = async (response, fallbackMessage) => {
  const text = await response.text();

  if (!text) {
    return fallbackMessage;
  }

  try {
    const data = JSON.parse(text);

    if (typeof data === 'string') {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (Array.isArray(data)) {
      return data
        .map((item) => item.description || item.message || item.code)
        .filter(Boolean)
        .join(' ');
    }

    if (data?.errors) {
      return Object.values(data.errors).flat().join(' ');
    }
  } catch {
    return text;
  }

  return fallbackMessage;
};

const authService = {
  // Register a new user
  register: async (firstName, lastName, email, password, gender = 'Other') => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          gender,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Registration failed'));
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (email, password, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Login failed'));
      }

      const data = await response.json();

      // Store JWT token
      if (data.token) {
        clearStoredAuth();
        const storage = options.rememberMe ? localStorage : sessionStorage;
        localStorage.setItem(STORAGE_KEY, options.rememberMe ? 'local' : 'session');
        storage.setItem(TOKEN_KEY, data.token);
        storage.setItem(USER_EMAIL_KEY, email);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          authService.logout();
          return null;
        }
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Logout user
  logout: () => {
    clearStoredAuth();
  },

  // Get stored token
  getToken: () => {
    return readStoredValue(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  // Get user email from storage
  getUserEmail: () => {
    return readStoredValue(USER_EMAIL_KEY);
  },
};

export default authService;
