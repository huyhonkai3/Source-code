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
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

/**
 * ReviewRequestDialog Component
 * Dialog để Admin xét duyệt yêu cầu nâng cấp lên Author
 *
 * @param {Object} request - Upgrade request object
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {Function} onApprove - Approve handler
 * @param {Function} onReject - Reject handler (nhận rejectionReason)
 * @param {boolean} loading - Loading state
 */
const ReviewRequestDialog = ({
  request,
  open,
  onClose,
  onApprove,
  onReject,
  loading = false,
}) => {
  // Rejection mode state
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  /**
   * Handle dialog close - Reset state
   */
  const handleClose = () => {
    if (loading) return;
    setRejectMode(false);
    setRejectionReason("");
    onClose();
  };

  /**
   * Handle reject button click
   */
  const handleRejectClick = () => {
    if (!rejectMode) {
      // First click: Enable reject mode
      setRejectMode(true);
    } else {
      // Second click: Confirm rejection
      if (!rejectionReason.trim()) {
        return; // Don't submit if reason is empty
      }
      onReject(rejectionReason);
    }
  };

  /**
   * Handle approve
   */
  const handleApprove = () => {
    onApprove();
  };

  /**
   * Cancel reject mode
   */
  const handleCancelReject = () => {
    setRejectMode(false);
    setRejectionReason("");
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Xét duyệt Yêu cầu nâng cấp
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        {/* User Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Avatar
            src={request.userId?.avatarUrl}
            alt={request.userId?.name}
            sx={{
              width: 80,
              height: 80,
              mb: 1.5,
              border: "4px solid",
              borderColor: "primary.main",
            }}
          >
            {request.userId?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {request.userId?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {request.userId?.email}
          </Typography>
        </Box>

        {/* Role Transition */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 1,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Hiện tại
            </Typography>
            <Typography variant="body1" fontWeight="600" color="primary.main">
              User
            </Typography>
          </Box>

          <ArrowForwardIcon sx={{ color: "primary.main" }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Yêu cầu
            </Typography>
            <Typography variant="body1" fontWeight="600" color="success.main">
              Author
            </Typography>
          </Box>
        </Box>

        {/* Reason Box */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="600"
            gutterBottom
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            Lý do đăng ký
          </Typography>
          <Box
            sx={{
              mt: 1,
              p: 2,
              bgcolor: "grey.100",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                color: "text.primary",
                lineHeight: 1.6,
              }}
            >
              "{request.reason}"
            </Typography>
          </Box>
        </Box>

        {/* Terms Agreement Box */}
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{
            mb: 3,
            bgcolor: "success.lighter",
            "& .MuiAlert-icon": {
              color: "success.main",
            },
          }}
        >
          <Typography variant="body2" fontWeight="500">
            Đã đồng ý với Cam kết & Điều khoản của Tác giả
          </Typography>
        </Alert>

        {/* Rejection Reason Input (Conditional) */}
        {rejectMode && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Lý do từ chối"
              placeholder="Nhập lý do từ chối để thông báo cho người dùng..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              error={rejectMode && !rejectionReason.trim()}
              helperText={
                rejectMode && !rejectionReason.trim()
                  ? "Vui lòng nhập lý do từ chối"
                  : ""
              }
              disabled={loading}
            />
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 1,
        }}
      >
        {rejectMode ? (
          // Rejection mode actions
          <>
            <Button
              onClick={handleCancelReject}
              disabled={loading}
              variant="outlined"
              sx={{ flex: 1 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleRejectClick}
              disabled={loading || !rejectionReason.trim()}
              variant="contained"
              color="error"
              sx={{ flex: 1 }}
            >
              {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </>
        ) : (
          // Normal mode actions
          <>
            <Button
              onClick={handleClose}
              disabled={loading}
              variant="outlined"
              color="inherit"
              sx={{ flex: 1 }}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleRejectClick}
              disabled={loading}
              variant="outlined"
              color="error"
              sx={{ flex: 1 }}
            >
              Từ chối
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading}
              variant="contained"
              color="success"
              sx={{ flex: 2 }}
            >
              {loading ? "Đang duyệt..." : "Phê duyệt"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReviewRequestDialog;
