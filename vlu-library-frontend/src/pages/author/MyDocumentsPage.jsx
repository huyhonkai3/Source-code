/**
 * MyDocumentsPage - VLU Design System v2.0.1
 * GenZ Style: Tươi sáng, colorful, gradient cards, playful animations
 * Author Dashboard - Quản lý tài liệu của tác giả
 *
 * Đường dẫn: src/pages/author/MyDocumentsPage.jsx
 */

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
  Fade,
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
  AutoAwesome as SparkleIcon,
  Rocket as RocketIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import documentsAPI from "../../api/documents.api";
import { useAuth } from "../../context/AuthContext";
import UploadDocumentDialog from "../../components/documents/UploadDocumentDialog";
import EditDocumentDialog from "../../components/documents/EditDocumentDialog";

/**
 * GenZ Vibrant Color Palette
 */
const COLORS = {
  primary: "#D32F2F", // VLU Red
  success: "#34D399", // Green
  warning: "#FBBF24", // Yellow
  danger: "#F87171", // Red
  info: "#60A5FA", // Blue
  pink: "#FF6B6B", // Light Red/Coral
  teal: "#2DD4BF", // Teal
  orange: "#FB923C", // Orange
};

/**
 * Get file icon and color based on file extension
 */
const getFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    return { icon: PdfIcon, color: "#EF4444", bgColor: alpha("#EF4444", 0.1) };
  }
  if (ext === "epub") {
    return { icon: EpubIcon, color: "#F59E0B", bgColor: alpha("#F59E0B", 0.1) };
  }
  return {
    icon: FolderIcon,
    color: COLORS.primary,
    bgColor: alpha(COLORS.primary, 0.1),
  };
};

/**
 * Stats Card Component - GenZ Style
 */
