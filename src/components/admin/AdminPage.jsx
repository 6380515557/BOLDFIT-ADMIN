import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, TrendingUp, Users, ShoppingBag, Eye, Edit3, Trash2, Filter, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminPage() {
  const navigate = useNavigate();
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showMobileTable, setShowMobileTable] = useState(false);

  const categories = ['All', 'Shirts', 'Pants', 'T-Shirts'];

  const [products, setProducts] = useState([
    { id: 1, name: 'Premium Cotton Shirt', price: 1299, stock: 45, status: 'Active', category: 'Shirts', sales: 128 },
    { id: 2, name: 'Casual Denim Pants', price: 1899, stock: 32, status: 'Active', category: 'Pants', sales: 95 },
    { id: 3, name: 'Classic White T-Shirt', price: 599, stock: 78, status: 'Active', category: 'T-Shirts', sales: 204 },
    { id: 4, name: 'Formal Black Shirt', price: 1599, stock: 28, status: 'Active', category: 'Shirts', sales: 87 },
    { id: 5, name: 'Slim Fit Chinos', price: 1399, stock: 15, status: 'Low Stock', category: 'Pants', sales: 62 },
    { id: 6, name: 'Graphic Print Tee', price: 799, stock: 0, status: 'Out of Stock', category: 'T-Shirts', sales: 156 }
  ]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize <= 768;
  const isTablet = screenSize <= 1024 && screenSize > 768;

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalSales = products.reduce((sum, product) => sum + product.sales, 0);
  const lowStockProducts = products.filter(product => product.stock < 20).length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Low Stock':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Out of Stock':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  // Responsive styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: isMobile ? '12px' : isTablet ? '16px' : '20px',
      fontFamily: "'Inter', sans-serif"
    },

    header: {
      maxWidth: '1400px',
      margin: '0 auto',
      marginBottom: isMobile ? '24px' : '40px',
      textAlign: isMobile ? 'center' : 'left'
    },

    title: {
      fontSize: isMobile ? '28px' : isTablet ? '36px' : '42px',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px',
      lineHeight: '1.2'
    },

    subtitle: {
      fontSize: isMobile ? '14px' : '18px',
      color: '#64748b',
      fontWeight: '500'
    },

    statsGrid: {
      maxWidth: '1400px',
      margin: '0 auto',
      marginBottom: isMobile ? '24px' : '40px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '16px' : '24px'
    },

    statCard: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '20px' : '32px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f1f5f9',
      textAlign: 'center',
      transition: 'transform 0.3s ease'
    },

    statIconContainer: {
      width: isMobile ? '48px' : '64px',
      height: isMobile ? '48px' : '64px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      marginBottom: isMobile ? '12px' : '20px'
    },

    statNumber: {
      fontSize: isMobile ? '24px' : '36px',
      fontWeight: '800',
      marginBottom: '8px'
    },

    statLabel: {
      fontSize: isMobile ? '14px' : '16px',
      color: '#64748b',
      fontWeight: '500'
    },

    controlsSection: {
      maxWidth: '1400px',
      margin: '0 auto',
      marginBottom: isMobile ? '20px' : '32px',
      backgroundColor: 'white',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '20px' : '32px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f1f5f9'
    },

    controlsHeader: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      marginBottom: '24px',
      gap: isMobile ? '16px' : '0'
    },

    controlsTitle: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },

    addProductButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: isMobile ? '14px 24px' : '16px 32px',
      borderRadius: '16px',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
      transition: 'all 0.3s ease',
      width: isMobile ? '100%' : 'auto'
    },

    filtersContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '16px',
      alignItems: isMobile ? 'stretch' : 'center'
    },

    filterLabel: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: isMobile ? '8px' : '0'
    },

    categoryButtons: {
      display: 'flex',
      gap: isMobile ? '8px' : '12px',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },

    categoryButton: {
      padding: isMobile ? '8px 16px' : '12px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: isMobile ? '60px' : 'auto'
    },

    productsSection: {
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '16px' : '32px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f1f5f9'
    },

    productsHeader: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      marginBottom: '32px',
      gap: isMobile ? '12px' : '0'
    },

    productsTitle: {
      fontSize: isMobile ? '18px' : '24px',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },

    productsCount: {
      fontSize: '16px',
      color: '#64748b',
      fontWeight: '500'
    },

    // Mobile Card Style for Products
    mobileProductCard: {
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #e2e8f0'
    },

    mobileProductName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },

    mobileProductRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      fontSize: '14px'
    },

    mobileProductLabel: {
      color: '#64748b',
      fontWeight: '500'
    },

    mobileProductValue: {
      color: '#374151',
      fontWeight: '600'
    },

    mobileActionsContainer: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
      marginTop: '12px'
    },

    actionButton: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },

    emptyState: {
      textAlign: 'center',
      padding: isMobile ? '40px 20px' : '60px 20px',
      color: '#64748b'
    },

    emptyStateText: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '500'
    }
  };

  // Mobile Product Card Component
  const MobileProductCard = ({ product }) => (
    <div style={styles.mobileProductCard}>
      <div style={styles.mobileProductName}>{product.name}</div>
      
      <div style={styles.mobileProductRow}>
        <span style={styles.mobileProductLabel}>Price:</span>
        <span style={styles.mobileProductValue}>₹{product.price.toLocaleString()}</span>
      </div>
      
      <div style={styles.mobileProductRow}>
        <span style={styles.mobileProductLabel}>Stock:</span>
        <span style={styles.mobileProductValue}>{product.stock}</span>
      </div>
      
      <div style={styles.mobileProductRow}>
        <span style={styles.mobileProductLabel}>Sales:</span>
        <span style={styles.mobileProductValue}>{product.sales}</span>
      </div>
      
      <div style={styles.mobileProductRow}>
        <span style={styles.mobileProductLabel}>Status:</span>
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          ...getStatusColor(product.status)
        }}>
          {product.status}
        </span>
      </div>
      
      <div style={styles.mobileProductRow}>
        <span style={styles.mobileProductLabel}>Category:</span>
        <span style={styles.mobileProductValue}>{product.category}</span>
      </div>
      
      <div style={styles.mobileActionsContainer}>
        <button 
          style={{
            ...styles.actionButton,
            backgroundColor: '#dbeafe',
            color: '#1d4ed8'
          }}
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <Eye size={14} />
        </button>
        <button 
          style={{
            ...styles.actionButton,
            backgroundColor: '#fef3c7',
            color: '#d97706'
          }}
          onClick={() => navigate(`/admin/edit-product/${product.id}`)}
        >
          <Edit3 size={14} />
        </button>
        <button 
          style={{
            ...styles.actionButton,
            backgroundColor: '#fee2e2',
            color: '#dc2626'
          }}
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this product?')) {
              setProducts(products.filter(p => p.id !== product.id));
            }
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Manage your products, inventory, and sales</p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIconContainer, backgroundColor: '#dbeafe'}}>
            <Package size={isMobile ? 24 : 32} color="#3b82f6" />
          </div>
          <div style={{...styles.statNumber, color: '#3b82f6'}}>{totalProducts}</div>
          <div style={styles.statLabel}>Total Products</div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIconContainer, backgroundColor: '#dcfce7'}}>
            <ShoppingBag size={isMobile ? 24 : 32} color="#10b981" />
          </div>
          <div style={{...styles.statNumber, color: '#10b981'}}>{totalStock}</div>
          <div style={styles.statLabel}>Total Stock</div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIconContainer, backgroundColor: '#fef3c7'}}>
            <TrendingUp size={isMobile ? 24 : 32} color="#f59e0b" />
          </div>
          <div style={{...styles.statNumber, color: '#f59e0b'}}>{totalSales}</div>
          <div style={styles.statLabel}>Total Sales</div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIconContainer, backgroundColor: '#fee2e2'}}>
            <Users size={isMobile ? 24 : 32} color="#ef4444" />
          </div>
          <div style={{...styles.statNumber, color: '#ef4444'}}>{lowStockProducts}</div>
          <div style={styles.statLabel}>Low Stock Alert</div>
        </div>
      </div>

      {/* Controls Section */}
      <div style={styles.controlsSection}>
        <div style={styles.controlsHeader}>
          <h2 style={styles.controlsTitle}>Product Management</h2>
          <button 
            style={styles.addProductButton}
            onClick={() => navigate('/admin/add-product')}
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>

        <div style={styles.filtersContainer}>
          <div style={styles.filterLabel}>
            <Filter size={16} />
            Category:
          </div>
          <div style={styles.categoryButtons}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === category
                    ? {
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }
                    : {
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        border: '1px solid #e2e8f0'
                      })
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div style={styles.productsSection}>
        <div style={styles.productsHeader}>
          <h2 style={styles.productsTitle}>
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>
          <div style={styles.productsCount}>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          isMobile ? (
            // Mobile Card Layout
            <div>
              {filteredProducts.map((product) => (
                <MobileProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            // Desktop/Tablet Table Layout
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'left' }}>Product Name</th>
                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'left' }}>Price</th>
                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'left' }}>Stock</th>
                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'left' }}>Sales</th>
                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.3s ease'
                      }}
                    >
                      <td style={{ padding: '20px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '20px', fontSize: '14px', color: '#374151' }}>
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td style={{ padding: '20px', fontSize: '14px', color: '#374151' }}>
                        {product.stock}
                      </td>
                      <td style={{ padding: '20px', fontSize: '14px', color: '#374151' }}>
                        {product.sales}
                      </td>
                      <td style={{ padding: '20px', fontSize: '14px', color: '#374151' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          ...getStatusColor(product.status)
                        }}>
                          {product.status}
                        </span>
                      </td>
                      <td style={{ padding: '20px', fontSize: '14px', color: '#374151' }}>
                        {product.category}
                      </td>
                      <td style={{ padding: '20px', fontSize: '14px', color: '#374151' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#fef3c7',
                              color: '#d97706',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                setProducts(products.filter(p => p.id !== product.id));
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div style={styles.emptyState}>
            <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={styles.emptyStateText}>
              No products found in {selectedCategory.toLowerCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
