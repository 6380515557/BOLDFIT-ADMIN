import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

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
      const token = localStorage.getItem('authToken');
      const adminData = localStorage.getItem('adminData');
      
      if (token && adminData) {
        // Optionally verify token with backend
        const isValid = await verifyToken(token);
        
        if (isValid) {
          setIsAuthenticated(true);
          setAdmin(JSON.parse(adminData));
        } else {
          // Token is invalid, clear storage
          clearAuthData();
        }
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const login = (token, adminData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  const logout = () => {
    clearAuthData();
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const getToken = () => {
    return localStorage.getItem('authToken');
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
