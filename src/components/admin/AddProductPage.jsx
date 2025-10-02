import React, { useState, useEffect } from "react";

import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";

import {
  AddPhotoAlternate,
  Delete,
  CloudUpload,
} from "@mui/icons-material";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";

const API_BASE_URL = "https://boltfit-backend-r4no.onrender.com/api/v1";
const IMGBB_API_KEY = "111466cad6108aa2657663cede57b1d3";

const categories = ["Shirts", "T-Shirts", "Pants", "Trending"];
const commonSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const commonColors = [
  "Red", "Blue", "Green", "Black", "White", "Gray",
  "Yellow", "Orange", "Purple", "Pink", "Brown", "Navy",
];

const initialForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category: "",
  material: "",
  brand: "BOLT FIT",
  sizes: "",
  colors: "",
  is_featured: false,
  is_active: true,
};

const GradientContainer = styled(Container)(({ theme }) => ({
  background: "linear-gradient(135deg, #e0f0ff 0%, #a0c8ff 100%)",
  minHeight: "100vh",
  paddingTop: 24,
  paddingBottom: 24,
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(160,200,255,0.3)",
  [theme.breakpoints.down("sm")]: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 12,
    paddingRight: 12,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #3a79ff 30%, #0052cc 90%)",
  color: "#fff",
  fontWeight: 600,
  minHeight: 44,
  fontSize: 16,
  [theme.breakpoints.down("sm")]: {
    minHeight: 50,
    fontSize: 18,
  },
  "&:hover": {
    background: "linear-gradient(45deg, #0052cc 30%, #003d99 90%)",
  },
}));

const AccentChip = styled(Chip)(({ theme }) => ({
  borderColor: "#3a79ff",
  color: "#0052cc",
  fontWeight: 600,
  cursor: "pointer",
  marginBottom: 4,
  [theme.breakpoints.down("sm")]: {
    fontSize: 14,
    padding: "8px 12px",
  },
  "&:hover": {
    backgroundColor: "#cbe1ff",
  },
}));

const HeadingTypography = styled(Typography)(({ theme }) => ({
  color: "#003d99",
  fontWeight: 700,
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.75rem",
  },
}));

