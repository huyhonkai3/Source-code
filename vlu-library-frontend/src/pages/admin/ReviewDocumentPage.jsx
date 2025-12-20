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
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PDFViewer from "../../components/admin/PDFViewer";
import ReviewPanel from "../../components/admin/ReviewPanel";
import ApproveDialog from "../../components/admin/ApproveDialog";
import RejectDialog from "../../components/admin/RejectDialog";
import documentsAPI from "../../api/documents.api";
import { useAuth } from "../../context/AuthContext";

/**
 * ReviewDocumentPage Component
 * Trang xem xét chi tiết tài liệu cho Admin/Moderator
 *
 * - Admin: Truy cập từ /admin/moderation/:id, navigate về /admin/moderation
 * - Moderator: Truy cập từ /moderation/:id, navigate về /moderation
 */
const ReviewDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine back route based on current path or user role
  const getBackRoute = () => {
    // Check if current path starts with /admin
    if (location.pathname.startsWith("/admin")) {
      return "/admin/moderation";
    }
    // For Moderator accessing /moderation/:id
    if (user?.role === "Moderator") {
      return "/moderation";
    }
    // Default fallback for Admin
    return "/admin/moderation";
  };

  const backRoute = getBackRoute();

  // Data state
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Approve dialog state
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

      if (response.status === "success") {
        // Backend returns nested structure: data.document
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
   * Get full PDF URL
   */
  const getFullPdfUrl = () => {
    if (!document) return null;
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    return `${baseURL}/documents/${document.id}/read`;
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
   * Handle approve document - Open confirmation dialog
   */
  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  /**
   * Handle confirm approve - Execute API call
   */
  const handleConfirmApprove = async () => {
    setActionLoading(true);
    try {
      const response = await documentsAPI.reviewDocument(id, {
        status: "approved",
      });

      if (response.status === "success") {
        setApproveDialogOpen(false);
        showSnackbar("Tài liệu đã được duyệt và công khai!", "success");

        // Navigate back after 1.5 seconds
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
   * Handle reject document - Open dialog
   */
  const handleRejectClick = () => {
    setRejectDialogOpen(true);
  };

  /**
   * Handle reject confirm - Execute API call with reason
   */
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

        // Navigate back after 1.5 seconds
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

  /**
   * Handle back button
   */
  const handleBack = () => {
    navigate(backRoute);
  };

  /**
   * Show snackbar
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
            sx={{
              mr: 2,
              color: "text.secondary",
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Title */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
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

          {/* Status Badge */}
          {statusBadge && (
            <Chip
              label={statusBadge.label}
              color={statusBadge.color}
              size="small"
              sx={{
                fontWeight: 600,
              }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Grid container sx={{ height: "100%" }}>
          {/* Left: PDF Viewer */}
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
            <PDFViewer
              fileUrl={getFullPdfUrl()}
              fileName={document?.fileName || "document.pdf"}
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
