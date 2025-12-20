import { useState } from "react";
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
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Description as DocumentIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Header Component
 * Global navigation header with responsive design
 */
const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for menu anchors
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigation items
  const navItems = [
    { label: "Trang chủ", path: "/", icon: <HomeIcon /> },
    { label: "Tài liệu", path: "/documents", icon: <DocumentIcon /> },
    { label: "Danh mục", path: "/categories", icon: <CategoryIcon /> },
    { label: "Về chúng tôi", path: "/about", icon: <InfoIcon /> },
  ];

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
   * Mobile drawer content
   */
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{ my: 2, color: "primary.main", fontWeight: "bold" }}
      >
        VLU Library
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {!isAuthenticated && (
        <Box sx={{ p: 2 }}>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
          >
            Đăng nhập
          </Button>
          <Button component={Link} to="/register" variant="outlined" fullWidth>
            Đăng ký
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
        sx={{
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
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
                mr: { xs: 2, md: 4 },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "primary.main",
                  borderRadius: 1,
                  mr: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  V
                </Typography>
              </Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  display: { xs: "none", sm: "block" },
                }}
              >
                VLU Library
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: "text.primary",
                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "rgba(211, 47, 47, 0.04)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Spacer for mobile */}
            {isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* Right Side Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isAuthenticated ? (
                <>
                  {/* Notifications Icon */}
                  <IconButton color="inherit" aria-label="notifications">
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  {/* User Menu */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt={user?.name}
                        src={user?.avatarUrl}
                        sx={{ width: 36, height: 36 }}
                      >
                        {user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>

                    {/* User Info - Desktop only */}
                    {!isMobile && (
                      <Box sx={{ ml: 1, display: { xs: "none", md: "block" } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user?.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {user?.role === "Admin" && "Quản trị viên"}
                          {user?.role === "Moderator" && "Kiểm duyệt viên"}
                          {user?.role === "Author" && "Tác giả"}
                          {user?.role === "User" && "Sinh viên"}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* User Dropdown Menu */}
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleProfile}>
                      <Typography textAlign="center">Trang cá nhân</Typography>
                    </MenuItem>
                    {user?.role === "Author" && (
                      <MenuItem
                        onClick={() => {
                          handleCloseUserMenu();
                          navigate("/my-documents");
                        }}
                      >
                        <Typography textAlign="center">
                          Tài liệu của tôi
                        </Typography>
                      </MenuItem>
                    )}
                    {(user?.role === "Admin" || user?.role === "Moderator") && (
                      <MenuItem
                        onClick={() => {
                          handleCloseUserMenu();
                          navigate("/admin/dashboard");
                        }}
                      >
                        <Typography textAlign="center">Quản trị</Typography>
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center" color="error">
                        Đăng xuất
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  {/* Login/Register Buttons - Desktop only */}
                  {!isMobile && (
                    <>
                      <Button
                        component={Link}
                        to="/login"
                        variant="outlined"
                        sx={{ minWidth: 100 }}
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        sx={{ minWidth: 100 }}
                      >
                        Đăng ký
                      </Button>
                    </>
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
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
