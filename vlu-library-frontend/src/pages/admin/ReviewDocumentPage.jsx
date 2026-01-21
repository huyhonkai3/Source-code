/**
 * ReviewDocumentPage - VLU Design System v2.0.1
 * Modern & Bold với Enhanced header, Better visual hierarchy + Tăng font sizes
 *
 * Trang xem xét chi tiết tài liệu cho Admin/Moderator
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
  Tooltip,
  alpha,
  Fade,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import documentsAPI from "../../api/documents.api";

import { FileViewer } from "../../components/common/file-viewer";
import ReviewPanel from "../../components/admin/ReviewPanel";
import ApproveDialog from "../../components/admin/ApproveDialog";
import RejectDialog from "../../components/admin/RejectDialog";

const ReviewDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getBackRoute = () => {
    if (location.pathname.startsWith("/admin")) return "/admin/moderation";
    if (user?.role === "Moderator") return "/moderation";
    return "/admin/moderation";
  };

  const backRoute = getBackRoute();

  // Data state
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDocument();
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocument();
    setRefreshing(false);
    showSnackbar("Đã cập nhật thông tin tài liệu", "success");
  };

  const getFileUrl = () => {
    if (!document) return null;
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const apiPath = baseURL.endsWith("/api") ? "" : "/api";
    return `${baseURL}${apiPath}/documents/${document.id || document._id}/read`;
  };

  const getFileFormat = () => {
    if (document?.fileFormat) return document.fileFormat.toLowerCase();
    const fileName = document?.fileName || "";
    if (fileName.toLowerCase().endsWith(".epub")) return "epub";
    return "pdf";
  };

  const getStatusBadge = () => {
    if (!document) return null;
    const statusConfig = {
      pending: { label: "Chờ duyệt", color: "#F59E0B", bgColor: "#FEF3C7" },
      approved: { label: "Đã duyệt", color: "#10B981", bgColor: "#D1FAE5" },
      rejected: { label: "Từ chối", color: "#EF4444", bgColor: "#FEE2E2" },
    };
    return statusConfig[document.status] || statusConfig.pending;
  };

  const getFormatBadge = () => {
    const format = getFileFormat();
    const isEpub = format === "epub";
    return {
      label: isEpub ? "EPUB" : "PDF",
      color: isEpub ? "#F59E0B" : "#EF4444",
      bgColor: isEpub ? "#FEF3C7" : "#FEE2E2",
      icon: isEpub ? (
        <EpubIcon sx={{ fontSize: 16 }} />
      ) : (
        <PdfIcon sx={{ fontSize: 16 }} />
      ),
    };
  };

  const handleApprove = () => setApproveDialogOpen(true);

  const handleConfirmApprove = async () => {
    setActionLoading(true);
    try {
      const response = await documentsAPI.reviewDocument(id, {
        status: "approved",
      });
      if (response.status === "success") {
        setApproveDialogOpen(false);
        showSnackbar("Tài liệu đã được duyệt và công khai!", "success");
        setTimeout(() => navigate(backRoute), 1500);
      }
    } catch (error) {
      console.error("Approve document error:", error);
      showSnackbar(
        error.response?.data?.message || "Không thể duyệt tài liệu",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = () => setRejectDialogOpen(true);

  const handleRejectConfirm = async (reason) => {
    setActionLoading(true);
    try {
      const response = await documentsAPI.reviewDocument(id, {
        status: "rejected",
        reason,
      });
      if (response.status === "success") {
        setRejectDialogOpen(false);
        showSnackbar("Tài liệu đã bị từ chối", "success");
        setTimeout(() => navigate(backRoute), 1500);
      }
    } catch (error) {
      console.error("Reject document error:", error);
      showSnackbar(
        error.response?.data?.message || "Không thể từ chối tài liệu",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => navigate(backRoute);
  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#FAFAFC",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(211, 47, 47, 0.3)",
          }}
        >
          <CircularProgress size={32} sx={{ color: "white" }} />
        </Box>
        <Typography
          sx={{ color: "#4A4A68", fontWeight: 500, fontSize: "0.9375rem" }}
        >
          Đang tải tài liệu...
        </Typography>
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
        bgcolor: "#FAFAFC",
      }}
    >
      {/* Enhanced Header Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: { xs: 2, md: 3 } }}>
          {/* Back Button */}
          <Tooltip title="Quay lại danh sách" arrow>
            <IconButton
              onClick={handleBack}
              sx={{
                mr: 2,
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          {/* Title Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              onClick={handleBack}
              sx={{
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontSize: "0.9375rem",
                whiteSpace: "nowrap",
                "&:hover": { color: "white", textDecoration: "underline" },
              }}
            >
              Quay lại
            </Typography>

            <Box
              sx={{
                width: "1px",
                height: 24,
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.8125rem",
                  mb: 0.25,
                }}
              >
                Đang xem xét
              </Typography>
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                }}
              >
                {document?.title || "N/A"}
              </Typography>
            </Box>
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Refresh Button */}
            <Tooltip title="Làm mới" arrow>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  "& .MuiSvgIcon-root": {
                    animation: refreshing ? "spin 1s linear infinite" : "none",
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

            {/* Format Badge */}
            <Chip
              icon={formatBadge.icon}
              label={formatBadge.label}
              size="small"
              sx={{
                bgcolor: formatBadge.bgColor,
                color: formatBadge.color,
                fontWeight: 600,
                fontSize: "0.8125rem",
                borderRadius: "8px",
                "& .MuiChip-icon": { color: formatBadge.color },
              }}
            />

            {/* Status Badge */}
            {statusBadge && (
              <Chip
                label={statusBadge.label}
                size="small"
                sx={{
                  bgcolor: statusBadge.bgColor,
                  color: statusBadge.color,
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  borderRadius: "8px",
                }}
              />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Grid container sx={{ height: "100%" }}>
          {/* Left: File Viewer */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              height: "100%",
              borderRight: { md: "1px solid" },
              borderColor: { md: "#E0E0E0" },
              bgcolor: "#F5F5F5",
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
          <Grid item xs={12} md={4} sx={{ height: "100%", bgcolor: "white" }}>
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
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(26,26,46,0.15)",
            fontSize: "0.9375rem",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReviewDocumentPage;
