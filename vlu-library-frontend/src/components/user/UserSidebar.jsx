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
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Folder as FolderIcon,
  BarChart as BarChartIcon,
  RateReview as RateReviewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * UserSidebar Component
 * Sidebar navigation cho User, Author và Moderator (Admin sử dụng AdminSidebar riêng)
 *
 * @param {string} active - Menu item đang active
 */
const UserSidebar = ({ active = "profile" }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Check user roles
  const isAuthor = user && user.role === "Author";
  const isModerator = user && user.role === "Moderator";

  // Menu items configuration
  const menuItems = [
    {
      id: "profile",
      label: "Thông tin cá nhân",
      icon: <PersonIcon />,
      path: "/profile",
      show: true, // Always show
    },
    {
      id: "moderation",
      label: "Duyệt tài liệu",
      icon: <RateReviewIcon />,
      path: "/moderation",
      show: isModerator, // Only for Moderator (Admin uses AdminSidebar)
    },
    {
      id: "my-documents",
      label: "Tài liệu của tôi",
      icon: <FolderIcon />,
      path: "/my-documents",
      show: isAuthor, // Only for Author
    },
    {
      id: "stats",
      label: "Thống kê",
      icon: <BarChartIcon />,
      path: "/author/stats",
      show: isAuthor, // Only for Author
    },
    {
      id: "password",
      label: "Đổi mật khẩu",
      icon: <LockIcon />,
      path: "/profile/change-password",
      show: true, // Always show
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: <NotificationsIcon />,
      path: "/profile/notifications",
      show: true, // Always show
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
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          backgroundColor: "grey.50",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: "text.secondary",
            fontSize: "0.75rem",
          }}
        >
          {isModerator ? "Quản lý & Cài đặt" : "Cài đặt tài khoản"}
        </Typography>
      </Box>

      {/* Menu List */}
      <List sx={{ p: 0 }}>
        {visibleMenuItems.map((item, index) => (
          <Box key={item.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                selected={active === item.id}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  position: "relative",
                  "&.Mui-selected": {
                    backgroundColor: (theme) => `${theme.palette.error.main}08`, // Red with 8% opacity
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: (theme) =>
                        `${theme.palette.error.main}12`,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      backgroundColor: "error.main",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "error.main",
                    },
                    "& .MuiListItemText-primary": {
                      fontWeight: 600,
                    },
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.9375rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index < visibleMenuItems.length - 1 && (
              <Divider sx={{ mx: 2.5 }} />
            )}
          </Box>
        ))}

        {/* Divider before Logout */}
        <Divider sx={{ my: 1 }} />

        {/* Logout Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2.5,
              color: "error.main",
              "&:hover": {
                backgroundColor: (theme) => `${theme.palette.error.main}08`,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: "error.main",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Đăng xuất"
              primaryTypographyProps={{
                fontSize: "0.9375rem",
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
};

export default UserSidebar;
