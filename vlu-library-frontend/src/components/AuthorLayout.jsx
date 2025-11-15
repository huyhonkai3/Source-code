import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
    Avatar, 
    IconButton, 
    Typography, 
    Menu, 
    MenuItem,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Logo from "./Logo";
import { logout } from "../store/authSlice";

const AuthorLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);
    const userName = user?.name || "Hoàng Thị Doanh Nhân";

    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        dispatch(logout());
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    const navItems = [
        {
            path: "/author/documents",
            label: "Tài liệu của tôi",
            icon: <ArticleIcon fontSize="small" />,
            disabled: true, // Sẽ implement sau
        },
        {
            path: "/author/upload",
            label: "Tải lên Tài liệu",
            icon: <CloudUploadIcon fontSize="small" />,
            disabled: false,
        },
    ];

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f3f4f6' }}>
            {/* Sidebar */}
            <Box
                sx={{
                    width: 256,
                    bgcolor: 'white',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                }}
            >
                {/* Logo Section */}
                <Box
                    sx={{
                        p: 3,
                        borderBottom: '1px solid #e5e7eb',
                        background: 'linear-gradient(to bottom, #fef2f2, white)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Logo />
                    <Typography 
                        variant="caption" 
                        sx={{ color: '#6b7280', mt: 1, fontWeight: 500 }}
                    >
                        Thư viện Số VLU - Author
                    </Typography>
                </Box>

                {/* Navigation Menu */}
                <List sx={{ flex: 1, py: 2, overflowY: 'auto' }}>
                    {navItems.map((item) => (
                        <ListItem 
                            key={item.path} 
                            sx={{ px: 1.5, mb: 0.5 }}
                            disablePadding
                        >
                            {item.disabled ? (
                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 2,
                                        py: 1.5,
                                        color: '#9ca3af',
                                        borderRadius: 2,
                                        cursor: 'not-allowed',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.label}
                                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            bgcolor: '#e5e7eb',
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        Sắp có
                                    </Typography>
                                </Box>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    style={{ textDecoration: 'none', width: '100%' }}
                                >
                                    {({ isActive }) => (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                                transition: 'all 0.2s',
                                                bgcolor: isActive ? '#c1121f' : 'transparent',
                                                color: isActive ? 'white' : '#374151',
                                                boxShadow: isActive ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                                                '&:hover': {
                                                    bgcolor: isActive ? '#c1121f' : '#fef2f2',
                                                    color: isActive ? 'white' : '#c1121f',
                                                },
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={item.label}
                                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                                            />
                                        </Box>
                                    )}
                                </NavLink>
                            )}
                        </ListItem>
                    ))}
                </List>

                {/* Footer */}
                <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        © 2025 VLU Library
                    </Typography>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <Box
                    sx={{
                        bgcolor: 'white',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        px: 3,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, color: '#111827' }}
                        >
                            Tải lên Tài liệu
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            Chia sẻ tài liệu của bạn với cộng đồng
                        </Typography>
                    </Box>

                    {/* User Profile */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #dc2626, #c1121f)',
                                color: 'white',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        >
                            {userName
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                                {userName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Tác giả
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={handleMenuOpen}
                            aria-controls={menuOpen ? "user-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? "true" : undefined}
                            sx={{
                                '&:hover': {
                                    bgcolor: '#f3f4f6',
                                },
                            }}
                        >
                            <KeyboardArrowDownIcon sx={{ color: '#374151' }} />
                        </IconButton>
                        <Menu
                            id="user-menu"
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            PaperProps={{
                                elevation: 3,
                                sx: {
                                    mt: 1.5,
                                    minWidth: 180,
                                    borderRadius: 2,
                                },
                            }}
                        >
                            <MenuItem 
                                onClick={handleLogout}
                                sx={{
                                    color: '#dc2626',
                                    '&:hover': {
                                        bgcolor: '#fef2f2',
                                    },
                                }}
                            >
                                Đăng xuất
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* Page Content */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        p: { xs: 2, md: 4 },
                        overflowY: 'auto',
                        bgcolor: '#f3f4f6',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AuthorLayout;