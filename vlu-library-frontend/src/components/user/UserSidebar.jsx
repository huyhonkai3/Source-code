import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Folder as FolderIcon,
  BarChart as BarChartIcon,
  RateReview as RateReviewIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * UserSidebar Component - VLU Design System v2.0
 * Modern & Bold sidebar navigation
 *
 * @param {string} active - Menu item đang active
 */
const UserSidebar = ({ active = "profile" }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Check user roles
  const isAuthor = user && user.role === "Author";
  const isModerator = user && user.role === "Moderator";

  // Role colors theo Design System v2.0
  const getRoleColor = (role) => {
    const colors = {
      Admin: "#D32F2F",
      Moderator: "#7C4DFF",
      Author: "#4CAF50",
      User: "#2196F3",
    };
    return colors[role] || "#8E8EA9";
  };

  // Menu items configuration với icons và colors
  const menuItems = [
    {
      id: "profile",
      label: "Thông tin cá nhân",
      icon: PersonIcon,
      path: "/profile",
      show: true,
      color: "#2196F3",
    },
    {
      id: "moderation",
      label: "Duyệt tài liệu",
      icon: RateReviewIcon,
      path: "/moderation",
      show: isModerator,
      color: "#7C4DFF",
    },
    {
      id: "my-documents",
      label: "Tài liệu của tôi",
      icon: FolderIcon,
      path: "/my-documents",
      show: isAuthor,
      color: "#4CAF50",
    },
    {
      id: "stats",
      label: "Thống kê",
      icon: BarChartIcon,
      path: "/author/stats",
      show: isAuthor,
      color: "#FF7043",
    },
    {
      id: "password",
      label: "Đổi mật khẩu",
      icon: LockIcon,
      path: "/profile/change-password",
      show: true,
      color: "#8E8EA9",
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: NotificationsIcon,
      path: "/profile/notifications",
      show: true,
      color: "#FFC107",
    },
  ];

  // Filter menu items based on show property
  const visibleMenuItems = menuItems.filter((item) => item.show);

  /**
   * Handle menu item click
   */
  const handleMenuClick = (path) => {
    navigate(path);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26, 26, 46, 0.06)",
        border: "1px solid #F0F0F5",
        position: "sticky",
        top: 90,
      }}
    >
      {/* ========== USER INFO HEADER ========== */}
      <Box
        sx={{
          p: 2.5,
          background: "linear-gradient(135deg, #FAFAFC 0%, #F0F0F5 100%)",
          borderBottom: "1px solid #F0F0F5",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user?.avatarUrl}
            sx={{
              width: 48,
              height: 48,
              bgcolor: getRoleColor(user?.role),
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#1A1A2E",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Người dùng"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: getRoleColor(user?.role),
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: getRoleColor(user?.role),
                }}
              />
              {user?.role === "Admin" && "Quản trị viên"}
              {user?.role === "Moderator" && "Kiểm duyệt viên"}
              {user?.role === "Author" && "Tác giả"}
              {user?.role === "User" && "Thành viên"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ========== SECTION HEADER ========== */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#8E8EA9",
            fontSize: "0.7rem",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SettingsIcon sx={{ fontSize: 14 }} />
          {isModerator ? "Quản lý & Cài đặt" : "Cài đặt tài khoản"}
        </Typography>
      </Box>

      {/* ========== MENU LIST ========== */}
      <List sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
        {visibleMenuItems.map((item, index) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: "12px",
                  position: "relative",
                  bgcolor: isActive ? alpha("#D32F2F", 0.08) : "transparent",
                  "&:hover": {
                    bgcolor: isActive ? alpha("#D32F2F", 0.12) : "#FAFAFC",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 4,
                      height: 24,
                      bgcolor: "#D32F2F",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}

                <ListItemIcon
                  sx={{
                    minWidth: 40,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: isActive
                        ? alpha("#D32F2F", 0.1)
                        : alpha(item.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 18,
                        color: isActive ? "#D32F2F" : item.color,
                      }}
                    />
                  </Box>
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#D32F2F" : "#4A4A68",
                  }}
                />

                {isActive && (
                  <ChevronRightIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* ========== DIVIDER ========== */}
      <Divider sx={{ mx: 2.5, borderColor: "#F0F0F5" }} />

      {/* ========== LOGOUT BUTTON ========== */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: "12px",
            "&:hover": {
              bgcolor: alpha("#D32F2F", 0.08),
            },
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: alpha("#D32F2F", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogoutIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
            </Box>
          </ListItemIcon>
          <ListItemText
            primary="Đăng xuất"
            primaryTypographyProps={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#D32F2F",
            }}
          />
        </ListItemButton>
      </Box>
    </Paper>
  );
};

export default UserSidebar;
