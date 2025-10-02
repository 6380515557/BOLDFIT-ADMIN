import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Cookie utility functions
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; SameSite=Strict`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check both localStorage and cookies for backward compatibility
      let token = localStorage.getItem('authToken') || getCookie('authToken');
      let adminData = localStorage.getItem('adminData') || getCookie('adminData');

      if (token && adminData) {
        // Parse adminData if it's a string
        const parsedAdminData = typeof adminData === 'string' ? JSON.parse(adminData) : adminData;
        
        // Optionally verify token with backend
        const isValid = await verifyToken(token);
        if (isValid) {
          setIsAuthenticated(true);
          setAdmin(parsedAdminData);
          
          // Ensure data is stored in both localStorage and cookies
          localStorage.setItem('authToken', token);
          localStorage.setItem('adminData', typeof adminData === 'string' ? adminData : JSON.stringify(adminData));
          setCookie('authToken', token, 7); // 7 days
          setCookie('adminData', typeof adminData === 'string' ? adminData : JSON.stringify(adminData), 7);
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://boltfit-backend-r4no.onrender.com/api/v1'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const login = async (googleCredential) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://boltfit-backend-r4no.onrender.com/api/v1'}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: googleCredential
        })
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.detail || `Login failed with status ${response.status}`);
      }

      // Store auth data in both localStorage and cookies
      const token = data.access_token;
      const adminData = JSON.stringify(data.admin);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('adminData', adminData);
      setCookie('authToken', token, 7); // 7 days
      setCookie('adminData', adminData, 7);
      
      setIsAuthenticated(true);
      setAdmin(data.admin);

      return {
        message: data.message,
        admin: data.admin,
        accessToken: data.access_token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const clearAuthData = () => {
    // Clear from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
    
    // Clear from cookies
    deleteCookie('authToken');
    deleteCookie('adminData');
    
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const getToken = () => {
    return localStorage.getItem('authToken') || getCookie('authToken');
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
