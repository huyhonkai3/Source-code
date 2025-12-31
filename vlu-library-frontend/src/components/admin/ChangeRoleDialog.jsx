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
  Paper,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Create as CreateIcon,
  Shield as ShieldIcon,
  AdminPanelSettings as AdminIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

/**
 * ChangeRoleDialog Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const ChangeRoleDialog = ({
  open,
  onClose,
  user,
  onConfirm,
  loading = false,
}) => {
  const [selectedRole, setSelectedRole] = useState("");

  const ROLES = [
    {
      value: "User",
      label: "User",
      sublabel: "Người dùng",
      description:
        "Xem, tìm kiếm và tải xuống tài liệu. Bình luận và đánh giá.",
      icon: PersonIcon,
      color: "#757575",
      bgColor: "#F5F5F5",
    },
    {
      value: "Author",
      label: "Author",
      sublabel: "Tác giả",
      description:
        "Bao gồm quyền User. Được phép tải lên và quản lý tài liệu của chính mình.",
      icon: CreateIcon,
      color: "#388E3C",
      bgColor: "#E8F5E9",
    },
    {
      value: "Moderator",
      label: "Moderator",
      sublabel: "Kiểm duyệt viên",
      description:
        "Được phép xem xét, phê duyệt hoặc từ chối các tài liệu do Author gửi lên.",
      icon: ShieldIcon,
      color: "#1976D2",
      bgColor: "#E3F2FD",
    },
    {
      value: "Admin",
      label: "Admin",
      sublabel: "Quản trị viên",
      description:
        "Quyền truy cập toàn bộ hệ thống. Quản lý người dùng, danh mục và cấu hình.",
      icon: AdminIcon,
      color: "#D32F2F",
      bgColor: "#FFEBEE",
    },
  ];

  useEffect(() => {
    if (user?.role) setSelectedRole(user.role);
  }, [user]);

  const handleRoleChange = (event) => setSelectedRole(event.target.value);
  const handleConfirm = () => {
    if (user && selectedRole && selectedRole !== user.role)
      onConfirm(user._id || user.id, selectedRole);
  };
  const isRoleUnchanged = selectedRole === user?.role;
  const getRoleConfig = (roleValue) =>
    ROLES.find((r) => r.value === roleValue) || ROLES[0];
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2)
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  if (!user) return null;
  const currentRoleConfig = getRoleConfig(user.role);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
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
              <SecurityIcon sx={{ fontSize: 24 }} />
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
                Phân quyền người dùng
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.25, fontSize: "0.9375rem" }}
              >
                Thay đổi vai trò và quyền hạn
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
                background: `linear-gradient(135deg, ${currentRoleConfig.color} 0%, ${alpha(currentRoleConfig.color, 0.7)} 100%)`,
                fontWeight: 600,
                fontSize: "1.25rem",
                boxShadow: `0 4px 14px ${alpha(currentRoleConfig.color, 0.3)}`,
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
                  bgcolor: currentRoleConfig.bgColor,
                  borderRadius: "8px",
                }}
              >
                {(() => {
                  const IconComp = currentRoleConfig.icon;
                  return (
                    <IconComp
                      sx={{ fontSize: 16, color: currentRoleConfig.color }}
                    />
                  );
                })()}
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: currentRoleConfig.color,
                    fontSize: "0.8125rem",
                  }}
                >
                  {currentRoleConfig.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Typography
          sx={{
            color: "#8E8EA9",
            fontWeight: 700,
            letterSpacing: "0.1em",
            display: "block",
            mb: 2,
            fontSize: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Chọn vai trò mới
        </Typography>

        <RadioGroup value={selectedRole} onChange={handleRoleChange}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {ROLES.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = selectedRole === role.value;
              const isCurrent = user.role === role.value;

              return (
                <Paper
                  key={role.value}
                  elevation={0}
                  onClick={() => !loading && setSelectedRole(role.value)}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    border: "2px solid",
                    borderColor: isSelected ? role.color : "#E0E0E0",
                    bgcolor: isSelected ? alpha(role.color, 0.04) : "white",
                    cursor: loading ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: loading ? "#E0E0E0" : role.color,
                      bgcolor: loading ? "white" : alpha(role.color, 0.04),
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Radio
                      checked={isSelected}
                      value={role.value}
                      disabled={loading}
                      sx={{
                        p: 0,
                        color: "#C4C4D4",
                        "&.Mui-checked": { color: role.color },
                      }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: role.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <RoleIcon sx={{ color: role.color, fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: "#1A1A2E",
                            fontSize: "0.9375rem",
                          }}
                        >
                          {role.label}
                        </Typography>
                        <Typography
                          sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}
                        >
                          ({role.sublabel})
                        </Typography>
                        {isCurrent && (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              bgcolor: "#F0F0F5",
                              borderRadius: "6px",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#8E8EA9",
                                fontWeight: 600,
                                fontSize: "0.6875rem",
                              }}
                            >
                              HIỆN TẠI
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#8E8EA9",
                          mt: 0.5,
                          lineHeight: 1.5,
                          fontSize: "0.875rem",
                        }}
                      >
                        {role.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </RadioGroup>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            mt: 3,
            borderRadius: "12px",
            bgcolor: "#FEF3C7",
            border: "1px solid",
            borderColor: "#FDE68A",
          }}
        >
          <InfoIcon
            sx={{ color: "#B45309", fontSize: 22, flexShrink: 0, mt: 0.25 }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#92400E", lineHeight: 1.6, fontSize: "0.9375rem" }}
          >
            Thay đổi vai trò sẽ cập nhật quyền hạn ngay lập tức và có thể ảnh
            hưởng đến truy cập của người dùng.
          </Typography>
        </Box>
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
          disabled={loading || isRoleUnchanged}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            minWidth: 160,
            borderRadius: "12px",
            fontWeight: 600,
            py: 1.25,
            fontSize: "0.9375rem",
            bgcolor: "#2196F3",
            boxShadow: "0 4px 14px rgba(33, 150, 243, 0.4)",
            "&:hover": {
              bgcolor: "#1976D2",
              boxShadow: "0 6px 20px rgba(33, 150, 243, 0.5)",
            },
            "&:disabled": { bgcolor: "#C4C4D4" },
          }}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRoleDialog;
