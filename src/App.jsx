import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import AdminPage from './components/admin/AdminPage';
import AddProductPage from './components/admin/AddProductPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes - Admin Only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <ProtectedRoute>
                  <AddProductPage />
                </ProtectedRoute>
              }
            />
            
            {/* Default Route - Redirect to Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch All - Redirect to Login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
