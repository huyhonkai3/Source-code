import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import CategoryCard from "../../components/admin/CategoryCard";
import CategoryDialog from "../../components/admin/CategoryDialog";
import DeleteCategoryDialog from "../../components/admin/DeleteCategoryDialog";
import CannotDeleteDialog from "../../components/admin/CannotDeleteDialog";
import categoriesAPI from "../../api/categories.api";

/**
 * CategoriesManagementPage Component
 * Admin page for managing document categories
 */
const CategoriesManagementPage = () => {
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cannotDeleteDialogOpen, setCannotDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  /**
   * Fetch categories on mount
   */
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Fetch all categories
   */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();

      // Handle response structure
      const categoriesData = response.data?.categories || response.data || [];

      // Normalize: Ensure _id field exists (backend returns 'id')
      const normalizedCategories = categoriesData.map((cat) => ({
        ...cat,
        _id: cat._id || cat.id, // Ensure _id exists
      }));

      setCategories(normalizedCategories);
    } catch (error) {
      console.error("Fetch categories error:", error);
      showSnackbar("Không thể tải danh sách danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  /**
   * Handle create category
   */
  const handleCreate = () => {
    setDialogMode("create");
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  /**
   * Handle edit category
   */
  const handleEdit = (category) => {
    setDialogMode("edit");
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  /**
   * Handle delete category
   */
  const handleDelete = (category) => {
    setSelectedCategory(category);

    // Check if category has documents
    if (category.documentCount > 0) {
      // Has documents - show cannot delete dialog immediately
      setCannotDeleteDialogOpen(true);
    } else {
      // No documents - show confirmation dialog
      setDeleteDialogOpen(true);
    }
  };

  /**
   * Handle category form submit
   */
  const handleCategorySubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (dialogMode === "create") {
        // Create new category
        const response = await categoriesAPI.create(formData);

        if (response.status === "success") {
          showSnackbar("Danh mục đã được tạo thành công!", "success");
          setCategoryDialogOpen(false);
          fetchCategories(); // Refresh list
        }
      } else {
        // Update existing category
        const categoryId = selectedCategory._id || selectedCategory.id;
        const response = await categoriesAPI.update(categoryId, formData);

        if (response.status === "success") {
          showSnackbar("Danh mục đã được cập nhật!", "success");
          setCategoryDialogOpen(false);
          fetchCategories(); // Refresh list
        }
      }
    } catch (error) {
      console.error("Save category error:", error);
      const errorMessage =
        error.response?.data?.message ||
        (dialogMode === "create"
          ? "Không thể tạo danh mục"
          : "Không thể cập nhật danh mục");
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle delete confirm
   */
  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    setActionLoading(true);
    try {
      const categoryId = selectedCategory._id || selectedCategory.id;
      const response = await categoriesAPI.delete(categoryId);

      if (response.status === "success") {
        showSnackbar("Danh mục đã được xóa!", "success");
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories(); // Refresh list
      }
    } catch (error) {
      console.error("Delete category error:", error);

      // Check if error is due to existing documents (400)
      if (error.response?.status === 400) {
        // Close delete dialog
        setDeleteDialogOpen(false);

        // Open cannot delete dialog instead
        setCannotDeleteDialogOpen(true);

        // Don't show snackbar - dialog will handle the message
      } else {
        // Other errors - show snackbar
        const errorMessage =
          error.response?.data?.message || "Không thể xóa danh mục";
        showSnackbar(errorMessage, "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle view documents in this category
   */
  const handleViewDocs = () => {
    if (!selectedCategory) return;

    // Close dialog
    setCannotDeleteDialogOpen(false);

    // Navigate to documents page with category filter
    const categoryId = selectedCategory._id || selectedCategory.id;
    navigate(`/admin/documents?category=${categoryId}`);
  };

  /**
   * Handle move documents to another category
   * (Future feature - currently shows notification)
   */
  const handleMoveDocs = () => {
    // Close dialog
    setCannotDeleteDialogOpen(false);

    // Show notification
    showSnackbar("Tính năng đang phát triển", "info");
  };

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <AdminSidebar active="categories" />
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Breadcrumb & Title */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Dashboard / Danh mục
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Quản lý Danh mục
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quản lý các chuyên mục tài liệu của thư viện.
                    </Typography>
                  </Box>

                  {/* Add Button */}
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    sx={{
                      minWidth: 200,
                      fontWeight: 600,
                    }}
                  >
                    Thêm danh mục mới
                  </Button>
                </Box>
              </Box>

              {/* Loading State */}
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                /* Categories Grid */
                <Grid container spacing={3}>
                  {categories.length === 0 ? (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 8,
                        }}
                      >
                        <Typography variant="h6" color="text.secondary">
                          Chưa có danh mục nào
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Nhấn "Thêm danh mục mới" để tạo danh mục đầu tiên
                        </Typography>
                      </Box>
                    </Grid>
                  ) : (
                    categories.map((category) => (
                      <Grid item xs={12} sm={6} md={4} key={category._id}>
                        <CategoryCard
                          category={category}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Category Dialog (Add/Edit) */}
      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => !actionLoading && setCategoryDialogOpen(false)}
        onSubmit={handleCategorySubmit}
        initialData={selectedCategory}
        loading={actionLoading}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onClose={() => !actionLoading && setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        categoryName={selectedCategory?.name || ""}
        loading={actionLoading}
      />

      {/* Cannot Delete Dialog (Category has documents) */}
      <CannotDeleteDialog
        open={cannotDeleteDialogOpen}
        onClose={() => setCannotDeleteDialogOpen(false)}
        category={selectedCategory}
        onViewDocs={handleViewDocs}
        onMoveDocs={handleMoveDocs}
      />

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CategoriesManagementPage;