export default function AddProductPage() {
  const [formData, setFormData] = useState(initialForm);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });
  const { getToken, isAuthenticated, admin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setSnack({ open: true, type: "error", msg: "You must be logged in as an admin to access this page." });
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [authLoading, isAuthenticated, navigate]);

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

  const uploadImagesToImgBB = async () => {
    if (selectedImages.length === 0) return;
    setUploading(true);
    const urls = [];
    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const formDataCB = new FormData();
        formDataCB.append("image", file);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formDataCB,
        });
        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        const data = await response.json();
        if (!data.success) throw new Error(`ImgBB upload failed: ${data.error?.message || 'Unknown error'}`);
        urls.push(data.data.display_url);
        setUploadProgress(prev => ({ ...prev, [i]: ((i + 1) / selectedImages.length) * 100 }));
      }
      setImageUrls(urls);
      setSnack({ open: true, type: "success", msg: `Successfully uploaded ${urls.length} images to ImgBB` });
    } catch (error) {
      console.error("Error uploading images:", error);
      setSnack({ open: true, type: "error", msg: `Failed to upload images: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const validPreviews = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setSnack({ open: true, type: "error", msg: `${file.name} is not a valid image file` });
        continue;
      }
      if (file.size > 32 * 1024 * 1024) {
        setSnack({ open: true, type: "error", msg: `${file.name} is too large (max 32MB for ImgBB)` });
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }
    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
    setImageUrls([]);
    setUploadProgress({});
  };

  const handleRemoveImage = (index) => {
    const files = [...selectedImages];
    const previews = [...imagePreviews];
    URL.revokeObjectURL(previews[index]);
    files.splice(index, 1);
    previews.splice(index, 1);
    setSelectedImages(files);
    setImagePreviews(previews);
    setImageUrls([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const addQuickSize = (size) => {
    const currentSizes = formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [];
    if (!currentSizes.includes(size)) {
      const newSizes = [...currentSizes, size].join(", ");
      setFormData(f => ({ ...f, sizes: newSizes }));
    }
  };

  const addQuickColor = (color) => {
    const currentColors = formData.colors ? formData.colors.split(',').map(c => c.trim()) : [];
    if (!currentColors.includes(color)) {
      const newColors = [...currentColors, color].join(", ");
      setFormData(f => ({ ...f, colors: newColors }));
    }
  };

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
      form.append("image_urls", JSON.stringify(imageUrls));

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
          if (data.detail && Array.isArray(data.detail)) errorMsg = data.detail.map(err => err.msg || err).join(', ');
          else if (data.detail) errorMsg = data.detail;
        } else if (data.detail) errorMsg = data.detail;
        throw new Error(errorMsg);
      }
      setSnack({ open: true, type: "success", msg: "Product added successfully!" });
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

  const discountPercentage = formData.original_price && formData.price
    ? Math.round(((formData.original_price - formData.price) / formData.original_price) * 100)
    : 0;

  if (authLoading) return <Typography>Checking authentication...</Typography>;

  return (
    <GradientContainer maxWidth="md">
      <Paper elevation={3} sx={{ padding: { xs: 2, sm: 4 } }}>
        <HeadingTypography variant="h4" align="center" gutterBottom>Add New Product</HeadingTypography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" gutterBottom sx={{ mb: { xs: 1, sm: 2 } }}>Basic Information</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField label="Product Name" name="name" value={formData.name} onChange={handleChange} fullWidth required sx={{ backgroundColor: "white" }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Category" name="category" select value={formData.category} onChange={handleChange} fullWidth required sx={{ backgroundColor: "white" }}>
                {categories.map(category => (<MenuItem key={category} value={category}>{category}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline minRows={3} required sx={{ backgroundColor: "white" }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Price" name="price" type="number" value={formData.price} onChange={handleChange} fullWidth required sx={{ backgroundColor: "white" }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Original Price" name="original_price" type="number" value={formData.original_price} onChange={handleChange} fullWidth sx={{ backgroundColor: "white" }} />
            </Grid>
          </Grid>
          {discountPercentage > 0 && (
            <Typography variant="body2" color="secondary" sx={{ marginTop: 1, fontWeight: "bold" }}>
              Discount: {discountPercentage}%
            </Typography>
          )}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: { xs: 1, sm: 2 } }}>Product Details</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Quick add sizes:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {commonSizes.map(size => (
                <AccentChip key={size} label={size} onClick={() => addQuickSize(size)} variant="outlined" size="small" />
              ))}
            </Stack>
            <TextField label="Sizes" name="sizes" value={formData.sizes} onChange={handleChange} fullWidth sx={{ backgroundColor: "white", mb: 3 }} placeholder="Comma separated, e.g. S, M, L" />
            <Typography variant="body2" sx={{ mb: 1 }}>Quick add colors:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {commonColors.map(color => (
                <AccentChip key={color} label={color} onClick={() => addQuickColor(color)} variant="outlined" size="small" />
              ))}
            </Stack>
            <TextField label="Colors" name="colors" value={formData.colors} onChange={handleChange} fullWidth sx={{ backgroundColor: "white", mb: 3 }} placeholder="Comma separated, e.g. Red, Blue, Green" />
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>Product Images</Typography>
            <Button variant="contained" component="label" startIcon={<AddPhotoAlternate />} sx={{ mb: 2, minHeight: 44, fontSize: 16 }}>
              {selectedImages.length === 0 ? "Select Images" : `Selected ${selectedImages.length} image(s)`}
              <input hidden multiple accept="image/*" type="file" onChange={handleImageChange} />
            </Button>
            {selectedImages.length > 0 && imageUrls.length === 0 && (
              <GradientButton onClick={uploadImagesToImgBB} disabled={uploading} startIcon={<CloudUpload />} sx={{ mb: 2 }}>
                {uploading ? "Uploading to ImgBB..." : "Upload Images to ImgBB"}
              </GradientButton>
            )}
            {uploading && selectedImages.map((file, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">{file.name} - {Math.round(uploadProgress[index] || 0)}%</Typography>
                <Box sx={{ height: 6, backgroundColor: "#eee", borderRadius: 3, overflow: "hidden", width: "100%", my: 0.5 }}>
                  <Box sx={{ width: `${uploadProgress[index] || 0}%`, height: "100%", backgroundColor: "#3a79ff" }} />
                </Box>
              </Box>
            ))}
            {imagePreviews.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {imagePreviews.map((src, idx) => (
                  <Grid item xs={6} sm={3} key={idx} sx={{ position: "relative" }}>
                    <Box component="img" src={src} alt={`Preview ${idx + 1}`} sx={{
                      width: "100%",
                      height: { xs: 120, sm: 100 },
                      objectFit: "cover",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                    }} />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(idx)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            )}
            {imageUrls.length > 0 && (
              <Typography variant="body2" color="success.main" sx={{ mt: 2, fontWeight: "bold" }}>
                ✅ {imageUrls.length} images uploaded to ImgBB successfully!
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              You can select multiple images. Supported formats: JPG, PNG, WebP, GIF (max 32MB each)
            </Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>Settings</Typography>
            <FormControlLabel control={<Checkbox checked={formData.is_featured} onChange={handleChange} name="is_featured" />} label="Featured Product" />
            <FormControlLabel control={<Checkbox checked={formData.is_active} onChange={handleChange} name="is_active" />} label="Active" />
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <GradientButton type="submit" fullWidth size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Add Product"}
            </GradientButton>
          </Box>
        </Box>
        <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.type} sx={{ width: "100%" }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Paper>
    </GradientContainer>
  );
}
