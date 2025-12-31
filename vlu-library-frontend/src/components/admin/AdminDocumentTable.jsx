import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Skeleton,
  alpha,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
  RemoveRedEye as EyeIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

/**
 * AdminDocumentTable Component - VLU Design System v2.0.1
 * Modern & Bold data table for documents management
 * UPDATED: Tăng font sizes để UX tốt hơn
 *
 * @param {Array} documents - List of documents
 * @param {Function} onDelete - Delete handler
 * @param {boolean} loading - Loading state
 */
const AdminDocumentTable = ({ documents = [], onDelete, loading = false }) => {
  const navigate = useNavigate();

  /**
   * Get status config - Design System v2.0
   */
  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        label: "Đã duyệt",
        color: "#4CAF50",
        bgColor: alpha("#4CAF50", 0.1),
      },
      pending: {
        label: "Chờ duyệt",
        color: "#FF9800",
        bgColor: alpha("#FF9800", 0.1),
      },
      rejected: {
        label: "Từ chối",
        color: "#D32F2F",
        bgColor: alpha("#D32F2F", 0.1),
      },
    };
    return configs[status] || configs.pending;
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Get document ID (last 4 digits)
   */
  const getDocumentId = (fullId) => {
    if (!fullId) return "N/A";
    return fullId.slice(-4);
  };

  /**
   * Get file icon based on format
   */
  const getFileIcon = (doc) => {
    const format = doc.fileFormat || doc.fileType || "pdf";
    if (format.toLowerCase() === "epub") {
      return <EpubIcon sx={{ fontSize: 24, color: "#FF7043" }} />;
    }
    return <PdfIcon sx={{ fontSize: 24, color: "#D32F2F" }} />;
  };

  /**
   * Handle view document
   */
  const handleView = (docId) => {
    navigate(`/admin/moderation/${docId}`);
  };

  /**
   * Handle delete document
   */
  const handleDelete = (doc) => {
    if (onDelete) {
      onDelete(doc);
    }
  };

  /**
   * Format date
   */
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#FAFAFC" }}>
              {[
                "ID",
                "TÊN TÀI LIỆU",
                "TÁC GIẢ",
                "DANH MỤC",
                "TRẠNG THÁI",
                "THỐNG KÊ",
                "NGÀY ĐĂNG",
                "HÀNH ĐỘNG",
              ].map((header) => (
                <TableCell key={header}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#8E8EA9",
                      letterSpacing: "0.05em",
                      fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                    }}
                  >
                    {header}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((n) => (
              <TableRow key={n}>
                <TableCell>
                  <Skeleton width={50} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Skeleton variant="rounded" width={40} height={40} />
                    <Box>
                      <Skeleton width={180} height={20} />
                      <Skeleton width={100} height={16} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton width={80} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rounded" width={70} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton width={40} />
                </TableCell>
                <TableCell>
                  <Skeleton width={80} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: alpha("#7C4DFF", 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <FolderIcon sx={{ fontSize: 40, color: "#7C4DFF" }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1A1A2E",
            mb: 0.5,
            fontSize: "1.125rem", // UPDATED: 18px (was 16px h6)
          }}
        >
          Không có tài liệu nào
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#8E8EA9",
            fontSize: "0.9375rem", // UPDATED: 15px (was 14px body2)
          }}
        >
          Chưa có tài liệu phù hợp với bộ lọc của bạn
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        {/* ========== TABLE HEAD ========== */}
        <TableHead>
          <TableRow sx={{ bgcolor: "#FAFAFC" }}>
            <TableCell width="7%">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                ID
              </Typography>
            </TableCell>
            <TableCell width="28%">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                TÊN TÀI LIỆU
              </Typography>
            </TableCell>
            <TableCell width="14%">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                TÁC GIẢ
              </Typography>
            </TableCell>
            <TableCell width="12%">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                DANH MỤC
              </Typography>
            </TableCell>
            <TableCell width="10%">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                TRẠNG THÁI
              </Typography>
            </TableCell>
            <TableCell width="9%">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                THỐNG KÊ
              </Typography>
            </TableCell>
            <TableCell width="10%">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                NGÀY ĐĂNG
              </Typography>
            </TableCell>
            <TableCell width="10%" align="center">
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#8E8EA9",
                  letterSpacing: "0.05em",
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                HÀNH ĐỘNG
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        {/* ========== TABLE BODY ========== */}
        <TableBody>
          {documents.map((doc, index) => {
            const docId = doc.id || doc._id;
            const statusConfig = getStatusConfig(doc.status);

            return (
              <TableRow
                key={docId}
                sx={{
                  animation: "fadeIn 0.3s ease forwards",
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                  "@keyframes fadeIn": {
                    to: { opacity: 1 },
                  },
                  "&:hover": {
                    bgcolor: "#FAFAFC",
                  },
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                {/* ID */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "#7C4DFF",
                      fontFamily: "monospace",
                      fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
                    }}
                  >
                    #{getDocumentId(docId)}
                  </Typography>
                </TableCell>

                {/* Document Name */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "10px",
                        bgcolor: "#F0F0F5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getFileIcon(doc)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#1A1A2E",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 220,
                          fontSize: "0.9375rem", // UPDATED: 15px (was 14px body2)
                        }}
                      >
                        {doc.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#8E8EA9",
                          fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                        }}
                      >
                        {(
                          doc.fileFormat ||
                          doc.fileType ||
                          "PDF"
                        ).toUpperCase()}{" "}
                        • {formatFileSize(doc.fileSize)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Author */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem", // UPDATED: 14px (was 12.8px)
                        fontWeight: 600,
                        bgcolor: "#D32F2F",
                      }}
                    >
                      {doc.uploadedBy?.name?.charAt(0).toUpperCase() || "A"}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#4A4A68",
                        fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
                      }}
                    >
                      {doc.uploadedBy?.name || "Unknown"}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4A4A68",
                      fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
                    }}
                  >
                    {doc.category?.name || "N/A"}
                  </Typography>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Chip
                    label={statusConfig.label}
                    size="small"
                    sx={{
                      bgcolor: statusConfig.bgColor,
                      color: statusConfig.color,
                      fontWeight: 600,
                      fontSize: "0.8125rem", // UPDATED: 13px (was 12px)
                      height: 28, // UPDATED: 28px (was 26px)
                      borderRadius: "8px",
                    }}
                  />
                </TableCell>

                {/* Stats */}
                <TableCell>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <EyeIcon sx={{ fontSize: 14, color: "#8E8EA9" }} />
                      <Typography
                        sx={{
                          color: "#4A4A68",
                          fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                        }}
                      >
                        {doc.views || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <DownloadIcon sx={{ fontSize: 14, color: "#8E8EA9" }} />
                      <Typography
                        sx={{
                          color: "#4A4A68",
                          fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                        }}
                      >
                        {doc.downloads || 0}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4A4A68",
                      fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
                    }}
                  >
                    {formatDate(doc.createdAt)}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}
                  >
                    <Tooltip title="Xem chi tiết" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleView(docId)}
                        sx={{
                          color: "#2196F3",
                          "&:hover": {
                            bgcolor: alpha("#2196F3", 0.1),
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(doc)}
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
    </TableContainer>
  );
};

export default AdminDocumentTable;
