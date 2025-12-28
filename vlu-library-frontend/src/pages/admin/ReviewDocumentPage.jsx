/**
 * ReviewDocumentPage
 * Trang xem xét chi tiết tài liệu cho Admin/Moderator
 *
 * Đường dẫn: src/pages/admin/ReviewDocumentPage.jsx
 *
 * - Admin: Truy cập từ /admin/moderation/:id, navigate về /admin/moderation
 * - Moderator: Truy cập từ /moderation/:id, navigate về /moderation
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import documentsAPI from "../../api/documents.api";

// Import FileViewer từ common (thay thế PDFViewer cũ)
import { FileViewer } from "../../components/common/file-viewer";

// Import các component admin
import ReviewPanel from "../../components/admin/ReviewPanel";
import ApproveDialog from "../../components/admin/ApproveDialog";
import RejectDialog from "../../components/admin/RejectDialog";

const ReviewDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine back route based on current path or user role
  const getBackRoute = () => {
    if (location.pathname.startsWith("/admin")) {
      return "/admin/moderation";
    }
    if (user?.role === "Moderator") {
      return "/moderation";
    }
    return "/admin/moderation";
  };

  const backRoute = getBackRoute();

  // Data state
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Fetch document details
   */
  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const response = await documentsAPI.getById(id);
      console.log("fetchDocument response - ReviewDocumentPage:", response);

      if (response.status === "success") {
        const documentData = response.data.document || response.data;
        setDocument(documentData);
      }
    } catch (error) {
      console.error("Fetch document error:", error);
      showSnackbar("Không thể tải thông tin tài liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tạo URL đầy đủ cho file viewer
   * REACT_APP_API_URL có thể là:
   * - http://localhost:5000 (không có /api)
   * - http://localhost:5000/api (đã có /api)
   */
  const getFileUrl = () => {
    if (!document) return null;
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    // Kiểm tra xem baseURL đã có /api chưa
    const apiPath = baseURL.endsWith("/api") ? "" : "/api";
    return `${baseURL}${apiPath}/documents/${document.id || document._id}/read`;
  };

  /**
   * Lấy định dạng file
   */
  const getFileFormat = () => {
    if (document?.fileFormat) {
      return document.fileFormat.toLowerCase();
    }
    const fileName = document?.fileName || "";
    if (fileName.toLowerCase().endsWith(".epub")) {
      return "epub";
    }
    return "pdf";
  };

  /**
   * Get status badge config
   */
  const getStatusBadge = () => {
    if (!document) return null;

    const statusConfig = {
      pending: { label: "Chờ duyệt", color: "warning" },
      approved: { label: "Đã duyệt", color: "success" },
      rejected: { label: "Từ chối", color: "error" },
    };

    return statusConfig[document.status] || statusConfig.pending;
  };

  /**
   * Get format badge
   */
  const getFormatBadge = () => {
    const format = getFileFormat();
    const isEpub = format === "epub";

    return {
      label: isEpub ? "EPUB" : "PDF",
      color: isEpub ? "warning" : "error",
      icon: isEpub ? (
        <EpubIcon fontSize="small" />
      ) : (
        <PdfIcon fontSize="small" />
      ),
    };
  };

  /**
   * Handle approve document
   */
  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    setActionLoading(true);
    try {
      const response = await documentsAPI.reviewDocument(id, {
        status: "approved",
      });

      if (response.status === "success") {
        setApproveDialogOpen(false);
        showSnackbar("Tài liệu đã được duyệt và công khai!", "success");

        setTimeout(() => {
          navigate(backRoute);
        }, 1500);
      }
    } catch (error) {
      console.error("Approve document error:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể duyệt tài liệu";
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle reject document
   */
  const handleRejectClick = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (reason) => {
    setActionLoading(true);
    try {
      const response = await documentsAPI.reviewDocument(id, {
        status: "rejected",
        reason: reason,
      });

      if (response.status === "success") {
        setRejectDialogOpen(false);
        showSnackbar("Tài liệu đã bị từ chối", "success");

        setTimeout(() => {
          navigate(backRoute);
        }, 1500);
      }
    } catch (error) {
      console.error("Reject document error:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể từ chối tài liệu";
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    navigate(backRoute);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const statusBadge = getStatusBadge();
  const formatBadge = getFormatBadge();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Custom Header Bar */}
      <AppBar
        position="static"
        color="default"
        elevation={1}
        sx={{
          backgroundColor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {/* Back Button */}
          <IconButton
            edge="start"
            onClick={handleBack}
            sx={{ mr: 2, color: "text.secondary" }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Title */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={handleBack}
          >
            Quay lại danh sách
          </Typography>

          {/* Divider */}
          <Box
            sx={{
              width: "1px",
              height: 32,
              backgroundColor: "divider",
              mx: 3,
            }}
          />

          {/* Document Title */}
          <Typography variant="body1" color="text.secondary">
            Đang xem xét:{" "}
            <Typography
              component="span"
              variant="body1"
              fontWeight="bold"
              color="text.primary"
            >
              {document?.title || "N/A"}
            </Typography>
          </Typography>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Format Badge */}
          <Chip
            icon={formatBadge.icon}
            label={formatBadge.label}
            color={formatBadge.color}
            size="small"
            sx={{ fontWeight: 600, mr: 1 }}
          />

          {/* Status Badge */}
          {statusBadge && (
            <Chip
              label={statusBadge.label}
              color={statusBadge.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Grid container sx={{ height: "100%" }}>
          {/* Left: File Viewer - Sử dụng FileViewer thay vì PDFViewer */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              height: "100%",
              borderRight: { md: "1px solid" },
              borderColor: { md: "divider" },
            }}
          >
            <FileViewer
              fileUrl={getFileUrl()}
              fileName={document?.fileName || "document"}
              fileFormat={getFileFormat()}
              title={document?.title || ""}
              isPreview={false}
              showDownload={true}
            />
          </Grid>

          {/* Right: Review Panel */}
          <Grid item xs={12} md={4} sx={{ height: "100%" }}>
            <ReviewPanel
              document={document}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              loading={actionLoading}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Approve Dialog */}
      <ApproveDialog
        open={approveDialogOpen}
        onClose={() => !actionLoading && setApproveDialogOpen(false)}
        onConfirm={handleConfirmApprove}
        documentTitle={document?.title || "N/A"}
        loading={actionLoading}
      />

      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onClose={() => !actionLoading && setRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
        loading={actionLoading}
      />

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
    </Box>
  );
};

export default ReviewDocumentPage;
