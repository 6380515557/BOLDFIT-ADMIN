import React, { useState, useEffect } from "react";
import {
  TextField, Button, Checkbox, FormControlLabel, Typography,
  Container, Box, Paper, Grid, MenuItem, CircularProgress,
  Snackbar, Alert, IconButton, Chip, Stack,
} from "@mui/material";
import {
  AddPhotoAlternate, Delete, CloudUpload, Image as ImageIcon
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api/v1";

// ✅ Replace with your actual ImgBB API key
const IMGBB_API_KEY = "111466cad6108aa2657663cede57b1d3"; // Get this from https://api.imgbb.com/

const categories = ["Shirts", "T-Shirts", "Pants", "Trending"];
const commonSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const commonColors = ["Red", "Blue", "Green", "Black", "White", "Gray", "Yellow", "Orange", "Purple", "Pink", "Brown", "Navy"];

const initialForm = {
  name: "", description: "", price: "", original_price: "", category: "",
  material: "", brand: "BOLT FIT", sizes: "", colors: "",
  is_featured: false, is_active: true,
};

export default function AddProductPage() {
  const [formData, setFormData] = useState(initialForm);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); // ✅ ImgBB URLs
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });
  const { getToken, isAuthenticated, admin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setSnack({
        open: true, type: "error",
        msg: "You must be logged in as an admin to access this page."
      });
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Validation function
  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push("Product name is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.price || formData.price <= 0) errors.push("Valid price is required");
    if (!formData.category) errors.push("Category is required");
    if (imageUrls.length === 0) errors.push("At least one image is required");

    if (formData.original_price && Number(formData.original_price) <= Number(formData.price)) {
      errors.push("Original price should be higher than current price");
    }
    return errors;
  };

  // ✅ ImgBB upload function - replaces Firebase
  const uploadImagesToImgBB = async () => {
    if (selectedImages.length === 0) return;

    setUploading(true);
    const urls = [];

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        
        // Create FormData for ImgBB
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload to ImgBB
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

        // Get the direct image URL
        urls.push(data.data.display_url);
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [i]: ((i + 1) / selectedImages.length) * 100 }));
      }

      setImageUrls(urls);
      setSnack({
        open: true, type: "success",
        msg: `Successfully uploaded ${urls.length} images to ImgBB`
      });

    } catch (error) {
      console.error('Error uploading images:', error);
      setSnack({
        open: true, type: "error",
        msg: `Failed to upload images: ${error.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  // Image selection and preview logic
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setSnack({
          open: true, type: "error",
          msg: `${file.name} is not a valid image file`
        });
        continue;
      }

      // Check file size (32MB limit for ImgBB)
      if (file.size > 32 * 1024 * 1024) {
        setSnack({
          open: true, type: "error",
          msg: `${file.name} is too large (max 32MB for ImgBB)`
        });
        continue;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
    setImageUrls([]); // Clear previous URLs
    setUploadProgress({});
  };

  // Remove selected image
  const handleRemoveImage = (index) => {
    const files = [...selectedImages];
    const previews = [...imagePreviews];
    
    URL.revokeObjectURL(previews[index]);
    files.splice(index, 1);
    previews.splice(index, 1);
    
    setSelectedImages(files);
    setImagePreviews(previews);
    setImageUrls([]); // Clear ImgBB URLs
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Quick add helpers
  const addQuickSize = (size) => {
    const currentSizes = formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [];
    if (!currentSizes.includes(size)) {
      const newSizes = [...currentSizes, size].join(', ');
      setFormData(f => ({ ...f, sizes: newSizes }));
    }
  };

  const addQuickColor = (color) => {
    const currentColors = formData.colors ? formData.colors.split(',').map(c => c.trim()) : [];
    if (!currentColors.includes(color)) {
      const newColors = [...currentColors, color].join(', ');
      setFormData(f => ({ ...f, colors: newColors }));
    }
  };

  // ✅ Submit form with ImgBB URLs
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !admin) {
      setSnack({ open: true, type: "error", msg: "You must be logged in as an admin to add products." });
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setSnack({ open: true, type: "error", msg: errors.join('. ') });
      return;
    }

    let token;
    try {
      token = getToken();
      if (!token) throw new Error("No authentication token found");
    } catch (error) {
      setSnack({ open: true, type: "error", msg: "Authentication token not found. Please login again." });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", formData.name.trim());
      form.append("description", formData.description.trim());
      form.append("price", Number(formData.price));
      if (formData.original_price?.trim()) form.append("original_price", Number(formData.original_price));
      form.append("category", formData.category);
      form.append("brand", formData.brand.trim());
      if (formData.material?.trim()) form.append("material", formData.material.trim());
      form.append("is_featured", formData.is_featured);
      form.append("is_active", formData.is_active);
      form.append("sizes", formData.sizes.trim());
      form.append("colors", formData.colors.trim());
      
      // ✅ Add ImgBB image URLs
      form.append("image_urls", JSON.stringify(imageUrls));

      console.log('Submitting product with ImgBB URLs:', imageUrls);

      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await response.json();
      if (!response.ok) {
        let errorMsg = "Failed to add product";
        if (response.status === 401) errorMsg = "Unauthorized. Please login again as an admin.";
        else if (response.status === 403) errorMsg = "You don't have permission to add products. Admin access required.";
        else if (response.status === 422) {
          if (data.detail && Array.isArray(data.detail)) {
            errorMsg = data.detail.map(err => err.msg || err).join(', ');
          } else if (data.detail) errorMsg = data.detail;
        } else if (data.detail) errorMsg = data.detail;
        throw new Error(errorMsg);
      }

      setSnack({ open: true, type: "success", msg: "Product added successfully!" });

      // Reset form
      setFormData(initialForm);
      setSelectedImages([]);
      setImageUrls([]);
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setUploadProgress({});

      setTimeout(() => navigate("/admin"), 2000);

    } catch (err) {
      console.error("Error adding product:", err);
      setSnack({ open: true, type: "error", msg: err.message || "Network or server error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const discountPercentage = formData.original_price && formData.price ?
    Math.round(((formData.original_price - formData.price) / formData.original_price) * 100) : 0;

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Checking authentication...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Add New Product
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField label="Product Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={4} required />
            </Grid>

            <Grid item xs={12}>
              <TextField select label="Select category" name="category" value={formData.category} onChange={handleChange} fullWidth required>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Pricing</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} fullWidth required />
            </Grid>

            <Grid item xs={6}>
              <TextField label="Original Price (₹)" name="original_price" type="number" value={formData.original_price} onChange={handleChange} fullWidth />
            </Grid>

            {discountPercentage > 0 && (
              <Grid item xs={12}>
                <Chip label={`${discountPercentage}% OFF`} color="secondary" variant="outlined" />
              </Grid>
            )}

            {/* Product Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Product Details</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField label="Brand" name="brand" value={formData.brand} onChange={handleChange} fullWidth />
            </Grid>

            <Grid item xs={6}>
              <TextField label="Material" name="material" value={formData.material} onChange={handleChange} fullWidth />
            </Grid>

            {/* Sizes */}
            <Grid item xs={12}>
              <TextField label="Available Sizes (comma separated)" name="sizes" value={formData.sizes} onChange={handleChange} fullWidth />
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Quick add:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {commonSizes.map(size => (
                    <Chip key={size} label={size} onClick={() => addQuickSize(size)} size="small" variant="outlined" sx={{ mb: 1 }} />
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* Colors */}
            <Grid item xs={12}>
              <TextField label="Available Colors (comma separated)" name="colors" value={formData.colors} onChange={handleChange} fullWidth />
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Quick add:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {commonColors.map(color => (
                    <Chip key={color} label={color} onClick={() => addQuickColor(color)} size="small" variant="outlined" sx={{ mb: 1 }} />
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* ✅ ImgBB Images Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Product Images</Typography>
              
              <Button component="label" variant="outlined" startIcon={<CloudUpload />} fullWidth sx={{ py: 2 }}>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                {selectedImages.length === 0 ? "Select Images" : `Selected ${selectedImages.length} images`}
              </Button>

              {/* Upload to ImgBB Button */}
              {selectedImages.length > 0 && imageUrls.length === 0 && (
                <Button onClick={uploadImagesToImgBB} disabled={uploading} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  {uploading ? "Uploading to ImgBB..." : "Upload Images to ImgBB"}
                </Button>
              )}

              {/* Upload Progress */}
              {uploading && (
                <Box sx={{ mt: 2 }}>
                  {selectedImages.map((file, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">{file.name}</Typography>
                      <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1 }}>
                        <Box sx={{ width: `${uploadProgress[index] || 0}%`, bgcolor: 'primary.main', height: 8, borderRadius: 1, transition: 'width 0.3s ease' }} />
                      </Box>
                      <Typography variant="caption">{Math.round(uploadProgress[index] || 0)}%</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {imagePreviews.map((src, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                        <IconButton onClick={() => handleRemoveImage(idx)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Success Message */}
              {imageUrls.length > 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✅ {imageUrls.length} images uploaded to ImgBB successfully!
                </Alert>
              )}

              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                You can select multiple images. Supported formats: JPG, PNG, WebP, GIF (max 32MB each for ImgBB)
              </Typography>
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Settings</Typography>
              <FormControlLabel control={<Checkbox name="is_featured" checked={formData.is_featured} onChange={handleChange} />} label="Featured Product" />
              <FormControlLabel control={<Checkbox name="is_active" checked={formData.is_active} onChange={handleChange} />} label="Active" />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || imageUrls.length === 0} sx={{ py: 1.5 }}>
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Adding Product...
                  </>
                ) : ("Add Product")}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.type} sx={{ width: '100%' }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}
