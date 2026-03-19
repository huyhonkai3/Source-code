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
  Collapse,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  FiberManualRecord as DotIcon,
  AdminPanelSettings as AdminIcon,
  Flag as FlagIcon,
  // FIX: đổi icon sang AssignmentTurnedIn để biểu thị "yêu cầu + phê duyệt"
  AssignmentTurnedIn as RequestsIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AdminSidebar Component - VLU Design System v2.0.1
 *
 * FIXED:
 * - Menu "Yêu cầu & Phê duyệt": path đổi từ /admin/upgrade-requests
 *   sang /admin/requests (trỏ đúng vào RequestsManagementPage có 2 tab).
 * - Label đổi thành "Yêu cầu & Phê duyệt" để phản ánh 2 chức năng:
 *   (1) duyệt nâng cấp Author, (2) duyệt yêu cầu chỉnh sửa tài liệu.
 * - Icon đổi sang AssignmentTurnedIn cho trực quan hơn.
 */
const AdminSidebar = ({
  active = "dashboard",
  pendingCount = 0,
  upgradeCount = 0,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [documentsOpen, setDocumentsOpen] = useState(
    active === "all-documents" || active === "moderation",
  );

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
      id: "reports",
      label: "Báo cáo vi phạm",
      icon: <FlagIcon />,
      path: "/admin/reports",
      section: "content",
      badge: null,
    },
    {
      id: "users",
      label: "Quản lý Người dùng",
      icon: <PeopleIcon />,
      path: "/admin/users",
      section: "users",
    },
    {
      // FIX 1: id giữ nguyên "upgrade-requests" để active highlight vẫn hoạt động
      //        với các page đang truyền active="upgrade-requests"
      id: "upgrade-requests",
      // FIX 2: label mới phản ánh đủ 2 chức năng trong trang
      label: "Yêu cầu & Phê duyệt",
      icon: <RequestsIcon />,
      // FIX 3: path trỏ đúng vào RequestsManagementPage (có cả 2 tab)
      //        thay vì /admin/upgrade-requests (UpgradeRequestsPage cũ, chỉ 1 tab)
      path: "/admin/requests",
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

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleDocumentsToggle = () => {
    setDocumentsOpen(!documentsOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getSectionLabel = (section) => {
    const labels = {
      main: "TỔNG QUAN",
      content: "NỘI DUNG",
      users: "NGƯỜI DÙNG",
      system: "HỆ THỐNG",
    };
    return labels[section] || "";
  };

  const sections = ["main", "content", "users", "system"];
  const groupedItems = sections.reduce((acc, section) => {
    acc[section] = menuItems.filter((item) => item.section === section);
    return acc;
  }, {});

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
        border: "1px solid #F0F0F5",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AdminIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "1.1875rem", lineHeight: 1.2 }}
            >
              VLU Admin
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: "0.8125rem" }}>
              Quản trị viên
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Menu List ── */}
      <List sx={{ p: 2 }}>
        {sections.map((section, sectionIndex) => (
          <Box key={section}>
            {groupedItems[section].length > 0 && (
              <>
                {sectionIndex > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="overline"
                      sx={{
                        px: 2,
                        py: 1,
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#8E8EA9",
                        letterSpacing: 1,
                      }}
                    >
                      {getSectionLabel(section)}
                    </Typography>
                  </>
                )}

                {groupedItems[section].map((item) => (
                  <Box key={item.id}>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={
                          item.hasDropdown
                            ? handleDocumentsToggle
                            : () => handleMenuClick(item.path)
                        }
                        selected={active === item.id && !item.hasDropdown}
                        sx={{
                          borderRadius: "12px",
                          py: 1.25,
                          px: 2,
                          "&.Mui-selected": {
                            bgcolor: "#D32F2F",
                            color: "white",
                            "&:hover": { bgcolor: "#B71C1C" },
                            "& .MuiListItemIcon-root": { color: "white" },
                          },
                          "&:hover": { bgcolor: "#F0F0F5" },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: active === item.id ? "white" : "#8E8EA9",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.9375rem",
                            fontWeight: active === item.id ? 600 : 500,
                          }}
                        />
                        {item.badge !== null && item.badge !== undefined && (
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: "8px",
                              bgcolor:
                                active === item.id
                                  ? "rgba(255,255,255,0.3)"
                                  : alpha("#D32F2F", 0.1),
                              color: active === item.id ? "white" : "#D32F2F",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: item.hasDropdown ? 1 : 0,
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                            >
                              {item.badge > 99 ? "99+" : item.badge}
                            </Typography>
                          </Box>
                        )}
                        {item.hasDropdown &&
                          (documentsOpen ? (
                            <ExpandLess sx={{ color: "#8E8EA9" }} />
                          ) : (
                            <ExpandMore sx={{ color: "#8E8EA9" }} />
                          ))}
                      </ListItemButton>
                    </ListItem>

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
                                  borderRadius: "12px",
                                  py: 1,
                                  pl: 6,
                                  pr: 2,
                                  "&.Mui-selected": {
                                    bgcolor: "#D32F2F",
                                    color: "white",
                                    "&:hover": { bgcolor: "#B71C1C" },
                                  },
                                  "&:hover": { bgcolor: "#F0F0F5" },
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    minWidth: 24,
                                    color:
                                      active === child.id ? "white" : "#C4C4D4",
                                  }}
                                >
                                  <DotIcon sx={{ fontSize: 8 }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={child.label}
                                  primaryTypographyProps={{
                                    fontSize: "0.875rem",
                                    fontWeight: active === child.id ? 600 : 500,
                                  }}
                                />
                                {child.badge !== null &&
                                  child.badge !== undefined && (
                                    <Box
                                      sx={{
                                        minWidth: 24,
                                        height: 24,
                                        borderRadius: "8px",
                                        bgcolor:
                                          active === child.id
                                            ? "rgba(255,255,255,0.3)"
                                            : alpha("#D32F2F", 0.1),
                                        color:
                                          active === child.id
                                            ? "white"
                                            : "#D32F2F",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontWeight: 700,
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        {child.badge > 99 ? "99+" : child.badge}
                                      </Typography>
                                    </Box>
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

        <Divider sx={{ my: 2 }} />

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "12px",
              py: 1.25,
              px: 2,
              color: "#D32F2F",
              "&:hover": { bgcolor: alpha("#D32F2F", 0.08) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "#D32F2F" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Đăng xuất"
              primaryTypographyProps={{
                fontSize: "0.9375rem",
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
