// Bố cục Public (Header + Content) cho trang chủ
// Dùng cho F11 (Trang Chủ & Tìm kiếm)

import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    AppBar,
    Toolbar,
    TextField,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Button,
    InputAdornment,
    Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Logo from "./Logo";
import { logout } from "../store/authSlice";

const PublicLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [searchQuery, setSearchQuery] = useState("");
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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6" }}>
            {/* Header */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: "white",
                    borderBottom: "1px solid #e5e7eb",
                }}
            >
                <Toolbar
                    sx={{
                        py: 1,
                        px: { xs: 2, md: 4 },
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Logo (Bên trái) */}
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Logo size={48} />
                            <Box sx={{ display: { xs: "none", md: "block" } }}>
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#b91c1c", fontWeight: "bold" }}
                                >
                                    Thư viện Số VLU
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                    Van Lang University
                                </Typography>
                            </Box>
                        </Box>
                    </Link>

                    {/* Thanh tìm kiếm (Giữa) */}
                    <Box
                        component="form"
                        onSubmit={handleSearch}
                        sx={{
                            flex: 1,
                            maxWidth: 600,
                            mx: { xs: 2, md: 4 },
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm tài liệu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "#6b7280" }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: "9999px",
                                    bgcolor: "#f9fafb",
                                    "&:hover": {
                                        bgcolor: "#f3f4f6",
                                    },
                                    "& fieldset": {
                                        borderColor: "#e5e7eb",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#d1d5db",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#b91c1c",
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* User Menu (Bên phải) */}
                    {isAuthenticated ? (
                        <Box>
                            <IconButton onClick={handleMenuOpen}>
                                <Avatar
                                    sx={{
                                        bgcolor: "#b91c1c",
                                        width: 40,
                                        height: 40,
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                transformOrigin={{ horizontal: "right", vertical: "top" }}
                                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            >
                                <MenuItem disabled>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {user?.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                {user?.role === "Admin" && (
                                    <MenuItem
                                        component={Link}
                                        to="/admin/categories"
                                        onClick={handleMenuClose}
                                    >
                                        Quản trị
                                    </MenuItem>
                                )}
                                {user?.role === "Moderator" && (
                                    <MenuItem
                                        component={Link}
                                        to="/moderator/review"
                                        onClick={handleMenuClose}
                                    >
                                        Duyệt tài liệu
                                    </MenuItem>
                                )}
                                {user?.role === "Author" && (
                                    <MenuItem
                                        component={Link}
                                        to="/author/upload"
                                        onClick={handleMenuClose}
                                    >
                                        Tải lên tài liệu
                                    </MenuItem>
                                )}
                                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            color="primary"
                            className="rounded-lg"
                        >
                            Đăng nhập
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box component="main">
                <Outlet />
            </Box>
        </Box>
    );
};

export default PublicLayout;