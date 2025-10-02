import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./AdminPage.module.css";
import { 
  Eye, Edit3, Trash2, Plus, LogOut, Package, TrendingUp, 
  Save, X, Search, ShoppingBag, Star, Upload, Image as ImageIcon,
  Menu, MoreVertical
} from "lucide-react";

const API_BASE = "https://boltfit-backend-r4no.onrender.com/api/v1";
const IMGBB_API_KEY = "111466cad6108aa2657663cede57b1d3"; // Same as AddProductPage
const categories = ["Shirts", "T-Shirts", "Pants", "Trending"];
const commonSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const commonColors = ["Red", "Blue", "Green", "Black", "White", "Gray", "Yellow", "Orange", "Purple", "Pink", "Brown", "Navy"];

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/products/?page=1&perpage=100`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      setError("Failed to fetch products.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE}/products/${id}`, { 
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchProducts();
    } catch {
      setError("Failed to delete product.");
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setShowEditModal(true);
    setSelectedProduct(product);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    navigate('/admin/add-product');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filtering logic
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Mobile Product Card Component
  const MobileProductCard = ({ product }) => (
    <div className={styles.mobileCard}>
      <div className={styles.mobileCardHeader}>
        <div className={styles.mobileCardLeft}>
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className={styles.mobileCardImage} />
          )}
          <div className={styles.mobileCardInfo}>
            <h4 className={styles.mobileCardTitle}>{product.name}</h4>
            <p className={styles.mobileCardId}>#{product.id}</p>
            <span className={styles.mobileCardCategory}>{product.category}</span>
          </div>
        </div>
        <div className={styles.mobileCardActions}>
          <button
            type="button"
            className={`${styles.mobileActionBtn} ${styles.view}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleView(product);
            }}
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className={`${styles.mobileActionBtn} ${styles.edit}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEdit(product);
            }}
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            className={`${styles.mobileActionBtn} ${styles.delete}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(product.id);
            }}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className={styles.mobileCardBody}>
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileCardLabel}>Price:</span>
          <div className={styles.mobileCardPrice}>
            <span className={styles.currentPrice}>₹{product.price}</span>
            {product.original_price && (
              <span className={styles.originalPrice}>₹{product.original_price}</span>
            )}
          </div>
        </div>
        
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileCardLabel}>Status:</span>
          <div className={styles.mobileCardStatus}>
            <span className={`${styles.statusBadge} ${product.is_active ? styles.active : styles.inactive}`}>
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
            {product.is_featured && (
              <span className={`${styles.statusBadge} ${styles.featured}`}>
                <Star size={10} /> Featured
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Modal Component - Separated to prevent re-renders
  const EditModal = () => {
    const [editForm, setEditForm] = useState({});
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    // Initialize form when modal opens
    useEffect(() => {
      if (selectedProduct && showEditModal) {
        setEditForm({
          id: selectedProduct.id,
          name: selectedProduct.name || "",
          description: selectedProduct.description || "",
          price: selectedProduct.price || 0,
          original_price: selectedProduct.original_price || "",
          category: selectedProduct.category || "Shirts",
          brand: selectedProduct.brand || "BOLT FIT",
          material: selectedProduct.material || "",
          is_active: selectedProduct.is_active || false,
          is_featured: selectedProduct.is_featured || false,
          sizes: selectedProduct.sizes?.map(s => s.size).join(', ') || "",
          colors: selectedProduct.colors?.map(c => c.name).join(', ') || "",
          images: selectedProduct.images || []
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setUploadProgress({});
      }
    }, [selectedProduct, showEditModal]);

    const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      const validFiles = [];
      const validPreviews = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not a valid image file`);
          continue;
        }
        if (file.size > 32 * 1024 * 1024) {
          setError(`${file.name} is too large (max 32MB)`);
          continue;
        }
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }

      setSelectedImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validPreviews]);
    };

    const uploadImagesToImgBB = async () => {
      if (selectedImages.length === 0) return [];

      setUploading(true);
      const urls = [];

      try {
        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i];
          
          const formData = new FormData();
          formData.append('image', file);
          
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(`ImgBB upload failed: ${data.error?.message || 'Unknown error'}`);
          }

          urls.push(data.data.display_url);
          setUploadProgress(prev => ({ ...prev, [i]: ((i + 1) / selectedImages.length) * 100 }));
        }

        return urls;

      } catch (error) {
        console.error('Error uploading images:', error);
        setError(`Failed to upload images: ${error.message}`);
        return [];
      } finally {
        setUploading(false);
      }
    };

    const removeImage = (index) => {
      const newPreviews = [...imagePreviews];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      
      const newFiles = [...selectedImages];
      newFiles.splice(index, 1);
      
      setImagePreviews(newPreviews);
      setSelectedImages(newFiles);
    };

    const removeExistingImage = (index) => {
      const newImages = [...editForm.images];
      newImages.splice(index, 1);
      setEditForm({ ...editForm, images: newImages });
    };

    const addQuickSize = (size) => {
      const currentSizes = editForm.sizes ? editForm.sizes.split(',').map(s => s.trim()) : [];
      if (!currentSizes.includes(size)) {
        const newSizes = [...currentSizes, size].join(', ');
        setEditForm({ ...editForm, sizes: newSizes });
      }
    };

    const addQuickColor = (color) => {
      const currentColors = editForm.colors ? editForm.colors.split(',').map(c => c.trim()) : [];
      if (!currentColors.includes(color)) {
        const newColors = [...currentColors, color].join(', ');
        setEditForm({ ...editForm, colors: newColors });
      }
    };

    const handleSaveEdit = async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      try {
        setUploading(true);
        setError("");
        
        // Upload new images to ImgBB first
        let newImageUrls = [];
        if (selectedImages.length > 0) {
          newImageUrls = await uploadImagesToImgBB();
          if (newImageUrls.length === 0 && selectedImages.length > 0) {
            setError("Failed to upload images");
            setUploading(false);
            return;
          }
        }

        // Combine existing and new image URLs
        const allImageUrls = [...editForm.images, ...newImageUrls];
        
        const token = localStorage.getItem('authToken');
        
        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('description', editForm.description);
        formData.append('price', editForm.price);
        formData.append('original_price', editForm.original_price || '');
        formData.append('category', editForm.category);
        formData.append('brand', editForm.brand);
        formData.append('material', editForm.material);
        formData.append('is_active', editForm.is_active);
        formData.append('is_featured', editForm.is_featured);
        formData.append('sizes', editForm.sizes);
        formData.append('colors', editForm.colors);
        formData.append('image_urls', JSON.stringify(allImageUrls));

        const response = await fetch(`${API_BASE}/products/${editForm.id}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          setShowEditModal(false);
          await fetchProducts();
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || "Failed to update product.");
        }
      } catch (err) {
        console.error('Update error:', err);
        setError("Failed to update product. Please try again.");
      } finally {
        setUploading(false);
      }
    };

    const discountPercentage = editForm.original_price && editForm.price ?
      Math.round(((editForm.original_price - editForm.price) / editForm.original_price) * 100) : 0;

    return (
      <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
        <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.editModalHeader}>
            <h2>Edit Product</h2>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEditModal(false);
              }} 
              className={styles.closeBtn}
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSaveEdit}>
            <div className={styles.editModalContent}>
              {/* Basic Information */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <Package size={20} />
                  Basic Information
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select
                      value={editForm.category || "Shirts"}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{gridColumn: '1/-1'}}>
                    <label>Description *</label>
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Product description"
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <Star size={20} />
                  Pricing
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Current Price *</label>
                    <input
                      type="number"
                      value={editForm.price || ""}
                      onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Original Price</label>
                    <input
                      type="number"
                      value={editForm.original_price || ""}
                      onChange={(e) => setEditForm({...editForm, original_price: parseFloat(e.target.value) || ""})}
                      placeholder="0.00"
                    />
                  </div>
                  {discountPercentage > 0 && (
                    <div className={styles.discountBadge}>
                      {discountPercentage}% OFF
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <TrendingUp size={20} />
                  Product Details
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Brand</label>
                    <input
                      type="text"
                      value={editForm.brand || ""}
                      onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                      placeholder="Brand name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Material</label>
                    <input
                      type="text"
                      value={editForm.material || ""}
                      onChange={(e) => setEditForm({...editForm, material: e.target.value})}
                      placeholder="Material type"
                    />
                  </div>
                  
                  <div className={styles.formGroup} style={{gridColumn: '1/-1'}}>
                    <label>Sizes</label>
                    <input
                      type="text"
                      value={editForm.sizes || ""}
                      onChange={(e) => setEditForm({...editForm, sizes: e.target.value})}
                      placeholder="XS, S, M, L, XL, XXL"
                    />
                    <div className={styles.quickAdd}>
                      <span>Quick add:</span>
                      {commonSizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addQuickSize(size);
                          }}
                          className={styles.quickAddBtn}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{gridColumn: '1/-1'}}>
                    <label>Colors</label>
                    <input
                      type="text"
                      value={editForm.colors || ""}
                      onChange={(e) => setEditForm({...editForm, colors: e.target.value})}
                      placeholder="Red, Blue, Green, Black"
                    />
                    <div className={styles.quickAdd}>
                      <span>Quick add:</span>
                      {commonColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addQuickColor(color);
                          }}
                          className={styles.quickAddBtn}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <ImageIcon size={20} />
                  Product Images
                </h3>
                
                {editForm.images?.length > 0 && (
                  <div className={styles.existingImages}>
                    <h4>Current Images</h4>
                    <div className={styles.imageGrid}>
                      {editForm.images.map((img, index) => (
                        <div key={index} className={styles.imagePreview}>
                          <img src={img} alt={`Product ${index + 1}`} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeExistingImage(index);
                            }}
                            className={styles.removeImageBtn}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.imageUpload}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" className={styles.uploadBtn}>
                    <Upload size={20} />
                    {selectedImages.length === 0 ? "Add New Images" : `${selectedImages.length} images selected`}
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className={styles.newImages}>
                    <h4>New Images to Add</h4>
                    <div className={styles.imageGrid}>
                      {imagePreviews.map((src, index) => (
                        <div key={index} className={styles.imagePreview}>
                          <img src={src} alt={`New ${index + 1}`} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeImage(index);
                            }}
                            className={styles.removeImageBtn}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploading && uploadProgress && (
                  <div className={styles.uploadProgress}>
                    <p>Uploading images to ImgBB...</p>
                    {Object.values(uploadProgress).map((progress, i) => (
                      <div key={i} className={styles.progressBar}>
                        <div style={{width: `${progress}%`}}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <TrendingUp size={20} />
                  Settings
                </h3>
                <div className={styles.toggleGroup}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={editForm.is_featured || false}
                      onChange={(e) => setEditForm({...editForm, is_featured: e.target.checked})}
                    />
                    <span className={styles.toggleSwitch}></span>
                    Featured Product
                  </label>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={editForm.is_active || false}
                      onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                    />
                    <span className={styles.toggleSwitch}></span>
                    Active Product
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.editModalFooter}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEditModal(false);
                }} 
                className={styles.cancelBtn}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className={styles.saveBtn}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // View Modal
  const ProductModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowProductModal(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Product Details</h3>
          <button type="button" onClick={() => setShowProductModal(false)}>×</button>
        </div>
        <div className={styles.modalContent}>
          {selectedProduct && (
            <>
              <div className={styles.productImages}>
                {selectedProduct.images?.length > 0 ? (
                  selectedProduct.images.map((img, index) => (
                    <img key={index} src={img} alt={selectedProduct.name} />
                  ))
                ) : (
                  <div className={styles.noImage}>No Images</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h4>{selectedProduct.name}</h4>
                <p className={styles.description}>{selectedProduct.description || "No description available"}</p>
                <div className={styles.priceInfo}>
                  <span className={styles.price}>₹{selectedProduct.price}</span>
                  {selectedProduct.original_price && (
                    <span className={styles.originalPrice}>₹{selectedProduct.original_price}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Package size={isMobile ? 24 : 28} />
            </div>
            <div className={styles.logoText}>
              <h1>BoltFit Admin</h1>
              {!isMobile && <p>Product Management Hub</p>}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {!isMobile && (
            <div className={styles.adminProfile}>
              <div className={styles.adminAvatar}>
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className={styles.adminInfo}>
                <span>{admin?.name || 'Admin'}</span>
                <small>Administrator</small>
              </div>
            </div>
          )}
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.statsGrid}>
          <div className={`${styles.statsCard} ${styles.primary}`}>
            <div className={styles.statsIcon}>
              <ShoppingBag />
            </div>
            <div className={styles.statsContent}>
              <h3>{products.length}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className={`${styles.statsCard} ${styles.success}`}>
            <div className={styles.statsIcon}>
              <TrendingUp />
            </div>
            <div className={styles.statsContent}>
              <h3>{products.filter(p => p.is_active).length}</h3>
              <p>Active Products</p>
            </div>
          </div>
          <div className={`${styles.statsCard} ${styles.warning}`}>
            <div className={styles.statsIcon}>
              <Star />
            </div>
            <div className={styles.statsContent}>
              <h3>{products.filter(p => p.is_featured).length}</h3>
              <p>Featured Items</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchAndFilter}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filterTabs}>
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.filterTab} ${
                  selectedCategory === cat ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <button type="button" className={styles.addButton} onClick={handleAddProduct}>
          <Plus size={20} />
          {!isMobile && <span>Add Product</span>}
        </button>
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading products...</p>
        </div>
      )}
      
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <p>{error}</p>
            <button type="button" onClick={() => setError("")}>×</button>
          </div>
        </div>
      )}

      <div className={styles.productsContainer}>
        {isMobile ? (
          <div className={styles.mobileCardsContainer}>
            {filteredProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.productCell}>
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt={product.name} className={styles.productImage} />
                        )}
                        <div className={styles.productDetails}>
                          <div className={styles.productName}>{product.name}</div>
                          <div className={styles.productId}>#{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>{product.category}</span>
                    </td>
                    <td>
                      <div className={styles.priceCell}>
                        <span className={styles.currentPrice}>₹{product.price}</span>
                        {product.original_price && (
                          <span className={styles.originalPrice}>₹{product.original_price}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.statusGroup}>
                        <span className={`${styles.statusBadge} ${product.is_active ? styles.active : styles.inactive}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_featured && (
                          <span className={`${styles.statusBadge} ${styles.featured}`}>
                            <Star size={12} /> Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.view}`}
                          onClick={() => handleView(product)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => handleDelete(product.id)}
                          title="Delete Product"
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
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <Package size={64} />
            <h3>No products found</h3>
            <p>Try adjusting your search or add your first product!</p>
            <button type="button" className={styles.addButton} onClick={handleAddProduct}>
              <Plus size={20} />
              <span>Add Your First Product</span>
            </button>
          </div>
        )}
      </div>

      {showEditModal && <EditModal />}
      {showProductModal && <ProductModal />}
    </div>
  );
}