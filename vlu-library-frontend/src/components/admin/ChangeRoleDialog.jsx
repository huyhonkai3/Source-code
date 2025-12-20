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
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Create as CreateIcon,
  Shield as ShieldIcon,
  AdminPanelSettings as AdminIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

/**
 * ChangeRoleDialog Component
 * Modal cho phép Admin thay đổi vai trò (Role) của người dùng
 *
 * @param {boolean} open - Trạng thái mở/đóng dialog
 * @param {Function} onClose - Callback khi đóng dialog
 * @param {Object} user - User object cần thay đổi role
 * @param {Function} onConfirm - Callback khi xác nhận thay đổi (userId, newRole)
 * @param {boolean} loading - Trạng thái loading khi gọi API
 */
const ChangeRoleDialog = ({
  open,
  onClose,
  user,
  onConfirm,
  loading = false,
}) => {
  const [selectedRole, setSelectedRole] = useState("");

  // Role configuration với icon và mô tả
  const ROLES = [
    {
      value: "User",
      label: "User (Người dùng)",
      description:
        "Quyền hạn: Xem, tìm kiếm và tải xuống tài liệu. Bình luận và đánh giá.",
      icon: <PersonIcon />,
      color: "#757575",
    },
    {
      value: "Author",
      label: "Author (Tác giả)",
      description:
        "Bao gồm quyền User. Được phép tải lên và quản lý tài liệu của chính mình.",
      icon: <CreateIcon />,
      color: "#388E3C",
    },
    {
      value: "Moderator",
      label: "Moderator (Kiểm duyệt viên)",
      description:
        "Được phép xem xét, phê duyệt hoặc từ chối các tài liệu do Author gửi lên.",
      icon: <ShieldIcon />,
      color: "#1976D2",
    },
    {
      value: "Admin",
      label: "Admin (Quản trị viên)",
      description:
        "Quyền truy cập toàn bộ hệ thống. Quản lý người dùng, danh mục và cấu hình.",
      icon: <AdminIcon />,
      color: "#D32F2F",
    },
  ];

  // Set initial role when user changes
  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  /**
   * Handle role selection change
   */
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    if (user && selectedRole && selectedRole !== user.role) {
      onConfirm(user._id || user.id, selectedRole);
    }
  };

  /**
   * Check if role is unchanged
   */
  const isRoleUnchanged = selectedRole === user?.role;

  /**
   * Get role config by value
   */
  const getRoleConfig = (roleValue) => {
    return ROLES.find((r) => r.value === roleValue) || ROLES[0];
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

  if (!user) return null;

  const currentRoleConfig = getRoleConfig(user.role);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <ShieldIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Phân quyền người dùng
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
                backgroundColor: currentRoleConfig.color,
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
                <Box
                  sx={{
                    color: currentRoleConfig.color,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {currentRoleConfig.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: currentRoleConfig.color,
                  }}
                >
                  {currentRoleConfig.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Section Title */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            mb: 2,
            fontSize: "0.75rem",
          }}
        >
          Chọn vai trò mới
        </Typography>

        {/* Role Selection */}
        <RadioGroup value={selectedRole} onChange={handleRoleChange}>
          {ROLES.map((role, index) => (
            <Box key={role.value}>
              <FormControlLabel
                value={role.value}
                disabled={loading}
                control={
                  <Radio
                    sx={{
                      color: "primary.main",
                      "&.Mui-checked": {
                        color: role.color,
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          color: role.color,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {role.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        {role.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        mt: 0.5,
                        lineHeight: 1.4,
                      }}
                    >
                      {role.description}
                    </Typography>
                  </Box>
                }
                sx={{
                  mx: 0,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor:
                    selectedRole === role.value ? role.color : "transparent",
                  backgroundColor:
                    selectedRole === role.value
                      ? `${role.color}08`
                      : "transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor:
                      selectedRole === role.value
                        ? `${role.color}12`
                        : "action.hover",
                  },
                }}
              />
              {index < ROLES.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </RadioGroup>

        {/* Warning Alert */}
        <Alert
          severity="warning"
          icon={false}
          sx={{
            mt: 3,
            backgroundColor: "warning.lighter",
            border: "1px solid",
            borderColor: "warning.light",
            "& .MuiAlert-message": {
              fontSize: "0.8125rem",
            },
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            Lưu ý: Thay đổi vai trò sẽ cập nhật quyền hạn ngay lập tức và có thể
            ảnh hưởng đến truy cập của người dùng.
          </Typography>
        </Alert>
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
          disabled={loading || isRoleUnchanged}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            minWidth: 140,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRoleDialog;
