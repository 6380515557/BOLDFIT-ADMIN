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

  // ✅ THIS IS THE MISSING LOGIN METHOD
  const login = async (googleCredential) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://boltfit-backend-r4no.onrender.com/api/v1'}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: googleCredential  // ✅ Match backend expectation
        })
      });

      // ✅ Handle empty response safely
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

      // ✅ Store auth data
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
      
      setIsAuthenticated(true);
      setAdmin(data.admin);

      // ✅ Return response for success callback
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
    login,     // ✅ Now includes the fetch logic
    logout,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
