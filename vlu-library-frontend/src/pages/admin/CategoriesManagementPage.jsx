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
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Fade,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Folder as FolderIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Description as DocumentIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import CategoryCard from "../../components/admin/CategoryCard";
import CategoryDialog from "../../components/admin/CategoryDialog";
import DeleteCategoryDialog from "../../components/admin/DeleteCategoryDialog";
import CannotDeleteDialog from "../../components/admin/CannotDeleteDialog";
import categoriesAPI from "../../api/categories.api";

/**
 * CategoriesManagementPage Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const CategoriesManagementPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cannotDeleteDialogOpen, setCannotDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalDocuments: 0,
    emptyCategories: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  useEffect(() => {
    const totalDocs = categories.reduce(
      (sum, cat) => sum + (cat.documentCount || 0),
      0,
    );
    const emptyCats = categories.filter(
      (cat) => !cat.documentCount || cat.documentCount === 0,
    ).length;
    setStats({
      totalCategories: categories.length,
      totalDocuments: totalDocs,
      emptyCategories: emptyCats,
    });
  }, [categories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      const categoriesData = response.data?.categories || response.data || [];
      const normalizedCategories = categoriesData.map((cat) => ({
        ...cat,
        _id: cat._id || cat.id,
      }));
      setCategories(normalizedCategories);
      setFilteredCategories(normalizedCategories);
    } catch (error) {
      console.error("Fetch categories error:", error);
      showSnackbar("Không thể tải danh sách danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
    showSnackbar("Đã cập nhật dữ liệu", "success");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCreate = () => {
    setDialogMode("create");
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEdit = (category) => {
    setDialogMode("edit");
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    if (category.documentCount > 0) {
      setCannotDeleteDialogOpen(true);
    } else {
      setDeleteDialogOpen(true);
    }
  };

  const handleCategorySubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (dialogMode === "create") {
        const response = await categoriesAPI.create(formData);
        if (response.status === "success") {
          showSnackbar("Danh mục đã được tạo thành công!", "success");
          setCategoryDialogOpen(false);
          fetchCategories();
        }
      } else {
        const categoryId = selectedCategory._id || selectedCategory.id;
        const response = await categoriesAPI.update(categoryId, formData);
        if (response.status === "success") {
          showSnackbar("Danh mục đã được cập nhật!", "success");
          setCategoryDialogOpen(false);
          fetchCategories();
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
        fetchCategories();
      }
    } catch (error) {
      console.error("Delete category error:", error);
      if (error.response?.status === 400) {
        setDeleteDialogOpen(false);
        setCannotDeleteDialogOpen(true);
      } else {
        const errorMessage =
          error.response?.data?.message || "Không thể xóa danh mục";
        showSnackbar(errorMessage, "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDocs = () => {
    if (!selectedCategory) return;
    setCannotDeleteDialogOpen(false);
    const categoryId = selectedCategory._id || selectedCategory.id;
    navigate(`/admin/documents?category=${categoryId}`);
  };

  const handleMoveDocs = () => {
    setCannotDeleteDialogOpen(false);
    showSnackbar("Tính năng đang phát triển", "info");
  };

  const StatsCard = ({ icon: Icon, label, value, color, subtext }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#4A4A68",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.8125rem",
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1A1A2E",
              mt: 0.5,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: { xs: "1.75rem", sm: "2rem" },
            }}
          >
            {value}
          </Typography>
          {subtext && (
            <Typography
              sx={{ color: "#8E8EA9", mt: 0.5, fontSize: "0.8125rem" }}
            >
              {subtext}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            boxShadow: `0 4px 14px ${alpha(color, 0.4)}`,
          }}
        >
          <Icon sx={{ color: "white", fontSize: 24 }} />
        </Box>
      </Box>
    </Paper>
  );

  const SkeletonCard = ({ index }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "#E0E0E0",
        animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
        "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
      }}
    >
      <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="80%" height={28} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={40} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          pt: 2,
          borderTop: "1px solid #E0E0E0",
        }}
      >
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" width={80} />
      </Box>
    </Paper>
  );

  return (
    <>
      <Header />
      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC", pt: 4, pb: 6 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <AdminSidebar active="categories" />
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Hero Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: "24px",
                    background:
                      "linear-gradient(135deg, #7C4DFF 0%, #448AFF 50%, #00BCD4 100%)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "50%",
                      height: "100%",
                      background:
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                      opacity: 0.5,
                    }}
                  />
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 18 }} />
                      Dashboard / Danh mục
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "white",
                            fontFamily:
                              "'Plus Jakarta Sans', 'Inter', sans-serif",
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            fontSize: {
                              xs: "1.75rem",
                              sm: "2rem",
                              md: "2.25rem",
                            },
                          }}
                        >
                          Quản lý Danh mục
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            mt: 1,
                            fontSize: "1rem",
                          }}
                        >
                          Tổ chức và phân loại tài liệu thư viện
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Tooltip title="Làm mới dữ liệu" arrow>
                          <IconButton
                            onClick={handleRefresh}
                            disabled={refreshing}
                            sx={{
                              bgcolor: "rgba(255,255,255,0.2)",
                              backdropFilter: "blur(10px)",
                              color: "white",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                              "& .MuiSvgIcon-root": {
                                animation: refreshing
                                  ? "spin 1s linear infinite"
                                  : "none",
                              },
                              "@keyframes spin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" },
                              },
                            }}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleCreate}
                          sx={{
                            bgcolor: "white",
                            color: "#7C4DFF",
                            fontWeight: 600,
                            px: 3,
                            borderRadius: "12px",
                            fontSize: "0.9375rem",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.9)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                            },
                          }}
                        >
                          Thêm danh mục
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Stats Cards */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={FolderIcon}
                      label="Tổng danh mục"
                      value={stats.totalCategories}
                      color="#7C4DFF"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={DocumentIcon}
                      label="Tổng tài liệu"
                      value={stats.totalDocuments}
                      color="#2196F3"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={TrendingUpIcon}
                      label="Danh mục trống"
                      value={stats.emptyCategories}
                      color="#FF7043"
                      subtext="Chưa có tài liệu"
                    />
                  </Grid>
                </Grid>

                {/* Search & View Controls */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "#E0E0E0",
                    bgcolor: "white",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TextField
                      placeholder="Tìm kiếm danh mục..."
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#8E8EA9" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 250,
                        maxWidth: 400,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          bgcolor: "#F0F0F5",
                          fontSize: "0.9375rem",
                          "&:hover": { bgcolor: "#E8E8ED" },
                          "&.Mui-focused": { bgcolor: "white" },
                          "& fieldset": { borderColor: "transparent" },
                          "&:hover fieldset": { borderColor: "transparent" },
                          "&.Mui-focused fieldset": { borderColor: "#7C4DFF" },
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {searchQuery && (
                        <Chip
                          label={`${filteredCategories.length} kết quả`}
                          size="small"
                          sx={{
                            bgcolor: alpha("#7C4DFF", 0.1),
                            color: "#7C4DFF",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          bgcolor: "#F0F0F5",
                          borderRadius: "10px",
                          p: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => setViewMode("grid")}
                          sx={{
                            borderRadius: "8px",
                            bgcolor:
                              viewMode === "grid" ? "white" : "transparent",
                            boxShadow:
                              viewMode === "grid"
                                ? "0 2px 8px rgba(0,0,0,0.1)"
                                : "none",
                            color: viewMode === "grid" ? "#7C4DFF" : "#8E8EA9",
                            "&:hover": {
                              bgcolor:
                                viewMode === "grid" ? "white" : "#E8E8ED",
                            },
                          }}
                        >
                          <GridViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setViewMode("list")}
                          sx={{
                            borderRadius: "8px",
                            bgcolor:
                              viewMode === "list" ? "white" : "transparent",
                            boxShadow:
                              viewMode === "list"
                                ? "0 2px 8px rgba(0,0,0,0.1)"
                                : "none",
                            color: viewMode === "list" ? "#7C4DFF" : "#8E8EA9",
                            "&:hover": {
                              bgcolor:
                                viewMode === "list" ? "white" : "#E8E8ED",
                            },
                          }}
                        >
                          <ListViewIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Categories Grid */}
                {loading ? (
                  <Grid container spacing={3}>
                    {[...Array(6)].map((_, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <SkeletonCard index={index} />
                      </Grid>
                    ))}
                  </Grid>
                ) : filteredCategories.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 6,
                      borderRadius: "24px",
                      border: "1px solid",
                      borderColor: "#E0E0E0",
                      bgcolor: "white",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "24px",
                        background:
                          "linear-gradient(135deg, #F0F0F5 0%, #E0E0E8 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                      }}
                    >
                      <FolderIcon sx={{ fontSize: 56, color: "#C4C4D4" }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1A1A2E",
                        mb: 1,
                        fontSize: "1.125rem",
                      }}
                    >
                      {searchQuery
                        ? "Không tìm thấy danh mục"
                        : "Chưa có danh mục nào"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#8E8EA9", mb: 3, fontSize: "0.9375rem" }}
                    >
                      {searchQuery
                        ? `Không có kết quả cho "${searchQuery}"`
                        : 'Nhấn "Thêm danh mục" để tạo danh mục đầu tiên'}
                    </Typography>
                    {!searchQuery && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{
                          bgcolor: "#7C4DFF",
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          borderRadius: "12px",
                          fontSize: "0.9375rem",
                          "&:hover": { bgcolor: "#6B3FE8" },
                        }}
                      >
                        Thêm danh mục mới
                      </Button>
                    )}
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {filteredCategories.map((category, index) => (
                      <Fade in key={category._id} timeout={300 + index * 50}>
                        <Grid
                          item
                          xs={12}
                          sm={viewMode === "grid" ? 6 : 12}
                          md={viewMode === "grid" ? 4 : 12}
                        >
                          <CategoryCard
                            category={category}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            viewMode={viewMode}
                          />
                        </Grid>
                      </Fade>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => !actionLoading && setCategoryDialogOpen(false)}
        onSubmit={handleCategorySubmit}
        initialData={selectedCategory}
        loading={actionLoading}
        mode={dialogMode}
      />
      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onClose={() => !actionLoading && setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        categoryName={selectedCategory?.name || ""}
        loading={actionLoading}
      />
      <CannotDeleteDialog
        open={cannotDeleteDialogOpen}
        onClose={() => setCannotDeleteDialogOpen(false)}
        category={selectedCategory}
        onViewDocs={handleViewDocs}
        onMoveDocs={handleMoveDocs}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(26,26,46,0.15)",
            fontSize: "0.9375rem",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CategoriesManagementPage;
