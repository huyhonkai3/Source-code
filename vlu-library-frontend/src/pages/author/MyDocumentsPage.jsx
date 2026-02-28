/**
 * MyDocumentsPage - VLU Design System v2.0.1 (UPDATED)
 * + Thêm nút "Xin quyền sửa" cho tài liệu approved
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
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import documentsAPI from "../../api/documents.api";
import { useAuth } from "../../context/AuthContext";
import UploadDocumentDialog from "../../components/documents/UploadDocumentDialog";
import EditDocumentDialog from "../../components/documents/EditDocumentDialog";
import RequestEditDialog from "../../components/documents/RequestEditDialog";

const COLORS = {
  primary: "#D32F2F",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#60A5FA",
  pink: "#FF6B6B",
  teal: "#2DD4BF",
  orange: "#FB923C",
};

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

const DocumentRow = ({
  doc,
  index,
  onEdit,
  onDelete,
  onRequestEdit,
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
      {/* Title */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                fontSize: "0.9375rem",
                maxWidth: 260,
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

      {/* Stats */}
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
          {/* Approved: Nút "Xin quyền sửa" */}
          {doc.status === "approved" && (
            <Tooltip title="Xin cấp quyền chỉnh sửa" arrow>
              <IconButton
                size="small"
                onClick={() => onRequestEdit(doc)}
                sx={{
                  bgcolor: alpha("#2196F3", 0.1),
                  color: "#2196F3",
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: alpha("#2196F3", 0.2),
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <LockOpenIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Pending/Rejected: Nút Edit */}
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

  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    limit: 10,
  });

  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    documentId: null,
    documentTitle: "",
  });
  const [editDialog, setEditDialog] = useState({ open: false, document: null });
  const [requestEditDialog, setRequestEditDialog] = useState({
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
      showSnackbar("Không thể tải danh sách tài liệu", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
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

  const statsCards = [
    {
      label: "Tổng tài liệu",
      value: stats.total,
      icon: FolderIcon,
      color: COLORS.primary,
      gradient: "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
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
          <Grid item xs={12} md={3}>
            <UserSidebar active="my-documents" />
          </Grid>
          <Grid item xs={12} md={9}>
            {/* Hero */}
            <Box sx={{ mb: 4 }}>
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
                Quản lý và theo dõi tài liệu của bạn tại đây.
              </Typography>
            </Box>

            {/* Stats */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {statsCards.map((card, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <StatsCard {...card} delay={index * 100} loading={loading} />
                </Grid>
              ))}
            </Grid>

            {/* Main Paper */}
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
                  <TextField
                    size="small"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#9CA3AF" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 220,
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
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => setOpenUploadDialog(true)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
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
                      },
                    }}
                  >
                    Tải lên
                  </Button>
                </Box>
              </Box>

              {/* Table */}
              <TableContainer>
                {loading ? (
                  <Box sx={{ p: 4 }}>
                    {[1, 2, 3, 4].map((n) => (
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
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="30%" />
                        </Box>
                        <Skeleton variant="rounded" width={80} height={28} />
                      </Box>
                    ))}
                  </Box>
                ) : documents.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                        {[
                          "Tên tài liệu",
                          "Danh mục",
                          "Ngày đăng",
                          "Trạng thái",
                          "Tương tác",
                          "Hành động",
                        ].map((h) => (
                          <TableCell
                            key={h}
                            sx={{
                              fontWeight: 700,
                              color: "#374151",
                              fontSize: "0.875rem",
                              py: 2,
                            }}
                            align={
                              h === "Tương tác" || h === "Hành động"
                                ? "center"
                                : "left"
                            }
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc, index) => (
                        <DocumentRow
                          key={doc.id}
                          doc={doc}
                          index={index}
                          onEdit={(doc) =>
                            setEditDialog({ open: true, document: doc })
                          }
                          onDelete={(doc) =>
                            setDeleteDialog({
                              open: true,
                              documentId: doc.id,
                              documentTitle: doc.title,
                            })
                          }
                          onRequestEdit={(doc) =>
                            setRequestEditDialog({ open: true, document: doc })
                          }
                          getStatusConfig={getStatusConfig}
                          formatDate={formatDate}
                          formatFileSize={formatFileSize}
                        />
                      ))}
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
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "32px",
                        bgcolor: alpha(COLORS.primary, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <RocketIcon
                        sx={{ fontSize: 56, color: COLORS.primary }}
                      />
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
                      }}
                    >
                      Bắt đầu chia sẻ tri thức bằng cách tải lên tài liệu đầu
                      tiên! 🚀
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => setOpenUploadDialog(true)}
                      sx={{
                        background:
                          "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                        borderRadius: "14px",
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "1rem",
                        textTransform: "none",
                        boxShadow: "0 8px 24px rgba(211, 47, 47, 0.4)",
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
                      Hiển thị {documents.length} trong{" "}
                      {pagination.totalDocuments} tài liệu
                    </Typography>
                    <Pagination
                      count={pagination.totalPages}
                      page={page}
                      onChange={(e, v) => {
                        setPage(v);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: "12px",
                          fontWeight: 600,
                          "&.Mui-selected": {
                            background:
                              "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                            color: "white",
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

      {/* Dialogs */}
      <UploadDocumentDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        onSuccess={() => {
          showSnackbar("Tải lên thành công! 🎉");
          setPage(1);
          fetchDocuments();
        }}
      />
      <EditDocumentDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, document: null })}
        onSuccess={() => {
          const wasRejected = editDialog.document?.status === "rejected";
          showSnackbar(
            wasRejected
              ? "Đã cập nhật và gửi lại để kiểm duyệt! 🔄"
              : "Cập nhật thành công!",
          );
          setEditDialog({ open: false, document: null });
          fetchDocuments();
        }}
        document={editDialog.document}
      />
      <RequestEditDialog
        open={requestEditDialog.open}
        onClose={() => setRequestEditDialog({ open: false, document: null })}
        document={requestEditDialog.document}
        onSuccess={() => {
          showSnackbar(
            "Đã gửi yêu cầu chỉnh sửa! Admin sẽ xem xét sớm. 📨",
            "success",
          );
        }}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          !deleteLoading &&
          setDeleteDialog({ open: false, documentId: null, documentTitle: "" })
        }
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px" } }}
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
                bgcolor: alpha(COLORS.danger, 0.1),
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
              Xác nhận xóa
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
            Bạn có chắc muốn xóa tài liệu{" "}
            <strong>"{deleteDialog.documentTitle}"</strong>?
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
            onClick={() =>
              setDeleteDialog({
                open: false,
                documentId: null,
                documentTitle: "",
              })
            }
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
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={deleteLoading}
            onClick={async () => {
              setDeleteLoading(true);
              try {
                await documentsAPI.deleteDocument(deleteDialog.documentId);
                showSnackbar("Xóa thành công");
                fetchDocuments();
              } catch (err) {
                showSnackbar(
                  err.response?.data?.message || "Xóa thất bại",
                  "error",
                );
              } finally {
                setDeleteLoading(false);
                setDeleteDialog({
                  open: false,
                  documentId: null,
                  documentTitle: "",
                });
              }
            }}
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
              borderRadius: "14px",
              py: 1.25,
              fontWeight: 600,
              fontSize: "0.9375rem",
              textTransform: "none",
            }}
          >
            {deleteLoading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: "14px", fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyDocumentsPage;
