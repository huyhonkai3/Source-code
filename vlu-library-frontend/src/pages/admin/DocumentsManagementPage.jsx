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
} from "@mui/material";
import {
  Description as DocumentIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StatCard from "../../components/admin/StatCard";
import AdminDocumentTable from "../../components/admin/AdminDocumentTable";
import DeleteDocumentDialog from "../../components/admin/DeleteDocumentDialog";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";

/**
 * DocumentsManagementPage Component
 * Admin page for managing all documents in the system
 */
const DocumentsManagementPage = () => {
  // State
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Temp filter state (for inputs before clicking "Lọc")
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

  /**
   * Fetch stats on mount
   */
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  /**
   * Fetch documents with current filters
   */
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        sort: "-createdAt",
      };

      // Add filters
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
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch documents when filters or page change
   */
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    filters.q,
    filters.status,
    filters.category,
    filters.startDate,
    filters.endDate,
  ]);

  /**
   * Fetch statistics
   */
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [all, approved, pending, rejected] = await Promise.all([
        documentsAPI.getAllAdmin({ limit: 1 }),
        documentsAPI.getAllAdmin({ status: "approved", limit: 1 }),
        documentsAPI.getAllAdmin({ status: "pending", limit: 1 }),
        documentsAPI.getAllAdmin({ status: "rejected", limit: 1 }),
      ]);

      setStats({
        total: all.data?.pagination?.totalDocuments || 0,
        approved: approved.data?.pagination?.totalDocuments || 0,
        pending: pending.data?.pagination?.totalDocuments || 0,
        rejected: rejected.data?.pagination?.totalDocuments || 0,
      });
    } catch (error) {
      console.error("Fetch stats error:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * Fetch categories for filter dropdown
   */
  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const categoriesData = response.data?.categories || response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  /**
   * Handle search input change
   */
  const handleSearchInputChange = (value) => {
    setTempFilters((prev) => ({ ...prev, q: value }));
  };

  /**
   * Handle filter button click
   */
  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
    setCurrentPage(1);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  /**
   * Handle delete document (open dialog)
   */
  const handleDelete = (doc) => {
    setDeleteDialog({
      open: true,
      document: doc,
    });
  };

  /**
   * Handle confirm delete from dialog
   */
  const handleConfirmDelete = async (notifyAuthor) => {
    if (!deleteDialog.document) return;

    setDeleteLoading(true);
    try {
      const docId = deleteDialog.document._id || deleteDialog.document.id;

      await documentsAPI.delete(docId);

      console.log("Delete document with notifyAuthor:", notifyAuthor);

      alert("Tài liệu đã được xóa thành công!");

      setDeleteDialog({ open: false, document: null });

      // Refresh data
      fetchDocuments();
      fetchStats();
    } catch (error) {
      console.error("Delete document error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể xóa tài liệu. Vui lòng thử lại.";
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle close delete dialog
   */
  const handleCloseDeleteDialog = () => {
    if (!deleteLoading) {
      setDeleteDialog({ open: false, document: null });
    }
  };

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <AdminSidebar active="all-documents" />
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Breadcrumb & Title */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Dashboard / Quản lý tài liệu / Toàn bộ tài liệu
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  Quản lý Toàn bộ Tài liệu hệ thống
                </Typography>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="TỔNG SỐ TÀI LIỆU"
                    value={stats.total}
                    icon={<DocumentIcon fontSize="large" />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="ĐÃ DUYỆT (PUBLIC)"
                    value={stats.approved}
                    icon={<ApprovedIcon fontSize="large" />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="CHỜ DUYỆT"
                    value={stats.pending}
                    icon={<PendingIcon fontSize="large" />}
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="ĐÃ TỪ CHỐI"
                    value={stats.rejected}
                    icon={<RejectedIcon fontSize="large" />}
                    color="error"
                  />
                </Grid>
              </Grid>

              {/* Filter Bar */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {/* Search Input with Debounce */}
                <TextField
                  placeholder="Tìm theo tên, tác giả, ID..."
                  value={tempFilters.q}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  size="small"
                  sx={{ flex: 1, minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />

                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={tempFilters.status}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <MenuItem key="all" value="all">
                      Tất cả trạng thái
                    </MenuItem>
                    <MenuItem key="approved" value="approved">
                      Đã duyệt
                    </MenuItem>
                    <MenuItem key="pending" value="pending">
                      Chờ duyệt
                    </MenuItem>
                    <MenuItem key="rejected" value="rejected">
                      Từ chối
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Category Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={tempFilters.category}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <MenuItem key="all" value="all">
                      Tất cả danh mục
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem
                        key={cat._id || cat.id}
                        value={cat._id || cat.id}
                      >
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Date Range */}
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
                  sx={{ width: 150 }}
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
                  sx={{ width: 150 }}
                />

                {/* Filter Button */}
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  sx={{
                    bgcolor: "text.primary",
                    "&:hover": {
                      bgcolor: "text.secondary",
                    },
                  }}
                >
                  Lọc
                </Button>
              </Box>

              {/* Data Table */}
              <AdminDocumentTable
                documents={documents}
                onDelete={handleDelete}
                loading={loading}
              />

              {/* Pagination */}
              {!loading && pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}

              {/* Results Info */}
              {!loading && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Hiển thị {documents.length} trong tổng số{" "}
                  {pagination.totalDocuments} kết quả
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Delete Document Dialog */}
      <DeleteDocumentDialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        document={deleteDialog.document}
        loading={deleteLoading}
      />
    </>
  );
};

export default DocumentsManagementPage;
