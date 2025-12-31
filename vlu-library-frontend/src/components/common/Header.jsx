import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  alpha,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Description as DocumentIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Article as ArticleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Header Component - VLU Design System v2.0
 * Modern & Bold navigation với glass morphism effect
 * UPDATED: Tăng font sizes để UX tốt hơn (min +2px)
 */
const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for menu anchors
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navigation items
  const navItems = [
    { label: "Trang chủ", path: "/", icon: <HomeIcon /> },
    { label: "Tài liệu", path: "/documents", icon: <DocumentIcon /> },
    { label: "Danh mục", path: "/categories", icon: <CategoryIcon /> },
    { label: "Về chúng tôi", path: "/about", icon: <InfoIcon /> },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Handle user menu open
   */
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  /**
   * Handle user menu close
   */
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  /**
   * Handle mobile drawer toggle
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  /**
   * Handle profile click
   */
  const handleProfile = () => {
    handleCloseUserMenu();
    navigate("/profile");
  };

  /**
   * Check if nav item is active
   */
  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  /**
   * Get role display name
   */
  const getRoleDisplayName = (role) => {
    const roles = {
      Admin: "Quản trị viên",
      Moderator: "Kiểm duyệt viên",
      Author: "Tác giả",
      User: "Sinh viên",
    };
    return roles[role] || role;
  };

  /**
   * Get role color
   */
  const getRoleColor = (role) => {
    const colors = {
      Admin: "#D32F2F",
      Moderator: "#7C4DFF",
      Author: "#2196F3",
      User: "#4CAF50",
    };
    return colors[role] || "#8E8EA9";
  };

  /**
   * Mobile drawer content
   */
  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: "1px solid #F0F0F5",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
              borderRadius: "12px",
            }}
          >
            <Typography
              sx={{ color: "white", fontWeight: 800, fontSize: "1.375rem" }}
            >
              V
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1A1A2E", fontSize: "1.25rem" }}
          >
            VLU Library
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "#8E8EA9" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Info - If logged in */}
      {isAuthenticated && (
        <Box sx={{ p: 2, bgcolor: "#FAFAFC" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={user?.avatarUrl}
              sx={{
                width: 48,
                height: 48,
                bgcolor: "#D32F2F",
                fontSize: "1.375rem",
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                sx={{ fontWeight: 600, color: "#1A1A2E", fontSize: "1rem" }}
              >
                {user?.name}
              </Typography>
              <Typography
                sx={{
                  color: getRoleColor(user?.role),
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {getRoleDisplayName(user?.role)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const isActive = isActiveRoute(item.path);
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  bgcolor: isActive ? alpha("#D32F2F", 0.08) : "transparent",
                  "&:hover": {
                    bgcolor: isActive ? alpha("#D32F2F", 0.12) : "#FAFAFC",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#D32F2F" : "#8E8EA9",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#D32F2F" : "#4A4A68",
                    fontSize: "1rem", // UPDATED: 16px thay vì 14px
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#F0F0F5" }} />

      {/* Bottom Actions */}
      <Box sx={{ p: 2 }}>
        {isAuthenticated ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => {
              handleDrawerToggle();
              logout();
            }}
            sx={{
              borderColor: "#E0E0E0",
              color: "#D32F2F",
              borderRadius: "12px",
              py: 1.25,
              fontWeight: 600,
              fontSize: "0.9375rem", // UPDATED: 15px thay vì 14px
              textTransform: "none",
              "&:hover": {
                borderColor: "#D32F2F",
                bgcolor: alpha("#D32F2F", 0.04),
              },
            }}
          >
            Đăng xuất
          </Button>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              component={Link}
              to="/login"
              onClick={handleDrawerToggle}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#D32F2F",
                borderRadius: "12px",
                py: 1.25,
                fontWeight: 600,
                fontSize: "0.9375rem", // UPDATED: 15px
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                "&:hover": {
                  bgcolor: "#B71C1C",
                },
              }}
            >
              Đăng nhập
            </Button>
            <Button
              component={Link}
              to="/register"
              onClick={handleDrawerToggle}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#E0E0E0",
                color: "#4A4A68",
                borderRadius: "12px",
                py: 1.25,
                fontWeight: 600,
                fontSize: "0.9375rem", // UPDATED: 15px
                textTransform: "none",
                "&:hover": {
                  borderColor: "#D32F2F",
                  color: "#D32F2F",
                },
              }}
            >
              Đăng ký
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: scrolled ? "rgba(255, 255, 255, 0.95)" : "white",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: "1px solid",
          borderColor: scrolled ? "transparent" : "#F0F0F5",
          boxShadow: scrolled ? "0 4px 20px rgba(26, 26, 46, 0.08)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 72 },
              gap: 2,
            }}
          >
            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  color: "#4A4A68",
                  mr: 1,
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                mr: { xs: "auto", md: 4 },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                  borderRadius: "12px",
                  mr: 1.5,
                  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.25)",
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: "1.5rem", // UPDATED: 24px thay vì 22px
                  }}
                >
                  V
                </Typography>
              </Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  fontSize: "1.375rem", // UPDATED: 22px thay vì 20px
                  display: { xs: "none", sm: "block" },
                  letterSpacing: "-0.01em",
                }}
              >
                VLU Library
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
                {navItems.map((item) => {
                  const isActive = isActiveRoute(item.path);
                  return (
                    <Button
                      key={item.label}
                      component={Link}
                      to={item.path}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: "10px",
                        color: isActive ? "#D32F2F" : "#4A4A68",
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "1rem", // UPDATED: 16px thay vì 15px
                        textTransform: "none",
                        bgcolor: isActive
                          ? alpha("#D32F2F", 0.08)
                          : "transparent",
                        position: "relative",
                        "&:hover": {
                          bgcolor: isActive
                            ? alpha("#D32F2F", 0.12)
                            : alpha("#1A1A2E", 0.04),
                          color: isActive ? "#D32F2F" : "#1A1A2E",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            )}

            {/* Right Side Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Search Button - Desktop */}
              {!isMobile && (
                <IconButton
                  component={Link}
                  to="/documents"
                  sx={{
                    color: "#8E8EA9",
                    bgcolor: "#F0F0F5",
                    borderRadius: "10px",
                    "&:hover": {
                      bgcolor: "#E8E8ED",
                      color: "#4A4A68",
                    },
                  }}
                >
                  <SearchIcon />
                </IconButton>
              )}

              {isAuthenticated ? (
                <>
                  {/* Notifications Icon */}
                  <IconButton
                    sx={{
                      color: "#8E8EA9",
                      bgcolor: "#F0F0F5",
                      borderRadius: "10px",
                      "&:hover": {
                        bgcolor: "#E8E8ED",
                        color: "#4A4A68",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={3}
                      sx={{
                        "& .MuiBadge-badge": {
                          bgcolor: "#D32F2F",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.75rem", // UPDATED: 12px
                        },
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  {/* User Avatar & Menu */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{
                        p: 0.5,
                        border: "2px solid transparent",
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: alpha("#D32F2F", 0.3),
                        },
                      }}
                    >
                      <Avatar
                        alt={user?.name}
                        src={user?.avatarUrl}
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: "#D32F2F",
                          fontSize: "1.125rem", // UPDATED: 18px thay vì 16px
                          fontWeight: 600,
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>

                    {/* User Info - Desktop only */}
                    {!isMobile && (
                      <Box sx={{ display: { xs: "none", lg: "block" } }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1A1A2E",
                            lineHeight: 1.3,
                            fontSize: "0.9375rem", // UPDATED: 15px thay vì 14px
                          }}
                        >
                          {user?.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: getRoleColor(user?.role),
                            fontWeight: 600,
                            fontSize: "0.8125rem", // UPDATED: 13px thay vì 11px
                          }}
                        >
                          {getRoleDisplayName(user?.role)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* User Dropdown Menu */}
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: "16px",
                        boxShadow: "0 10px 40px rgba(26, 26, 46, 0.12)",
                        border: "1px solid #F0F0F5",
                        overflow: "visible",
                        "&::before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 20,
                          width: 12,
                          height: 12,
                          bgcolor: "white",
                          transform: "translateY(-50%) rotate(45deg)",
                          borderLeft: "1px solid #F0F0F5",
                          borderTop: "1px solid #F0F0F5",
                        },
                      },
                    }}
                  >
                    {/* User Info Header */}
                    <Box sx={{ px: 2, py: 1.5, bgcolor: "#FAFAFC" }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#1A1A2E",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {user?.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#8E8EA9",
                          display: "block",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {user?.email}
                      </Typography>
                    </Box>

                    <Divider sx={{ borderColor: "#F0F0F5" }} />

                    {/* Menu Items */}
                    <Box sx={{ py: 1 }}>
                      <MenuItem
                        onClick={handleProfile}
                        sx={{
                          py: 1.25,
                          px: 2,
                          gap: 1.5,
                          "&:hover": { bgcolor: "#FAFAFC" },
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 20, color: "#8E8EA9" }} />
                        <Typography
                          sx={{ fontWeight: 500, fontSize: "0.9375rem" }}
                        >
                          Trang cá nhân
                        </Typography>
                      </MenuItem>

                      {user?.role === "Author" && (
                        <MenuItem
                          onClick={() => {
                            handleCloseUserMenu();
                            navigate("/my-documents");
                          }}
                          sx={{
                            py: 1.25,
                            px: 2,
                            gap: 1.5,
                            "&:hover": { bgcolor: "#FAFAFC" },
                          }}
                        >
                          <ArticleIcon
                            sx={{ fontSize: 20, color: "#8E8EA9" }}
                          />
                          <Typography
                            sx={{ fontWeight: 500, fontSize: "0.9375rem" }}
                          >
                            Tài liệu của tôi
                          </Typography>
                        </MenuItem>
                      )}

                      {(user?.role === "Admin" ||
                        user?.role === "Moderator") && (
                        <MenuItem
                          onClick={() => {
                            handleCloseUserMenu();
                            navigate("/admin/dashboard");
                          }}
                          sx={{
                            py: 1.25,
                            px: 2,
                            gap: 1.5,
                            "&:hover": { bgcolor: "#FAFAFC" },
                          }}
                        >
                          <AdminIcon sx={{ fontSize: 20, color: "#7C4DFF" }} />
                          <Typography
                            sx={{
                              fontWeight: 500,
                              color: "#7C4DFF",
                              fontSize: "0.9375rem",
                            }}
                          >
                            Quản trị
                          </Typography>
                        </MenuItem>
                      )}
                    </Box>

                    <Divider sx={{ borderColor: "#F0F0F5" }} />

                    {/* Logout */}
                    <Box sx={{ py: 1 }}>
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          py: 1.25,
                          px: 2,
                          gap: 1.5,
                          "&:hover": { bgcolor: alpha("#D32F2F", 0.04) },
                        }}
                      >
                        <LogoutIcon sx={{ fontSize: 20, color: "#D32F2F" }} />
                        <Typography
                          sx={{
                            fontWeight: 500,
                            color: "#D32F2F",
                            fontSize: "0.9375rem",
                          }}
                        >
                          Đăng xuất
                        </Typography>
                      </MenuItem>
                    </Box>
                  </Menu>
                </>
              ) : (
                <>
                  {/* Login/Register Buttons - Desktop only */}
                  {!isMobile && (
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Button
                        component={Link}
                        to="/login"
                        variant="outlined"
                        sx={{
                          borderColor: "#E0E0E0",
                          color: "#4A4A68",
                          borderRadius: "10px",
                          px: 2.5,
                          py: 1,
                          fontWeight: 600,
                          fontSize: "0.9375rem", // UPDATED: 15px
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#D32F2F",
                            color: "#D32F2F",
                            bgcolor: alpha("#D32F2F", 0.04),
                          },
                        }}
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        sx={{
                          bgcolor: "#D32F2F",
                          color: "white",
                          borderRadius: "10px",
                          px: 2.5,
                          py: 1,
                          fontWeight: 600,
                          fontSize: "0.9375rem", // UPDATED: 15px
                          textTransform: "none",
                          boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                          "&:hover": {
                            bgcolor: "#B71C1C",
                            boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
                          },
                        }}
                      >
                        Đăng ký
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 300,
            borderRadius: "0 24px 24px 0",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
