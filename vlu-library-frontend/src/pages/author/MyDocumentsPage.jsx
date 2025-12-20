import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import documentsAPI from "../../api/documents.api";
import { useAuth } from "../../context/AuthContext";
// Import Component Dialog mới
import UploadDocumentDialog from "../../components/documents/UploadDocumentDialog";

/**
 * MyDocumentsPage Component
 * Author Dashboard - Quản lý tài liệu của tác giả
 */
const MyDocumentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data state
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalViews: 0,
    totalDownloads: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    limit: 10,
  });

  // Upload Dialog State
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    documentId: null,
    documentTitle: "",
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Fetch documents on mount and when filters change
   */
  useEffect(() => {
    fetchDocuments();
  }, [page, searchQuery]);

  /**
   * Fetch documents from API
   */
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        q: searchQuery,
        sort: "-createdAt", // Newest first
      };

      const response = await documentsAPI.getMyDocuments(params);

      if (response.status === "success") {
        setDocuments(response.data.documents || []);
        setPagination(response.data.pagination || pagination);
        setStats(response.data.stats || stats);
      }
    } catch (error) {
      console.error("Fetch documents error:", error);
      showSnackbar("Không thể tải danh sách tài liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search
   */
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1); // Reset to page 1 when searching
    fetchDocuments();
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handle upload button click - Open Dialog
   */
  const handleUploadClick = () => {
    setOpenUploadDialog(true);
  };

  /**
   * Handle close upload dialog
   */
  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
  };

  /**
   * Handle upload success callback
   */
  const handleUploadSuccess = () => {
    showSnackbar("Tải lên tài liệu thành công!", "success");
    // Refresh list để thấy tài liệu mới
    setPage(1);
    fetchDocuments();
  };

  /**
   * Handle edit button click
   */
  const handleEditClick = (documentId) => {
    navigate(`/documents/edit/${documentId}`);
  };

  /**
   * Handle delete button click - Open confirmation dialog
   */
  const handleDeleteClick = (doc) => {
    setDeleteDialog({
      open: true,
      documentId: doc.id,
      documentTitle: doc.title,
    });
  };

  /**
   * Confirm delete document
   */
  const handleConfirmDelete = async () => {
    try {
      const response = await documentsAPI.deleteDocument(
        deleteDialog.documentId,
      );

      if (response.status === "success") {
        showSnackbar("Xóa tài liệu thành công", "success");
        // Refresh list
        fetchDocuments();
      }
    } catch (error) {
      console.error("Delete document error:", error);
      const errorMessage =
        error.response?.data?.message || "Xóa tài liệu thất bại";
      showSnackbar(errorMessage, "error");
    } finally {
      // Close dialog
      setDeleteDialog({
        open: false,
        documentId: null,
        documentTitle: "",
      });
    }
  };

  /**
   * Cancel delete
   */
  const handleCancelDelete = () => {
    setDeleteDialog({
      open: false,
      documentId: null,
      documentTitle: "",
    });
  };

  /**
   * Get status chip configuration
   */
  const getStatusChip = (status) => {
    const configs = {
      approved: {
        label: "Đã duyệt",
        color: "success",
        icon: <CheckCircleIcon fontSize="small" />,
      },
      pending: {
        label: "Chờ duyệt",
        color: "warning",
        icon: <AccessTimeIcon fontSize="small" />,
      },
      rejected: {
        label: "Từ chối",
        color: "error",
        icon: <InfoIcon fontSize="small" />,
      },
    };

    return configs[status] || configs.pending;
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
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  // Stats cards data
  const statsCards = [
    {
      label: "Tổng tài liệu",
      value: stats.total,
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      color: "primary.main",
      bgColor: "primary.lighter",
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: "success.main",
      bgColor: "success.lighter",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      color: "warning.main",
      bgColor: "warning.lighter",
    },
  ];

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="my-documents" />
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statsCards.map((card, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "light"
                            ? `${card.bgColor}`
                            : card.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.color,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={card.color}
                      >
                        {card.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {card.label}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Main Content Paper */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {/* Toolbar */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  DANH SÁCH TÀI LIỆU
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Search */}
                  <TextField
                    size="small"
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch(e);
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 250 }}
                  />

                  {/* Upload Button */}
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleUploadClick}
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Tải lên tài liệu mới
                  </Button>
                </Box>
              </Box>

              {/* Table */}
              <TableContainer>
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
                ) : documents.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Tên tài liệu
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Danh mục
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Ngày đăng
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Trạng thái
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }} align="center">
                          Tương tác
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }} align="center">
                          Hành động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc) => {
                        const statusConfig = getStatusChip(doc.status);
                        return (
                          <TableRow
                            key={doc.id}
                            hover
                            sx={{
                              "&:last-child td": { borderBottom: 0 },
                            }}
                          >
                            {/* Title with thumbnail */}
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  src={doc.coverImage}
                                  variant="rounded"
                                  sx={{ width: 50, height: 50 }}
                                >
                                  <FolderIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {doc.title}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {doc.fileName} •{" "}
                                    {formatFileSize(doc.fileSize)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Category */}
                            <TableCell>
                              <Typography variant="body2">
                                {doc.category?.name || "N/A"}
                              </Typography>
                            </TableCell>

                            {/* Date */}
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(doc.createdAt)}
                              </Typography>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Chip
                                label={statusConfig.label}
                                color={statusConfig.color}
                                size="small"
                                icon={statusConfig.icon}
                                sx={{ fontWeight: 600 }}
                              />
                              {doc.status === "rejected" &&
                                doc.rejectionReason && (
                                  <Tooltip
                                    title={`Lý do: ${doc.rejectionReason}`}
                                    arrow
                                  >
                                    <IconButton size="small" sx={{ ml: 0.5 }}>
                                      <InfoIcon
                                        fontSize="small"
                                        color="error"
                                      />
                                    </IconButton>
                                  </Tooltip>
                                )}
                            </TableCell>

                            {/* Interactions */}
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  justifyContent: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <VisibilityIcon
                                    fontSize="small"
                                    color="action"
                                  />
                                  <Typography variant="body2">
                                    {doc.views}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <DownloadIcon
                                    fontSize="small"
                                    color="action"
                                  />
                                  <Typography variant="body2">
                                    {doc.downloads}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Actions */}
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  gap: 0.5,
                                }}
                              >
                                {/* Edit button - only for pending */}
                                {doc.status === "pending" && (
                                  <Tooltip title="Chỉnh sửa" arrow>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleEditClick(doc.id)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {/* Delete button - for pending/rejected */}
                                {(doc.status === "pending" ||
                                  doc.status === "rejected" ||
                                  doc.status === "approved") && (
                                  <Tooltip title="Xóa" arrow>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteClick(doc)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 400,
                      p: 4,
                    }}
                  >
                    <FolderIcon
                      sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      Chưa có tài liệu nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Bắt đầu bằng cách tải lên tài liệu đầu tiên của bạn
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={handleUploadClick}
                    >
                      Tải lên tài liệu mới
                    </Button>
                  </Box>
                )}
              </TableContainer>

              {/* Pagination */}
              {!loading &&
                documents.length > 0 &&
                pagination.totalPages > 1 && (
                  <Box
                    sx={{
                      p: 3,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Hiển thị {documents.length} trong số{" "}
                      {pagination.totalDocuments} tài liệu
                    </Typography>
                    <Pagination
                      count={pagination.totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        onSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa tài liệu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tài liệu{" "}
            <strong>"{deleteDialog.documentTitle}"</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelDelete} variant="text">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Xóa tài liệu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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

export default MyDocumentsPage;
