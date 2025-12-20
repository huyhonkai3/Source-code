import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Alert,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

/**
 * LockUserDialog Component
 * Smart dialog tự động switch giữa Lock/Unlock mode dựa trên user status
 *
 * LOCK MODE (status === 'active'):
 * - Red theme
 * - Require reason input
 * - Warning alert
 *
 * UNLOCK MODE (status === 'locked'):
 * - Green theme
 * - Display previous lock reason
 * - Confirmation message
 *
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {Object} user - User object (requires: _id/id, name, email, status, lockReason)
 * @param {Function} onConfirm - Confirm handler (userId, action, reason)
 * @param {boolean} loading - Loading state
 */
const LockUserDialog = ({
  open,
  onClose,
  user,
  onConfirm,
  loading = false,
}) => {
  const [lockReason, setLockReason] = useState("");
  const [error, setError] = useState("");

  // Determine mode based on user status
  const isLocked = user?.status === "locked";
  const mode = isLocked ? "unlock" : "lock";

  // Reset state when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      setLockReason("");
      setError("");
    }
  }, [open, user]);

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    // Validate lock reason for lock action
    if (mode === "lock" && !lockReason.trim()) {
      setError("Vui lòng nhập lý do khóa tài khoản");
      return;
    }

    if (mode === "lock" && lockReason.trim().length < 10) {
      setError("Lý do khóa phải có ít nhất 10 ký tự");
      return;
    }

    // Clear error and proceed
    setError("");
    onConfirm(user._id || user.id, mode, lockReason.trim());
  };

  /**
   * Get user initials for avatar
   */
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  /**
   * Theme colors based on mode
   */
  const theme = {
    lock: {
      color: "error.main",
      bgColor: "error.lighter",
      borderColor: "error.light",
      icon: <LockIcon />,
      title: "Khóa tài khoản",
      buttonText: "Xác nhận Khóa",
      buttonColor: "error",
    },
    unlock: {
      color: "success.main",
      bgColor: "success.lighter",
      borderColor: "success.light",
      icon: <LockOpenIcon />,
      title: "Mở khóa tài khoản",
      buttonText: "Xác nhận Mở khóa",
      buttonColor: "success",
    },
  };

  const currentTheme = theme[mode];

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              backgroundColor: currentTheme.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            {currentTheme.icon}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: currentTheme.color,
            }}
          >
            {currentTheme.title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Warning/Success Alert */}
        <Alert
          severity={mode === "lock" ? "warning" : "success"}
          icon={mode === "lock" ? <WarningIcon /> : <CheckCircleIcon />}
          sx={{
            mb: 3,
            backgroundColor: currentTheme.bgColor,
            border: "1px solid",
            borderColor: currentTheme.borderColor,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
            {mode === "lock"
              ? "Bạn đang thực hiện khóa tài khoản của người dùng"
              : "Bạn có chắc chắn muốn kích hoạt lại tài khoản này?"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {mode === "lock"
              ? "Hành động này sẽ ngăn người dùng đăng nhập vào hệ thống ngay lập tức."
              : "Người dùng sẽ có thể đăng nhập lại vào hệ thống ngay lập tức."}
          </Typography>
        </Alert>

        {/* User Info Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: currentTheme.color,
                fontWeight: 600,
                fontSize: "1.25rem",
              }}
            >
              {getInitials(user.name)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 0.5,
                }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 0.5 }}
              >
                {user.email}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.25,
                  backgroundColor: "white",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: isLocked ? "error.main" : "success.main",
                  }}
                >
                  {isLocked ? "Đã khóa" : "Hoạt động"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* LOCK MODE: Reason Input */}
        {mode === "lock" && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                color: "text.primary",
              }}
            >
              Lý do khóa tài khoản <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="VD: Vi phạm điều khoản sử dụng, Spam bình luận, Đăng tài liệu không phù hợp..."
              value={lockReason}
              onChange={(e) => {
                setLockReason(e.target.value);
                if (error) setError("");
              }}
              disabled={loading}
              error={!!error}
              helperText={error || "Tối thiểu 10 ký tự"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                },
              }}
            />
          </Box>
        )}

        {/* UNLOCK MODE: Display Previous Lock Reason */}
        {mode === "unlock" && user.lockReason && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                color: "text.secondary",
              }}
            >
              Lý do bị khóa trước đó
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                "{user.lockReason}"
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            minWidth: 100,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || (mode === "lock" && !lockReason.trim())}
          variant="contained"
          color={currentTheme.buttonColor}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : mode === "lock" ? (
              <LockIcon />
            ) : (
              <LockOpenIcon />
            )
          }
          sx={{
            minWidth: 160,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Đang xử lý..." : currentTheme.buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LockUserDialog;