const StatsCard = ({
  icon: Icon,
  label,
  value,
  color,
  gradient,
  delay,
  loading,
}) => (
  <Fade in timeout={400 + delay}>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "24px",
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 100%)`,
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "20px",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${alpha(color, 0.4)}`,
          transition: "transform 0.3s ease",
          "&:hover": { transform: "rotate(-5deg) scale(1.1)" },
        }}
      >
        <Icon sx={{ fontSize: 32, color: "white" }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            color: "#1A1A2E",
            fontSize: "2rem",
            lineHeight: 1,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {loading ? <Skeleton width={50} /> : value}
        </Typography>
        <Typography
          sx={{
            color: "#6B7280",
            fontWeight: 500,
            mt: 0.5,
            fontSize: "0.9375rem",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  </Fade>
);

/**
 * Document Row Component - GenZ Style
 */
const DocumentRow = ({
  doc,
  index,
  onEdit,
  onDelete,
  getStatusConfig,
  formatDate,
  formatFileSize,
}) => {
  const statusConfig = getStatusConfig(doc.status);
  const [isHovered, setIsHovered] = useState(false);
  const fileInfo = getFileIcon(doc.fileName);
  const FileIcon = fileInfo.icon;

  return (
    <TableRow
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        bgcolor: isHovered ? alpha(COLORS.primary, 0.04) : "transparent",
        transition: "all 0.3s ease",
        animation: "slideIn 0.4s ease forwards",
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        "@keyframes slideIn": {
          from: { opacity: 0, transform: "translateX(-20px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      }}
    >
      {/* Title with thumbnail */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {doc.coverImage ? (
            <Avatar
              src={doc.coverImage}
              variant="rounded"
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                bgcolor: fileInfo.bgColor,
                transition: "transform 0.3s ease",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
              }}
            >
              <FileIcon sx={{ color: fileInfo.color }} />
            </Avatar>
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                bgcolor: fileInfo.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.3s ease",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
              }}
            >
              <FileIcon sx={{ fontSize: 28, color: fileInfo.color }} />
            </Box>
          )}
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                fontSize: "0.9375rem",
                maxWidth: 280,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.title}
            </Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.8125rem" }}>
              {doc.fileName} • {formatFileSize(doc.fileSize)}
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
            bgcolor: alpha(COLORS.info, 0.1),
            color: COLORS.info,
            fontWeight: 600,
            fontSize: "0.8125rem",
            borderRadius: "10px",
          }}
        />
      </TableCell>

      {/* Date */}
      <TableCell>
        <Typography sx={{ color: "#4B5563", fontSize: "0.875rem" }}>
          {formatDate(doc.createdAt)}
        </Typography>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={statusConfig.label}
            icon={statusConfig.icon}
            size="small"
            sx={{
              bgcolor: statusConfig.bgColor,
              color: statusConfig.color,
              fontWeight: 600,
              fontSize: "0.8125rem",
              borderRadius: "10px",
              "& .MuiChip-icon": { color: statusConfig.color },
            }}
          />
          {doc.status === "rejected" && doc.rejectionReason && (
            <Tooltip title={`Lý do: ${doc.rejectionReason}`} arrow>
              <IconButton size="small">
                <InfoIcon sx={{ fontSize: 18, color: COLORS.danger }} />
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
            gap: 3,
            justifyContent: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                bgcolor: alpha(COLORS.info, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VisibilityIcon sx={{ fontSize: 16, color: COLORS.info }} />
            </Box>
            <Typography
              sx={{ color: "#4B5563", fontWeight: 600, fontSize: "0.875rem" }}
            >
              {doc.views || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                bgcolor: alpha(COLORS.success, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DownloadIcon sx={{ fontSize: 16, color: COLORS.success }} />
            </Box>
            <Typography
              sx={{ color: "#4B5563", fontWeight: 600, fontSize: "0.875rem" }}
            >
              {doc.downloads || 0}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {(doc.status === "pending" || doc.status === "rejected") && (
            <Tooltip
              title={
                doc.status === "rejected" ? "Chỉnh sửa & Gửi lại" : "Chỉnh sửa"
              }
              arrow
            >
              <IconButton
                size="small"
                onClick={() => onEdit(doc)}
                sx={{
                  bgcolor: alpha(COLORS.info, 0.1),
                  color: COLORS.info,
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: alpha(COLORS.info, 0.2),
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Xóa" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(doc)}
              sx={{
                bgcolor: alpha(COLORS.danger, 0.1),
                color: COLORS.danger,
                borderRadius: "10px",
                "&:hover": {
                  bgcolor: alpha(COLORS.danger, 0.2),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};

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

  // Dialog states
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    documentId: null,
    documentTitle: "",
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    document: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDocuments();
  }, [page, searchQuery]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, q: searchQuery, sort: "-createdAt" };
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

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchDocuments();
  };
  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleUploadClick = () => setOpenUploadDialog(true);
  const handleCloseUploadDialog = () => setOpenUploadDialog(false);
  const handleUploadSuccess = () => {
    showSnackbar("Tải lên tài liệu thành công! 🎉", "success");
    setPage(1);
    fetchDocuments();
  };
  const handleEditClick = (doc) => {
    setEditDialog({
      open: true,
      document: doc,
    });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({
      open: false,
      document: null,
    });
  };

  const handleEditSuccess = () => {
    const wasRejected = editDialog.document?.status === "rejected";
    showSnackbar(
      wasRejected
        ? "Tài liệu đã được cập nhật và gửi lại để kiểm duyệt! 🔄"
        : "Cập nhật tài liệu thành công!",
      "success",
    );
    handleCloseEditDialog();
    fetchDocuments(); // Refresh danh sách
  };

  const handleDeleteClick = (doc) =>
    setDeleteDialog({
      open: true,
      documentId: doc.id,
      documentTitle: doc.title,
    });

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
      showSnackbar(
        error.response?.data?.message || "Xóa tài liệu thất bại",
        "error",
      );
    } finally {
      setDeleteLoading(false);
      setDeleteDialog({ open: false, documentId: null, documentTitle: "" });
    }
  };

  const handleCancelDelete = () =>
    setDeleteDialog({ open: false, documentId: null, documentTitle: "" });

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        label: "Đã duyệt",
        color: COLORS.success,
        bgColor: alpha(COLORS.success, 0.1),
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
      },
      pending: {
        label: "Chờ duyệt",
        color: COLORS.warning,
        bgColor: alpha(COLORS.warning, 0.15),
        icon: <AccessTimeIcon sx={{ fontSize: 16 }} />,
      },
      rejected: {
        label: "Từ chối",
        color: COLORS.danger,
        bgColor: alpha(COLORS.danger, 0.1),
        icon: <InfoIcon sx={{ fontSize: 16 }} />,
      },
    };
    return configs[status] || configs.pending;
  };

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  // Stats cards configuration - GenZ Style
  const statsCards = [
    {
      label: "Tổng tài liệu",
      value: stats.total,
      icon: FolderIcon,
      color: COLORS.primary,
      gradient: `linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)`,
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      icon: CheckCircleIcon,
      color: COLORS.success,
      gradient: `linear-gradient(135deg, ${COLORS.success} 0%, #6EE7B7 100%)`,
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: AccessTimeIcon,
      color: COLORS.warning,
      gradient: `linear-gradient(135deg, ${COLORS.warning} 0%, #FCD34D 100%)`,
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
            {/* Hero Section */}
            <Box sx={{ mb: 4, position: "relative" }}>
              {/* Decorative blobs */}
              <Box
                sx={{
                  position: "absolute",
                  top: -30,
                  right: "10%",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.pink} 100%)`,
                  opacity: 0.15,
                  filter: "blur(30px)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  right: "30%",
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.success} 100%)`,
                  opacity: 0.15,
                  filter: "blur(25px)",
                }}
              />

              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: "100px",
                  bgcolor: alpha(COLORS.primary, 0.1),
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.primary,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                  }}
                >
                  Author Dashboard
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#1A1A2E",
                  mb: 1,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                Xin chào,{" "}
                <Box
                  component="span"
                  sx={{
                    background:
                      "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {user?.name?.split(" ").pop() || "Tác giả"}! 👋
                </Box>
              </Typography>
              <Typography
                sx={{ color: "#6B7280", fontSize: "1rem", maxWidth: 500 }}
              >
                Quản lý và theo dõi tài liệu của bạn tại đây. Tiếp tục đóng góp
                tri thức nào!
              </Typography>
            </Box>

            {/* ========== STATS CARDS ========== */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {statsCards.map((card, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <StatsCard {...card} delay={index * 100} loading={loading} />
                </Grid>
              ))}
            </Grid>

            {/* ========== MAIN CONTENT PAPER ========== */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "24px",
                overflow: "hidden",
                bgcolor: "white",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              {/* Toolbar */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid #F3F4F6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  background: `linear-gradient(135deg, ${alpha(COLORS.primary, 0.03)} 0%, transparent 100%)`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 16px rgba(211, 47, 47, 0.35)",
                    }}
                  >
                    <DocumentIcon sx={{ fontSize: 22, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A2E",
                        fontSize: "1.125rem",
                      }}
                    >
                      Danh sách tài liệu
                    </Typography>
                    <Typography
                      sx={{ color: "#9CA3AF", fontSize: "0.8125rem" }}
                    >
                      {pagination.totalDocuments} tài liệu
                    </Typography>
                  </Box>
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
                      if (e.key === "Enter") handleSearch(e);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#9CA3AF" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 260,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        bgcolor: "#F9FAFB",
                        fontSize: "0.9375rem",
                        "& fieldset": { borderColor: "#E5E7EB" },
                        "&:hover fieldset": { borderColor: COLORS.primary },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
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
                      background:
                        "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                      color: "white",
                      borderRadius: "14px",
                      px: 3,
                      py: 1.25,
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      textTransform: "none",
                      boxShadow: "0 6px 20px rgba(211, 47, 47, 0.4)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #B71C1C 0%, #EF5350 100%)",
                        boxShadow: "0 8px 28px rgba(211, 47, 47, 0.5)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Tải lên tài liệu
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
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        <Skeleton
                          variant="rounded"
                          width={56}
                          height={56}
                          sx={{ borderRadius: "14px" }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="30%" height={20} />
                        </Box>
                        <Skeleton
                          variant="rounded"
                          width={80}
                          height={28}
                          sx={{ borderRadius: "10px" }}
                        />
                        <Skeleton
                          variant="rounded"
                          width={100}
                          height={28}
                          sx={{ borderRadius: "10px" }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : documents.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#374151",
                            fontSize: "0.875rem",
                            py: 2,
                          }}
                        >
                          Tên tài liệu
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#374151",
                            fontSize: "0.875rem",
                            py: 2,
                          }}
                        >
                          Danh mục
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#374151",
                            fontSize: "0.875rem",
                            py: 2,
                          }}
                        >
                          Ngày đăng
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#374151",
                            fontSize: "0.875rem",
                            py: 2,
                          }}
                        >
                          Trạng thái
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#374151",
                            fontSize: "0.875rem",
                            py: 2,
                          }}
                          align="center"
                        >
                          Tương tác
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#374151",
                            fontSize: "0.875rem",
                            py: 2,
                          }}
                          align="center"
                        >
                          Hành động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc, index) => (
                        <DocumentRow
                          key={doc.id}
                          doc={doc}
                          index={index}
                          onEdit={handleEditClick}
                          onDelete={handleDeleteClick}
                          getStatusConfig={getStatusConfig}
                          formatDate={formatDate}
                          formatFileSize={formatFileSize}
                        />
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  /* Empty State - GenZ Style */
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
                        width: 120,
                        height: 120,
                        borderRadius: "32px",
                        background:
                          "linear-gradient(135deg, rgba(211, 47, 47, 0.15) 0%, rgba(255, 107, 107, 0.1) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        position: "relative",
                      }}
                    >
                      <RocketIcon sx={{ fontSize: 56, color: "#D32F2F" }} />
                      <Box
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: COLORS.warning,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <SparkleIcon sx={{ fontSize: 18, color: "white" }} />
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A2E",
                        mb: 1,
                        fontSize: "1.25rem",
                      }}
                    >
                      Chưa có tài liệu nào
                    </Typography>
                    <Typography
                      sx={{
                        color: "#6B7280",
                        mb: 3,
                        fontSize: "0.9375rem",
                        textAlign: "center",
                        maxWidth: 300,
                      }}
                    >
                      Bắt đầu hành trình chia sẻ tri thức bằng cách tải lên tài
                      liệu đầu tiên của bạn! 🚀
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={handleUploadClick}
                      sx={{
                        background:
                          "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                        color: "white",
                        borderRadius: "14px",
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "1rem",
                        textTransform: "none",
                        boxShadow: "0 8px 24px rgba(211, 47, 47, 0.4)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #B71C1C 0%, #EF5350 100%)",
                          transform: "translateY(-3px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Tải lên tài liệu đầu tiên
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
                      borderTop: "1px solid #F3F4F6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
                      Hiển thị {documents.length} trong số{" "}
                      {pagination.totalDocuments} tài liệu
                    </Typography>
                    <Pagination
                      count={pagination.totalPages}
                      page={page}
                      onChange={handlePageChange}
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          "&.Mui-selected": {
                            background:
                              "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                            color: "white",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #B71C1C 0%, #EF5350 100%)",
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

      {/* ========== EDIT DIALOG ========== */}
      <EditDocumentDialog
        open={editDialog.open}
        onClose={handleCloseEditDialog}
        onSuccess={handleEditSuccess}
        document={editDialog.document}
      />

      {/* ========== DELETE CONFIRMATION DIALOG - GenZ Style ========== */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            boxShadow: "0 24px 48px rgba(26,26,46,0.2)",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                borderRadius: "24px",
                background: `linear-gradient(135deg, ${alpha(COLORS.danger, 0.15)} 0%, ${alpha(COLORS.orange, 0.1)} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon sx={{ fontSize: 40, color: COLORS.danger }} />
            </Box>
            <Typography
              sx={{ fontWeight: 700, color: "#1A1A2E", fontSize: "1.25rem" }}
            >
              Xác nhận xóa tài liệu
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 0 }}>
          <Typography
            sx={{
              color: "#4B5563",
              textAlign: "center",
              fontSize: "0.9375rem",
            }}
          >
            Bạn có chắc chắn muốn xóa tài liệu{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
              "{deleteDialog.documentTitle}"
            </Box>
            ?
          </Typography>
          <Typography
            sx={{
              display: "block",
              mt: 1.5,
              color: "#9CA3AF",
              textAlign: "center",
              fontSize: "0.8125rem",
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
              color: "#4B5563",
              borderRadius: "14px",
              py: 1.25,
              fontWeight: 600,
              fontSize: "0.9375rem",
              textTransform: "none",
              border: "1px solid #E5E7EB",
              "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
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
              background: `linear-gradient(135deg, ${COLORS.danger} 0%, ${COLORS.orange} 100%)`,
              color: "white",
              borderRadius: "14px",
              py: 1.25,
              fontWeight: 600,
              fontSize: "0.9375rem",
              textTransform: "none",
              boxShadow: `0 6px 20px ${alpha(COLORS.danger, 0.4)}`,
              "&:hover": {
                background: `linear-gradient(135deg, #EF4444 0%, #F97316 100%)`,
              },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
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
            borderRadius: "14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            fontSize: "0.9375rem",
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyDocumentsPage;
