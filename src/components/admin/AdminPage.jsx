import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";
import { Eye, Edit3, Trash2, Plus } from "lucide-react";

const API_BASE = "https://boltfit-backend-r4no.onrender.com/api/v1"; // Update to match your backend URL

export default function AdminPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Shirts", "Pants", "T-Shirts", "Trending"];

  // Fetch all products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/products`);
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
      await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {
      setError("Failed to delete product.");
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Product Admin Panel</h1>
        <button
          className={styles.addButton}
          onClick={() => navigate("/admin/new-product")}
        >
          <Plus size={20} /> Add Product
        </button>
      </div>
      <div className={styles.filterRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.categoryButton} ${
              selectedCategory === cat ? styles.activeCategory : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {loading && <div className={styles.status}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th className={styles.hideMobile}>Price</th>
            <th className={styles.hideMobile}>Stock</th>
            <th>Status</th>
            <th className={styles.hideMobile}>Sales</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No products found.
              </td>
            </tr>
          )}
          {filteredProducts.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.name}</td>
              <td>{prod.category}</td>
              <td className={styles.hideMobile}>₹{prod.price}</td>
              <td className={styles.hideMobile}>{prod.stock}</td>
              <td>
                <span
                  className={`${styles.statusBadge} ${
                    prod.status === "Active"
                      ? styles.statusActive
                      : styles.statusInactive
                  }`}
                >
                  {prod.status}
                </span>
              </td>
              <td className={styles.hideMobile}>{prod.sales || 0}</td>
              <td>
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  title="Edit"
                  onClick={() => navigate(`/admin/edit-product/${prod.id}`)}
                >
                  <Edit3 size={18} />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="Delete"
                  onClick={() => handleDelete(prod.id)}
                >
                  <Trash2 size={18} />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.viewButton}`}
                  title="View"
                  onClick={() => navigate(`/product/${prod.id}`)}
                >
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
