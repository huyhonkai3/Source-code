import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  Pagination,
  Paper,
  InputAdornment,
  Skeleton,
  Snackbar,
  Alert,
  alpha,
  IconButton,
  Tooltip,
  Fade,
  Chip,
} from "@mui/material";
import {
  Description as DocumentIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
  LibraryBooks as LibraryIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StatCard from "../../components/admin/StatCard";
import AdminDocumentTable from "../../components/admin/AdminDocumentTable";
import DeleteDocumentDialog from "../../components/admin/DeleteDocumentDialog";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";

/**
 * DocumentsManagementPage Component - VLU Design System v2.0.1
 * Modern & Bold Admin page for managing all documents
 * UPDATED: Tăng font sizes để UX tốt hơn
 */
const DocumentsManagementPage = () => {
  // State
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    category: "all",
    startDate: "",
    endDate: "",
  });

  // Temp filter state
  const [tempFilters, setTempFilters] = useState({ ...filters });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    document: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocuments: 0,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10, sort: "-createdAt" };
      if (filters.q) params.q = filters.q;
      if (filters.status !== "all") params.status = filters.status;
      if (filters.category !== "all") params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await documentsAPI.getAllAdmin(params);
      const documentsData = response.data?.documents || [];
      const paginationData = response.data?.pagination || {};

      setDocuments(documentsData);
      setPagination({
        totalPages: paginationData.totalPages || 1,
        totalDocuments: paginationData.totalDocuments || 0,
      });
    } catch (error) {
      console.error("Fetch documents error:", error);
      showSnackbar("Không thể tải danh sách tài liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [
    currentPage,
    filters.q,
    filters.status,
    filters.category,
    filters.startDate,
    filters.endDate,
  ]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await documentsAPI.getDocumentStats();
      if (response.status === "success" && response.data?.overview) {
        const { overview } = response.data;
        setStats({
          total: overview.totalDocuments || 0,
          approved: overview.approvedDocuments || 0,
          pending: overview.pendingDocuments || 0,
          rejected: overview.rejectedDocuments || 0,
        });
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
      showSnackbar("Không thể tải thống kê", "error");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const categoriesData = response.data?.categories || response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDocuments(), fetchStats()]);
    setRefreshing(false);
    showSnackbar("Đã cập nhật dữ liệu", "success");
  };

  const handleSearchInputChange = (value) => {
    setTempFilters((prev) => ({ ...prev, q: value }));
  };

  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      q: "",
      status: "all",
      category: "all",
      startDate: "",
      endDate: "",
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDelete = (doc) => {
    setDeleteDialog({ open: true, document: doc });
  };

  const handleConfirmDelete = async (notifyAuthor) => {
    if (!deleteDialog.document) return;
    setDeleteLoading(true);
    try {
      const docId = deleteDialog.document._id || deleteDialog.document.id;
      await documentsAPI.deleteDocument(docId);
      console.log("Delete document with notifyAuthor:", notifyAuthor);
      showSnackbar("Tài liệu đã được xóa thành công!", "success");
      setDeleteDialog({ open: false, document: null });
      fetchDocuments();
      fetchStats();
    } catch (error) {
      console.error("Delete document error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể xóa tài liệu. Vui lòng thử lại.";
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!deleteLoading) {
      setDeleteDialog({ open: false, document: null });
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const hasActiveFilters =
    filters.q ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.startDate ||
    filters.endDate;

  const statsCards = [
    {
      title: "Tổng số tài liệu",
      value: stats.total,
      icon: <DocumentIcon sx={{ fontSize: 28 }} />,
      color: "primary",
    },
    {
      title: "Đã duyệt (Public)",
      value: stats.approved,
      icon: <ApprovedIcon sx={{ fontSize: 28 }} />,
      color: "success",
    },
    {
      title: "Chờ duyệt",
      value: stats.pending,
      icon: <PendingIcon sx={{ fontSize: 28 }} />,
      color: "warning",
    },
    {
      title: "Đã từ chối",
      value: stats.rejected,
      icon: <RejectedIcon sx={{ fontSize: 28 }} />,
      color: "error",
    },
  ];

  const selectStyles = {
    borderRadius: "12px",
    bgcolor: "white",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E0E0E0" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#C4C4D4" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#D32F2F",
    },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header />
      <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <AdminSidebar active="all-documents" pendingCount={stats.pending} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Hero Header */}
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
                    <LibraryIcon sx={{ fontSize: 18 }} /> Dashboard / Quản lý
                    tài liệu / Toàn bộ tài liệu
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
                        Quản lý Toàn bộ Tài liệu
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          mt: 1,
                          fontSize: "1rem",
                        }}
                      >
                        Xem, tìm kiếm và quản lý tất cả tài liệu trong hệ thống
                      </Typography>
                    </Box>
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
                  </Box>
                </Box>
              </Paper>

              {/* Stats Cards */}
              <Grid container spacing={2}>
                {statsCards.map((card, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box
                      sx={{
                        animation: "fadeInUp 0.4s ease forwards",
                        animationDelay: index * 0.1 + "s",
                        opacity: 0,
                        "@keyframes fadeInUp": {
                          from: { opacity: 0, transform: "translateY(20px)" },
                          to: { opacity: 1, transform: "translateY(0)" },
                        },
                      }}
                    >
                      <StatCard
                        title={card.title}
                        value={statsLoading ? "-" : card.value.toLocaleString()}
                        icon={card.icon}
                        color={card.color}
                        loading={statsLoading}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Filter Bar */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  bgcolor: "white",
                  boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                  border: "1px solid #F0F0F5",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: alpha("#7C4DFF", 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FilterIcon sx={{ fontSize: 20, color: "#7C4DFF" }} />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A2E",
                        fontSize: "1rem",
                      }}
                    >
                      Bộ lọc tìm kiếm
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilters}
                    sx={{
                      color: hasActiveFilters ? "#7C4DFF" : "#8E8EA9",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      "&:hover": { bgcolor: alpha("#7C4DFF", 0.08) },
                    }}
                  >
                    Đặt lại
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    placeholder="Tìm theo tên, tác giả..."
                    value={tempFilters.q}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleApplyFilters();
                    }}
                    size="small"
                    sx={{
                      flex: 1,
                      minWidth: 220,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#FAFAFC",
                        fontSize: "0.9375rem",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#C4C4D4",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#7C4DFF",
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#8E8EA9" }} />
                        </InputAdornment>
                      ),
                      endAdornment: tempFilters.q && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => handleSearchInputChange("")}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={tempFilters.status}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      sx={{ ...selectStyles, fontSize: "0.9375rem" }}
                    >
                      <MenuItem value="all" sx={{ fontSize: "0.9375rem" }}>
                        Tất cả trạng thái
                      </MenuItem>
                      <MenuItem value="approved" sx={{ fontSize: "0.9375rem" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <ApprovedIcon
                            sx={{ fontSize: 16, color: "#10B981" }}
                          />
                          Đã duyệt
                        </Box>
                      </MenuItem>
                      <MenuItem value="pending" sx={{ fontSize: "0.9375rem" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PendingIcon
                            sx={{ fontSize: 16, color: "#F59E0B" }}
                          />
                          Chờ duyệt
                        </Box>
                      </MenuItem>
                      <MenuItem value="rejected" sx={{ fontSize: "0.9375rem" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <RejectedIcon
                            sx={{ fontSize: 16, color: "#EF4444" }}
                          />
                          Từ chối
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={tempFilters.category}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      sx={{ ...selectStyles, fontSize: "0.9375rem" }}
                    >
                      <MenuItem value="all" sx={{ fontSize: "0.9375rem" }}>
                        Tất cả danh mục
                      </MenuItem>
                      {categories.map((cat) => (
                        <MenuItem
                          key={cat._id || cat.id}
                          value={cat._id || cat.id}
                          sx={{ fontSize: "0.9375rem" }}
                        >
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    type="date"
                    label="Từ ngày"
                    value={tempFilters.startDate}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        fontSize: "0.9375rem",
                      },
                      "& .MuiInputLabel-root": { fontSize: "0.875rem" },
                    }}
                  />
                  <TextField
                    type="date"
                    label="Đến ngày"
                    value={tempFilters.endDate}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        fontSize: "0.9375rem",
                      },
                      "& .MuiInputLabel-root": { fontSize: "0.875rem" },
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    sx={{
                      bgcolor: "#7C4DFF",
                      color: "white",
                      borderRadius: "12px",
                      px: 4,
                      py: 1,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "0.9375rem",
                      boxShadow: "0 4px 14px rgba(124,77,255,0.3)",
                      "&:hover": {
                        bgcolor: "#651FFF",
                        boxShadow: "0 6px 20px rgba(124,77,255,0.4)",
                      },
                    }}
                  >
                    Lọc
                  </Button>
                </Box>

                {hasActiveFilters && (
                  <Box
                    sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}
                  >
                    {filters.q && (
                      <Chip
                        label={`Tìm: "${filters.q}"`}
                        size="small"
                        onDelete={() =>
                          setFilters((prev) => ({ ...prev, q: "" }))
                        }
                        sx={{
                          bgcolor: alpha("#7C4DFF", 0.1),
                          color: "#7C4DFF",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          "& .MuiChip-deleteIcon": { color: "#7C4DFF" },
                        }}
                      />
                    )}
                    {filters.status !== "all" && (
                      <Chip
                        label={`Trạng thái: ${filters.status === "approved" ? "Đã duyệt" : filters.status === "pending" ? "Chờ duyệt" : "Từ chối"}`}
                        size="small"
                        onDelete={() =>
                          setFilters((prev) => ({ ...prev, status: "all" }))
                        }
                        sx={{
                          bgcolor: alpha("#10B981", 0.1),
                          color: "#10B981",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          "& .MuiChip-deleteIcon": { color: "#10B981" },
                        }}
                      />
                    )}
                    {filters.category !== "all" && (
                      <Chip
                        label={`Danh mục: ${categories.find((c) => (c._id || c.id) === filters.category)?.name || filters.category}`}
                        size="small"
                        onDelete={() =>
                          setFilters((prev) => ({ ...prev, category: "all" }))
                        }
                        sx={{
                          bgcolor: alpha("#2196F3", 0.1),
                          color: "#2196F3",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          "& .MuiChip-deleteIcon": { color: "#2196F3" },
                        }}
                      />
                    )}
                    {(filters.startDate || filters.endDate) && (
                      <Chip
                        label={`Ngày: ${filters.startDate || "..."} - ${filters.endDate || "..."}`}
                        size="small"
                        onDelete={() =>
                          setFilters((prev) => ({
                            ...prev,
                            startDate: "",
                            endDate: "",
                          }))
                        }
                        sx={{
                          bgcolor: alpha("#F59E0B", 0.1),
                          color: "#B45309",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          "& .MuiChip-deleteIcon": { color: "#B45309" },
                        }}
                      />
                    )}
                  </Box>
                )}
              </Paper>

              {/* Data Table */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  bgcolor: "white",
                  boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                  border: "1px solid #F0F0F5",
                }}
              >
                <AdminDocumentTable
                  documents={documents}
                  onDelete={handleDelete}
                  loading={loading}
                />
              </Paper>

              {/* Pagination */}
              {!loading && pagination.totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4A4A68",
                      fontWeight: 500,
                      fontSize: "0.9375rem",
                    }}
                  >
                    Hiển thị{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: "#1A1A2E" }}
                    >
                      {documents.length}
                    </Box>{" "}
                    trong tổng số{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: "#1A1A2E" }}
                    >
                      {pagination.totalDocuments}
                    </Box>{" "}
                    kết quả
                  </Typography>
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: "10px",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        "&.Mui-selected": {
                          bgcolor: "#7C4DFF",
                          color: "white",
                          boxShadow: "0 4px 14px rgba(124,77,255,0.3)",
                          "&:hover": { bgcolor: "#651FFF" },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <DeleteDocumentDialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        document={deleteDialog.document}
        loading={deleteLoading}
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
          sx={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            fontSize: "0.9375rem",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsManagementPage;
