import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CalendarToday as DateIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import documentsAPI from "../../api/documents.api";

/**
 * ModeratorReviewDocumentPage Component
 * Trang xem chi tiết và duyệt tài liệu dành riêng cho Moderator
 * - Sử dụng UserSidebar thay vì AdminSidebar
 * - Route: /moderation/:id
 */
const ModeratorReviewDocumentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Document state
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Action state
  const [actionLoading, setActionLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Fetch document details
   */
  const fetchDocument = async () => {
    setLoading(true);
    try {
      const response = await documentsAPI.getById(id);
      if (response.status === "success") {
        setDocument(response.data.document);
      }
    } catch (error) {
      console.error("Fetch document error:", error);
      showSnackbar("Không thể tải thông tin tài liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Handle approve document
   */
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await documentsAPI.reviewDocument(id, {
        status: "approved",
      });
      if (response.status === "success") {
        showSnackbar("Đã duyệt tài liệu thành công!", "success");
        // Redirect back after 1.5s
        setTimeout(() => {
          navigate("/moderation");
        }, 1500);
      }
    } catch (error) {
      console.error("Approve error:", error);
      showSnackbar(
        error.response?.data?.message || "Có lỗi xảy ra khi duyệt tài liệu",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle reject document
   */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showSnackbar("Vui lòng nhập lý do từ chối", "warning");
      return;
    }

    setActionLoading(true);
    try {
      const response = await documentsAPI.reviewDocument(id, {
        status: "rejected",
        reason: rejectReason,
      });
      if (response.status === "success") {
        setRejectDialogOpen(false);
        showSnackbar("Đã từ chối tài liệu", "success");
        // Redirect back after 1.5s
        setTimeout(() => {
          navigate("/moderation");
        }, 1500);
      }
    } catch (error) {
      console.error("Reject error:", error);
      showSnackbar(
        error.response?.data?.message || "Có lỗi xảy ra khi từ chối tài liệu",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
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
   * Get status chip color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
      default:
        return "warning";
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Đã từ chối";
      case "pending":
      default:
        return "Chờ duyệt";
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
        </Container>
      </>
    );
  }

  if (!document) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              Không tìm thấy tài liệu
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/moderation")}
              sx={{ mt: 2 }}
            >
              Quay lại danh sách
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar - UserSidebar cho Moderator */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="moderation" />
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Back Button & Title */}
              <Box>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/moderation")}
                  sx={{ mb: 2 }}
                >
                  Quay lại danh sách
                </Button>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Kiểm duyệt tài liệu / Chi tiết
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    Xem xét tài liệu
                  </Typography>

                  <Chip
                    label={getStatusLabel(document.status)}
                    color={getStatusColor(document.status)}
                    size="medium"
                  />
                </Box>
              </Box>

              {/* Document Info Card */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <DocumentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Thông tin tài liệu
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tiêu đề
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {document.title}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mô tả
                    </Typography>
                    <Typography variant="body1">
                      {document.description || "Không có mô tả"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <PersonIcon
                        sx={{ mr: 0.5, verticalAlign: "middle", fontSize: 18 }}
                      />
                      Tác giả
                    </Typography>
                    <Typography variant="body1">
                      {document.author?.fullName ||
                        document.uploadedBy?.fullName ||
                        "N/A"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <CategoryIcon
                        sx={{ mr: 0.5, verticalAlign: "middle", fontSize: 18 }}
                      />
                      Danh mục
                    </Typography>
                    <Typography variant="body1">
                      {document.category?.name || "Chưa phân loại"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <DateIcon
                        sx={{ mr: 0.5, verticalAlign: "middle", fontSize: 18 }}
                      />
                      Ngày tải lên
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(document.createdAt)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Loại file
                    </Typography>
                    <Typography variant="body1">
                      {document.fileType?.toUpperCase() || "N/A"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <ViewIcon
                        sx={{ mr: 0.5, verticalAlign: "middle", fontSize: 18 }}
                      />
                      Lượt xem
                    </Typography>
                    <Typography variant="body1">
                      {document.viewCount || 0}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <DownloadIcon
                        sx={{ mr: 0.5, verticalAlign: "middle", fontSize: 18 }}
                      />
                      Lượt tải
                    </Typography>
                    <Typography variant="body1">
                      {document.downloadCount || 0}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Preview Button */}
                {document.fileUrl && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Xem trước tài liệu
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* Rejection Reason (if rejected) */}
              {document.status === "rejected" && document.rejectionReason && (
                <Paper sx={{ p: 3, bgcolor: "error.50" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="error.main"
                    gutterBottom
                  >
                    Lý do từ chối
                  </Typography>
                  <Typography variant="body1">
                    {document.rejectionReason}
                  </Typography>
                  {document.reviewedAt && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Từ chối lúc: {formatDate(document.reviewedAt)}
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Action Buttons - Only show for pending documents */}
              {document.status === "pending" && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Hành động
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<ApproveIcon />}
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Đang xử lý..." : "Duyệt tài liệu"}
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<RejectIcon />}
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={actionLoading}
                    >
                      Từ chối
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Từ chối tài liệu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vui lòng nhập lý do từ chối để tác giả có thể chỉnh sửa và gửi lại.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Lý do từ chối"
            placeholder="Nhập lý do từ chối tài liệu..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
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

export default ModeratorReviewDocumentPage;
