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
  Badge,
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AdminSidebar Component
 * Sidebar navigation dành riêng cho Admin với nested menu
 *
 * @param {string} active - Menu item đang active ('dashboard', 'all-documents', 'moderation', etc.)
 * @param {number} pendingCount - Số tài liệu chờ duyệt (optional)
 * @param {number} upgradeCount - Số yêu cầu nâng cấp Author (optional)
 */
const AdminSidebar = ({
  active = "dashboard",
  pendingCount = 0,
  upgradeCount = 0,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Dropdown states
  const [documentsOpen, setDocumentsOpen] = useState(
    active === "all-documents" || active === "moderation",
  );

  // Admin menu items configuration
  const menuItems = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: <DashboardIcon />,
      path: "/admin/dashboard",
      section: "main",
    },
    {
      id: "documents-parent",
      label: "Quản lý Tài liệu",
      icon: <DescriptionIcon />,
      section: "content",
      hasDropdown: true,
      badge: pendingCount > 0 ? pendingCount : null,
      children: [
        {
          id: "all-documents",
          label: "Toàn bộ tài liệu",
          path: "/admin/documents",
        },
        {
          id: "moderation",
          label: "Duyệt tài liệu",
          path: "/admin/moderation",
          badge: pendingCount > 0 ? pendingCount : null,
        },
      ],
    },
    {
      id: "categories",
      label: "Quản lý Danh mục",
      icon: <CategoryIcon />,
      path: "/admin/categories",
      section: "content",
    },
    {
      id: "users",
      label: "Quản lý Người dùng",
      icon: <PeopleIcon />,
      path: "/admin/users",
      section: "users",
    },
    {
      id: "upgrade-requests",
      label: "Yêu cầu Nâng cấp",
      icon: <PersonAddIcon />,
      path: "/admin/upgrade-requests",
      section: "users",
      badge: upgradeCount > 0 ? upgradeCount : null,
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: <SettingsIcon />,
      path: "/admin/settings",
      section: "system",
    },
  ];

  /**
   * Handle menu item click
   */
  const handleMenuClick = (path) => {
    navigate(path);
  };

  /**
   * Handle dropdown toggle
   */
  const handleDocumentsToggle = () => {
    setDocumentsOpen(!documentsOpen);
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

  /**
   * Get section label
   */
  const getSectionLabel = (section) => {
    const labels = {
      main: "TỔNG QUAN",
      content: "NỘI DUNG",
      users: "NGƯỜI DÙNG",
      system: "HỆ THỐNG",
    };
    return labels[section] || "";
  };

  // Group items by section
  const sections = ["main", "content", "users", "system"];
  const groupedItems = sections.reduce((acc, section) => {
    acc[section] = menuItems.filter((item) => item.section === section);
    return acc;
  }, {});

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
          backgroundColor: "error.main",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DashboardIcon fontSize="small" />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            VLU Admin
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.9,
            fontSize: "0.7rem",
          }}
        >
          Quản trị viên
        </Typography>
      </Box>

      {/* Menu List */}
      <List sx={{ p: 1.5 }}>
        {sections.map((section, sectionIndex) => (
          <Box key={section}>
            {groupedItems[section].length > 0 && (
              <>
                {/* Section Label */}
                {sectionIndex > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography
                      variant="overline"
                      sx={{
                        px: 2,
                        py: 1,
                        display: "block",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "text.secondary",
                        letterSpacing: 0.8,
                      }}
                    >
                      {getSectionLabel(section)}
                    </Typography>
                  </>
                )}

                {/* Menu Items */}
                {groupedItems[section].map((item) => (
                  <Box key={item.id}>
                    {/* Parent Menu Item */}
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={
                          item.hasDropdown
                            ? handleDocumentsToggle
                            : () => handleMenuClick(item.path)
                        }
                        selected={active === item.id && !item.hasDropdown}
                        sx={{
                          borderRadius: 1.5,
                          py: 1.25,
                          px: 2,
                          "&.Mui-selected": {
                            backgroundColor: "error.main",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "error.dark",
                            },
                            "& .MuiListItemIcon-root": {
                              color: "white",
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
                            minWidth: 36,
                            color: "text.secondary",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        />
                        {/* Badge for parent item */}
                        {item.badge !== null &&
                          item.badge !== undefined &&
                          !item.hasDropdown && (
                            <Badge
                              badgeContent={item.badge}
                              color="error"
                              max={99}
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: "0.65rem",
                                  height: 18,
                                  minWidth: 18,
                                  padding: "0 4px",
                                },
                              }}
                            />
                          )}
                        {/* Parent with badge and dropdown */}
                        {item.badge !== null &&
                          item.badge !== undefined &&
                          item.hasDropdown && (
                            <Badge
                              badgeContent={item.badge}
                              color="error"
                              max={99}
                              sx={{
                                mr: 1,
                                "& .MuiBadge-badge": {
                                  fontSize: "0.65rem",
                                  height: 18,
                                  minWidth: 18,
                                  padding: "0 4px",
                                },
                              }}
                            />
                          )}
                        {/* Dropdown arrow */}
                        {item.hasDropdown &&
                          (documentsOpen ? <ExpandLess /> : <ExpandMore />)}
                      </ListItemButton>
                    </ListItem>

                    {/* Dropdown Children */}
                    {item.hasDropdown && (
                      <Collapse in={documentsOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children.map((child) => (
                            <ListItem
                              key={child.id}
                              disablePadding
                              sx={{ mb: 0.5 }}
                            >
                              <ListItemButton
                                onClick={() => handleMenuClick(child.path)}
                                selected={active === child.id}
                                sx={{
                                  borderRadius: 1.5,
                                  py: 1,
                                  pl: 6,
                                  pr: 2,
                                  "&.Mui-selected": {
                                    backgroundColor: "error.main",
                                    color: "white",
                                    "&:hover": {
                                      backgroundColor: "error.dark",
                                    },
                                    "& .MuiListItemIcon-root": {
                                      color: "white",
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
                                    minWidth: 24,
                                    color: "text.secondary",
                                  }}
                                >
                                  <DotIcon sx={{ fontSize: 8 }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={child.label}
                                  primaryTypographyProps={{
                                    fontSize: "0.8125rem",
                                    fontWeight: active === child.id ? 600 : 500,
                                  }}
                                />
                                {child.badge !== null &&
                                  child.badge !== undefined && (
                                    <Badge
                                      badgeContent={child.badge}
                                      color="error"
                                      max={99}
                                      sx={{
                                        "& .MuiBadge-badge": {
                                          fontSize: "0.65rem",
                                          height: 18,
                                          minWidth: 18,
                                          padding: "0 4px",
                                        },
                                      }}
                                    />
                                  )}
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </Box>
                ))}
              </>
            )}
          </Box>
        ))}

        {/* Divider before Logout */}
        <Divider sx={{ my: 1.5 }} />

        {/* Logout Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              py: 1.25,
              px: 2,
              color: "error.main",
              "&:hover": {
                backgroundColor: (theme) => `${theme.palette.error.main}08`,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: "error.main",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Đăng xuất"
              primaryTypographyProps={{
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
};

export default AdminSidebar;
