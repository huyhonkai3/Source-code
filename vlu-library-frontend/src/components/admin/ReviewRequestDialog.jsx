import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Avatar,
  TextField,
  IconButton,
  Alert,
  Paper,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Create as AuthorIcon,
  Verified as VerifiedIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Info as InfoIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

/**
 * ReviewRequestDialog Component - VLU Design System v2.0.1
 * UPDATED: Thêm isReadOnly prop để ẩn buttons khi xem chi tiết yêu cầu đã xử lý
 */
const ReviewRequestDialog = ({
  request,
  open,
  onClose,
  onApprove,
  onReject,
  loading = false,
  isReadOnly = false, // NEW: Prop để ẩn buttons khi xem chi tiết (approved/rejected)
}) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleClose = () => {
    if (loading) return;
    setRejectMode(false);
    setRejectionReason("");
    onClose();
  };

  const handleRejectClick = () => {
    if (!rejectMode) {
      setRejectMode(true);
    } else {
      if (!rejectionReason.trim()) return;
      onReject(rejectionReason);
    }
  };

  const handleApprove = () => onApprove();

  const handleCancelReject = () => {
    setRejectMode(false);
    setRejectionReason("");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2)
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          background: isReadOnly
            ? request.status === "approved"
              ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
              : "linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
            : "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
          color: "white",
          p: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VerifiedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: "1.25rem",
                }}
              >
                {isReadOnly ? "Chi tiết Yêu cầu" : "Xét duyệt Yêu cầu"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.25, fontSize: "0.9375rem" }}
              >
                Nâng cấp lên Tác giả
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 4 }}>
        {/* User Info Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "16px",
            bgcolor: "#FAFAFC",
            border: "1px solid",
            borderColor: "#E0E0E0",
            textAlign: "center",
          }}
        >
          <Avatar
            src={request.userId?.avatarUrl}
            alt={request.userId?.name}
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
              fontWeight: 700,
              fontSize: "1.75rem",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
              border: "4px solid white",
            }}
          >
            {getInitials(request.userId?.name)}
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1A1A2E",
              mb: 0.5,
              fontSize: "1.25rem",
            }}
          >
            {request.userId?.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <EmailIcon sx={{ fontSize: 14, color: "#8E8EA9" }} />
            <Typography
              variant="body2"
              sx={{ color: "#8E8EA9", fontSize: "0.9375rem" }}
            >
              {request.userId?.email}
            </Typography>
          </Box>
        </Paper>

        {/* Role Transition */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "14px",
            background: "linear-gradient(135deg, #F0F0F5 0%, #E8E8ED 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: "#757575",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              <PersonIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              sx={{ color: "#8E8EA9", display: "block", fontSize: "0.8125rem" }}
            >
              Hiện tại
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#757575", fontSize: "0.9375rem" }}
            >
              User
            </Typography>
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <ArrowForwardIcon sx={{ color: "#10B981" }} />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
                boxShadow: "0 4px 14px rgba(56, 142, 60, 0.3)",
              }}
            >
              <AuthorIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              sx={{ color: "#8E8EA9", display: "block", fontSize: "0.8125rem" }}
            >
              Yêu cầu
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#388E3C", fontSize: "0.9375rem" }}
            >
              Author
            </Typography>
          </Box>
        </Paper>

        {/* Reason Box */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "#8E8EA9",
              fontWeight: 700,
              letterSpacing: "0.1em",
              display: "block",
              mb: 1.5,
              fontSize: "0.75rem",
              textTransform: "uppercase",
            }}
          >
            Lý do đăng ký
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid",
              borderColor: "#E2E8F0",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                color: "#475569",
                lineHeight: 1.7,
                fontSize: "0.9375rem",
              }}
            >
              "{request.reason}"
            </Typography>
          </Paper>
        </Box>

        {/* Terms Agreement */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            mb: 3,
            borderRadius: "12px",
            bgcolor: "#D1FAE5",
            border: "1px solid",
            borderColor: "#A7F3D0",
          }}
        >
          <CheckCircleIcon
            sx={{ color: "#059669", fontSize: 22, flexShrink: 0, mt: 0.25 }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#047857", fontWeight: 500, fontSize: "0.9375rem" }}
          >
            Đã đồng ý với Cam kết & Điều khoản của Tác giả
          </Typography>
        </Box>

        {/* Status Badge for Read-Only Mode */}
        {isReadOnly && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              mb: 3,
              borderRadius: "12px",
              bgcolor:
                request.status === "approved"
                  ? alpha("#10B981", 0.1)
                  : alpha("#EF4444", 0.1),
              border: "1px solid",
              borderColor:
                request.status === "approved"
                  ? alpha("#10B981", 0.3)
                  : alpha("#EF4444", 0.3),
            }}
          >
            {request.status === "approved" ? (
              <CheckCircleIcon
                sx={{ color: "#10B981", fontSize: 22, flexShrink: 0, mt: 0.25 }}
              />
            ) : (
              <RejectIcon
                sx={{ color: "#EF4444", fontSize: 22, flexShrink: 0, mt: 0.25 }}
              />
            )}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: request.status === "approved" ? "#047857" : "#DC2626",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                }}
              >
                {request.status === "approved"
                  ? "Yêu cầu đã được phê duyệt"
                  : "Yêu cầu đã bị từ chối"}
              </Typography>
              {request.status === "rejected" && request.rejectionReason && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#7F1D1D",
                    fontSize: "0.875rem",
                    mt: 0.5,
                    fontStyle: "italic",
                  }}
                >
                  Lý do: "{request.rejectionReason}"
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Rejection Reason Input - Only show when NOT read-only */}
        {!isReadOnly && rejectMode && (
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.9375rem",
              }}
            >
              <InfoIcon sx={{ fontSize: 18, color: "#EF4444" }} />
              Lý do từ chối
              <Typography component="span" sx={{ color: "#EF4444" }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Nhập lý do từ chối để thông báo cho người dùng..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              error={rejectMode && !rejectionReason.trim()}
              helperText={
                rejectMode && !rejectionReason.trim()
                  ? "Vui lòng nhập lý do từ chối"
                  : `${rejectionReason.length}/500 ký tự`
              }
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "white",
                  fontSize: "0.9375rem",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#EF4444",
                  },
                },
                "& .MuiFormHelperText-root": {
                  textAlign: "right",
                  mx: 0,
                  fontSize: "0.8125rem",
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      {/* ACTIONS - Chỉ hiển thị khi KHÔNG phải read-only mode */}
      {!isReadOnly && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5 }}>
          {rejectMode ? (
            <>
              <Button
                onClick={handleCancelReject}
                disabled={loading}
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: "12px",
                  fontWeight: 600,
                  py: 1.25,
                  fontSize: "0.9375rem",
                  borderColor: "#E0E0E0",
                  color: "#4A4A68",
                  "&:hover": { borderColor: "#C4C4D4", bgcolor: "#F0F0F5" },
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleRejectClick}
                disabled={loading || !rejectionReason.trim()}
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <RejectIcon />
                  )
                }
                sx={{
                  flex: 1,
                  borderRadius: "12px",
                  fontWeight: 600,
                  py: 1.25,
                  fontSize: "0.9375rem",
                  bgcolor: "#EF4444",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
                  "&:hover": { bgcolor: "#DC2626" },
                  "&:disabled": { bgcolor: "#C4C4D4" },
                }}
              >
                {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleClose}
                disabled={loading}
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: "12px",
                  fontWeight: 600,
                  py: 1.25,
                  fontSize: "0.9375rem",
                  borderColor: "#E0E0E0",
                  color: "#4A4A68",
                  "&:hover": { borderColor: "#C4C4D4", bgcolor: "#F0F0F5" },
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleRejectClick}
                disabled={loading}
                variant="outlined"
                startIcon={<RejectIcon />}
                sx={{
                  flex: 1,
                  borderRadius: "12px",
                  fontWeight: 600,
                  py: 1.25,
                  fontSize: "0.9375rem",
                  borderColor: "#EF4444",
                  color: "#EF4444",
                  "&:hover": {
                    bgcolor: alpha("#EF4444", 0.08),
                    borderColor: "#DC2626",
                  },
                }}
              >
                Từ chối
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ApproveIcon />
                  )
                }
                sx={{
                  flex: 1.5,
                  borderRadius: "12px",
                  fontWeight: 600,
                  py: 1.25,
                  fontSize: "0.9375rem",
                  bgcolor: "#10B981",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  "&:hover": {
                    bgcolor: "#059669",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.5)",
                  },
                }}
              >
                {loading ? "Đang duyệt..." : "Phê duyệt"}
              </Button>
            </>
          )}
        </DialogActions>
      )}

      {/* ACTIONS - Read-only mode: Chỉ hiển thị nút Đóng */}
      {isReadOnly && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "12px",
              fontWeight: 600,
              py: 1.25,
              fontSize: "0.9375rem",
              bgcolor: "#6B7280",
              "&:hover": { bgcolor: "#4B5563" },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReviewRequestDialog;
