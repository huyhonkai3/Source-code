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
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Block as BlockIcon,
  VerifiedUser as VerifiedIcon,
} from "@mui/icons-material";

/**
 * LockUserDialog Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
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

  const isLocked = user?.status === "locked";
  const mode = isLocked ? "unlock" : "lock";

  useEffect(() => {
    if (open && user) {
      setLockReason("");
      setError("");
    }
  }, [open, user]);

  const handleConfirm = () => {
    if (mode === "lock" && !lockReason.trim()) {
      setError("Vui lòng nhập lý do khóa tài khoản");
      return;
    }
    if (mode === "lock" && lockReason.trim().length < 10) {
      setError("Lý do khóa phải có ít nhất 10 ký tự");
      return;
    }
    setError("");
    onConfirm(user._id || user.id, mode, lockReason.trim());
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2)
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const theme = {
    lock: {
      color: "#EF4444",
      gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
      bgLight: "#FEF2F2",
      borderLight: "#FECACA",
      icon: LockIcon,
      title: "Khóa tài khoản",
      subtitle: "Tạm ngưng quyền truy cập",
      buttonText: "Xác nhận Khóa",
    },
    unlock: {
      color: "#10B981",
      gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
      bgLight: "#D1FAE5",
      borderLight: "#A7F3D0",
      icon: LockOpenIcon,
      title: "Mở khóa tài khoản",
      subtitle: "Khôi phục quyền truy cập",
      buttonText: "Xác nhận Mở khóa",
    },
  };

  const currentTheme = theme[mode];
  const ThemeIcon = currentTheme.icon;

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{ background: currentTheme.gradient, color: "white", p: 0 }}
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
              <ThemeIcon sx={{ fontSize: 24 }} />
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
                {currentTheme.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.25, fontSize: "0.9375rem" }}
              >
                {currentTheme.subtitle}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
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
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            mb: 3,
            borderRadius: "12px",
            bgcolor: currentTheme.bgLight,
            border: "1px solid",
            borderColor: currentTheme.borderLight,
          }}
        >
          {mode === "lock" ? (
            <WarningIcon
              sx={{ color: "#B91C1C", fontSize: 22, flexShrink: 0, mt: 0.25 }}
            />
          ) : (
            <CheckCircleIcon
              sx={{ color: "#047857", fontSize: 22, flexShrink: 0, mt: 0.25 }}
            />
          )}
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: mode === "lock" ? "#B91C1C" : "#047857",
                mb: 0.5,
                fontSize: "0.9375rem",
              }}
            >
              {mode === "lock"
                ? "Bạn đang thực hiện khóa tài khoản"
                : "Bạn có chắc chắn muốn kích hoạt lại tài khoản này?"}
            </Typography>
            <Typography
              sx={{
                color: mode === "lock" ? "#DC2626" : "#059669",
                lineHeight: 1.5,
                fontSize: "0.8125rem",
              }}
            >
              {mode === "lock"
                ? "Hành động này sẽ ngăn người dùng đăng nhập vào hệ thống ngay lập tức."
                : "Người dùng sẽ có thể đăng nhập lại vào hệ thống ngay lập tức."}
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "16px",
            bgcolor: "#FAFAFC",
            border: "1px solid",
            borderColor: "#E0E0E0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              sx={{
                width: 56,
                height: 56,
                background: currentTheme.gradient,
                fontWeight: 600,
                fontSize: "1.25rem",
                boxShadow: `0 4px 14px ${alpha(currentTheme.color, 0.3)}`,
              }}
            >
              {getInitials(user.name)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "#1A1A2E",
                  mb: 0.5,
                  fontSize: "1rem",
                }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#8E8EA9", mb: 1, fontSize: "0.9375rem" }}
              >
                {user.email}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: isLocked ? "#FEE2E2" : "#D1FAE5",
                  borderRadius: "8px",
                }}
              >
                {isLocked ? (
                  <BlockIcon sx={{ fontSize: 14, color: "#EF4444" }} />
                ) : (
                  <VerifiedIcon sx={{ fontSize: 14, color: "#10B981" }} />
                )}
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: isLocked ? "#EF4444" : "#10B981",
                    fontSize: "0.8125rem",
                  }}
                >
                  {isLocked ? "Đã khóa" : "Hoạt động"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {mode === "lock" && (
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
              <InfoIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
              Lý do khóa tài khoản
              <Typography component="span" sx={{ color: "#EF4444" }}>
                *
              </Typography>
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
              helperText={
                error || `${lockReason.length}/500 ký tự (tối thiểu 10)`
              }
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

        {mode === "unlock" && user.lockReason && (
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#8E8EA9",
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.9375rem",
              }}
            >
              <InfoIcon sx={{ fontSize: 18 }} />
              Lý do bị khóa trước đó
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "12px",
                bgcolor: "#FEF2F2",
                border: "1px solid",
                borderColor: "#FECACA",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#B91C1C",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  fontSize: "0.9375rem",
                }}
              >
                "{user.lockReason}"
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            minWidth: 120,
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
          onClick={handleConfirm}
          disabled={loading || (mode === "lock" && !lockReason.trim())}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : mode === "lock" ? (
              <LockIcon />
            ) : (
              <LockOpenIcon />
            )
          }
          sx={{
            minWidth: 180,
            borderRadius: "12px",
            fontWeight: 600,
            py: 1.25,
            fontSize: "0.9375rem",
            bgcolor: currentTheme.color,
            boxShadow: `0 4px 14px ${alpha(currentTheme.color, 0.4)}`,
            "&:hover": {
              bgcolor: mode === "lock" ? "#DC2626" : "#059669",
              boxShadow: `0 6px 20px ${alpha(currentTheme.color, 0.5)}`,
            },
            "&:disabled": { bgcolor: "#C4C4D4" },
          }}
        >
          {loading ? "Đang xử lý..." : currentTheme.buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LockUserDialog;
