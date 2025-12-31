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
  Alert,
  Snackbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Skeleton,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  CloudUpload as UploadIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import documentsAPI from "../../api/documents.api";
import { useAuth } from "../../context/AuthContext";
import UploadDocumentDialog from "../../components/documents/UploadDocumentDialog";

/**
 * MyDocumentsPage Component - VLU Design System v2.0
 * Modern & Bold Author Dashboard - Quản lý tài liệu của tác giả
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
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        sort: "-createdAt",
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
    setPage(1);
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
   * Handle upload button click
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
   * Handle delete button click
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
    setDeleteLoading(true);
    try {
      const response = await documentsAPI.deleteDocument(
        deleteDialog.documentId,
      );

      if (response.status === "success") {
        showSnackbar("Xóa tài liệu thành công", "success");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Delete document error:", error);
      const errorMessage =
        error.response?.data?.message || "Xóa tài liệu thất bại";
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteLoading(false);
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
   * Get status chip configuration - Design System v2.0
   */
  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        label: "Đã duyệt",
        color: "#4CAF50",
        bgColor: alpha("#4CAF50", 0.1),
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      },
      pending: {
        label: "Chờ duyệt",
        color: "#FF9800",
        bgColor: alpha("#FF9800", 0.1),
        icon: <AccessTimeIcon sx={{ fontSize: 16 }} />,
      },
      rejected: {
        label: "Từ chối",
        color: "#D32F2F",
        bgColor: alpha("#D32F2F", 0.1),
        icon: <InfoIcon sx={{ fontSize: 16 }} />,
      },
    };
    return configs[status] || configs.pending;
  };

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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

  // Stats cards configuration - Design System v2.0
  const statsCards = [
    {
      label: "Tổng tài liệu",
      value: stats.total,
      icon: FolderIcon,
      color: "#2196F3",
      gradient: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)",
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      icon: CheckCircleIcon,
      color: "#4CAF50",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: AccessTimeIcon,
      color: "#FF9800",
      gradient: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header />

      <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
        <Grid container spacing={3}>
          {/* ========== LEFT SIDEBAR ========== */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="my-documents" />
          </Grid>

          {/* ========== RIGHT CONTENT ========== */}
          <Grid item xs={12} md={9}>
            {/* ========== STATS CARDS ========== */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Grid item xs={12} sm={4} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "16px",
                        bgcolor: "white",
                        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                        border: "1px solid #F0F0F5",
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 4px 20px rgba(26,26,46,0.1)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "14px",
                          background: card.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 4px 14px ${alpha(card.color, 0.3)}`,
                        }}
                      >
                        <Icon sx={{ fontSize: 28, color: "white" }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: "#1A1A2E",
                            lineHeight: 1,
                          }}
                        >
                          {loading ? <Skeleton width={40} /> : card.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#8E8EA9",
                            fontWeight: 500,
                            mt: 0.5,
                          }}
                        >
                          {card.label}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* ========== MAIN CONTENT PAPER ========== */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                bgcolor: "white",
                boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                border: "1px solid #F0F0F5",
              }}
            >
              {/* Toolbar */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid #F0F0F5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: alpha("#D32F2F", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DocumentIcon sx={{ fontSize: 20, color: "#D32F2F" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1A1A2E" }}
                  >
                    Danh sách tài liệu
                  </Typography>
                </Box>

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
                          <SearchIcon sx={{ color: "#8E8EA9" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 250,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#FAFAFC",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#C4C4D4",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#D32F2F",
                        },
                      },
                    }}
                  />

                  {/* Upload Button */}
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleUploadClick}
                    sx={{
                      bgcolor: "#D32F2F",
                      color: "white",
                      borderRadius: "12px",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                      "&:hover": {
                        bgcolor: "#B71C1C",
                        boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
                      },
                    }}
                  >
                    Tải lên tài liệu mới
                  </Button>
                </Box>
              </Box>

              {/* ========== TABLE ========== */}
              <TableContainer>
                {loading ? (
                  <Box sx={{ p: 4 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Box
                        key={n}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          py: 2,
                          borderBottom: "1px solid #F0F0F5",
                        }}
                      >
                        <Skeleton variant="rounded" width={50} height={50} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="30%" height={20} />
                        </Box>
                        <Skeleton variant="rounded" width={80} height={28} />
                        <Skeleton variant="rounded" width={100} height={28} />
                      </Box>
                    ))}
                  </Box>
                ) : documents.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#FAFAFC" }}>
                        <TableCell sx={{ fontWeight: 700, color: "#1A1A2E" }}>
                          Tên tài liệu
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#1A1A2E" }}>
                          Danh mục
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#1A1A2E" }}>
                          Ngày đăng
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#1A1A2E" }}>
                          Trạng thái
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, color: "#1A1A2E" }}
                          align="center"
                        >
                          Tương tác
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, color: "#1A1A2E" }}
                          align="center"
                        >
                          Hành động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc, index) => {
                        const statusConfig = getStatusConfig(doc.status);
                        return (
                          <TableRow
                            key={doc.id}
                            sx={{
                              "&:hover": {
                                bgcolor: "#FAFAFC",
                              },
                              animation: "fadeIn 0.3s ease forwards",
                              animationDelay: `${index * 0.05}s`,
                              opacity: 0,
                              "@keyframes fadeIn": {
                                to: { opacity: 1 },
                              },
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
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "10px",
                                    bgcolor: "#F0F0F5",
                                  }}
                                >
                                  <FolderIcon sx={{ color: "#8E8EA9" }} />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#1A1A2E",
                                      maxWidth: 250,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {doc.title}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#8E8EA9" }}
                                  >
                                    {doc.fileName} •{" "}
                                    {formatFileSize(doc.fileSize)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Category */}
                            <TableCell>
                              <Chip
                                label={doc.category?.name || "N/A"}
                                size="small"
                                sx={{
                                  bgcolor: "#F0F0F5",
                                  color: "#4A4A68",
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>

                            {/* Date */}
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ color: "#4A4A68" }}
                              >
                                {formatDate(doc.createdAt)}
                              </Typography>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={statusConfig.label}
                                  icon={statusConfig.icon}
                                  size="small"
                                  sx={{
                                    bgcolor: statusConfig.bgColor,
                                    color: statusConfig.color,
                                    fontWeight: 600,
                                    "& .MuiChip-icon": {
                                      color: statusConfig.color,
                                    },
                                  }}
                                />
                                {doc.status === "rejected" &&
                                  doc.rejectionReason && (
                                    <Tooltip
                                      title={`Lý do: ${doc.rejectionReason}`}
                                      arrow
                                    >
                                      <IconButton size="small">
                                        <InfoIcon
                                          sx={{
                                            fontSize: 18,
                                            color: "#D32F2F",
                                          }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                              </Box>
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
                                    sx={{ fontSize: 16, color: "#8E8EA9" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#4A4A68" }}
                                  >
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
                                    sx={{ fontSize: 16, color: "#8E8EA9" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#4A4A68" }}
                                  >
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
                                {doc.status === "pending" && (
                                  <Tooltip title="Chỉnh sửa" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditClick(doc.id)}
                                      sx={{
                                        color: "#2196F3",
                                        "&:hover": {
                                          bgcolor: alpha("#2196F3", 0.1),
                                        },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Xóa" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(doc)}
                                    sx={{
                                      color: "#D32F2F",
                                      "&:hover": {
                                        bgcolor: alpha("#D32F2F", 0.1),
                                      },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  /* Empty State */
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
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        bgcolor: alpha("#D32F2F", 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <FolderIcon sx={{ fontSize: 48, color: "#D32F2F" }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
                    >
                      Chưa có tài liệu nào
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#8E8EA9", mb: 3 }}
                    >
                      Bắt đầu bằng cách tải lên tài liệu đầu tiên của bạn
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={handleUploadClick}
                      sx={{
                        bgcolor: "#D32F2F",
                        color: "white",
                        borderRadius: "12px",
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                        "&:hover": {
                          bgcolor: "#B71C1C",
                        },
                      }}
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
                      borderTop: "1px solid #F0F0F5",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
                      Hiển thị {documents.length} trong số{" "}
                      {pagination.totalDocuments} tài liệu
                    </Typography>
                    <Pagination
                      count={pagination.totalPages}
                      page={page}
                      onChange={handlePageChange}
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: "10px",
                          fontWeight: 600,
                          "&.Mui-selected": {
                            bgcolor: "#D32F2F",
                            color: "white",
                            "&:hover": {
                              bgcolor: "#B71C1C",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ========== UPLOAD DIALOG ========== */}
      <UploadDocumentDialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        onSuccess={handleUploadSuccess}
      />

      {/* ========== DELETE CONFIRMATION DIALOG ========== */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 24px 48px rgba(26,26,46,0.2)",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                bgcolor: alpha("#D32F2F", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon sx={{ fontSize: 36, color: "#D32F2F" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
              Xác nhận xóa tài liệu
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 0 }}>
          <Typography sx={{ color: "#4A4A68", textAlign: "center" }}>
            Bạn có chắc chắn muốn xóa tài liệu{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
              "{deleteDialog.documentTitle}"
            </Box>
            ?
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              color: "#8E8EA9",
              textAlign: "center",
            }}
          >
            Hành động này không thể hoàn tác
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            onClick={handleCancelDelete}
            disabled={deleteLoading}
            sx={{
              flex: 1,
              color: "#4A4A68",
              borderRadius: "12px",
              py: 1.25,
              fontWeight: 600,
              textTransform: "none",
              border: "1px solid #E0E0E0",
              "&:hover": {
                bgcolor: "#FAFAFC",
                borderColor: "#C4C4D4",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{
              flex: 1,
              bgcolor: "#D32F2F",
              color: "white",
              borderRadius: "12px",
              py: 1.25,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
              "&:hover": {
                bgcolor: "#B71C1C",
              },
              "&.Mui-disabled": {
                bgcolor: "#E0E0E0",
                color: "#8E8EA9",
              },
            }}
          >
            {deleteLoading ? "Đang xóa..." : "Xóa tài liệu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== SNACKBAR ========== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyDocumentsPage;
