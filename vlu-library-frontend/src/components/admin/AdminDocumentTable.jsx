import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  RemoveRedEye as EyeIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

/**
 * AdminDocumentTable Component
 * Data table for documents management page
 *
 * @param {Array} documents - List of documents
 * @param {Function} onDelete - Delete handler
 * @param {boolean} loading - Loading state
 */
const AdminDocumentTable = ({ documents = [], onDelete, loading = false }) => {
  const navigate = useNavigate();

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    const colorMap = {
      approved: "success",
      pending: "warning",
      rejected: "error",
    };
    return colorMap[status] || "default";
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status) => {
    const labelMap = {
      approved: "Đã duyệt",
      pending: "Chờ duyệt",
      rejected: "Từ chối",
    };
    return labelMap[status] || status;
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
   * Handle view document
   */
  const handleView = (docId) => {
    // Navigate to admin review page
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

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
      <Table>
        {/* Table Head */}
        <TableHead>
          <TableRow sx={{ backgroundColor: "grey.50" }}>
            <TableCell width="80px">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                ID
              </Typography>
            </TableCell>
            <TableCell width="35%">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                TÊN TÀI LIỆU
              </Typography>
            </TableCell>
            <TableCell width="15%">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                TÁC GIẢ
              </Typography>
            </TableCell>
            <TableCell width="12%">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                DANH MỤC
              </Typography>
            </TableCell>
            <TableCell width="10%">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                TRẠNG THÁI
              </Typography>
            </TableCell>
            <TableCell width="10%">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                THỐNG KÊ
              </Typography>
            </TableCell>
            <TableCell width="10%">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                NGÀY ĐĂNG
              </Typography>
            </TableCell>
            <TableCell width="10%" align="center">
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                HÀNH ĐỘNG
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        {/* Table Body */}
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                <Typography color="text.secondary">Đang tải...</Typography>
              </TableCell>
            </TableRow>
          ) : documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                <Typography color="text.secondary">
                  Không có tài liệu nào
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => {
              const docId = doc.id || doc._id; // Backend returns 'id'
              return (
                <TableRow
                  key={docId}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {/* ID */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="primary"
                    >
                      #{getDocumentId(docId)}
                    </Typography>
                  </TableCell>

                  {/* Document Name */}
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <FileIcon color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {doc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.fileType?.toUpperCase() || "PDF"} •{" "}
                          {formatFileSize(doc.fileSize)}
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
                          fontSize: "0.875rem",
                          bgcolor: "primary.main",
                        }}
                      >
                        {doc.uploadedBy?.name?.charAt(0).toUpperCase() || "A"}
                      </Avatar>
                      <Typography variant="body2">
                        {doc.uploadedBy?.name || "Unknown"}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Typography variant="body2">
                      {doc.category?.name || "N/A"}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={getStatusLabel(doc.status)}
                      color={getStatusColor(doc.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>

                  {/* Stats */}
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <EyeIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption">
                          {doc.views || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <DownloadIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption">
                          {doc.downloads || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(doc.createdAt)}
                    </Typography>
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
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleView(docId)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(doc)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminDocumentTable;
