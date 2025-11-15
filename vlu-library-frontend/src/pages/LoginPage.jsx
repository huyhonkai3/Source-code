import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    Box,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import apiClient from "../api/axiosConfig";
import { setCredentials } from "../store/authSlice"; // ✅ SỬA: Đổi từ 'login' thành 'setCredentials'
import Logo from "../components/Logo";

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    maxWidth: 448,
    width: '100%',
}));

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formValues.email.trim() || !formValues.password.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post("/api/auth/login", {
                email: formValues.email.trim(),
                password: formValues.password,
            });

            const data = response.data?.data;
            const { accessToken, refreshToken, user } = data;

            // Lưu tokens và user info
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("user", JSON.stringify(user));

            // ✅ SỬA: Update Redux state với setCredentials
            dispatch(setCredentials({ user, accessToken, refreshToken }));

            // Role-based routing
            if (user.role === "Admin") {
                navigate("/admin/categories", { replace: true });
                return;
            }
            if (user.role === "Author") {
                navigate("/author/upload", { replace: true });
                return;
            }
            if (user.role === "Moderator") {
                navigate("/moderator/review", { replace: true });
                return;
            }

            // Default: User role hoặc không xác định
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            const message =
                err.response?.data?.message ||
                "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f3f4f6',
                p: 2,
            }}
        >
            {/* Logo */}
            <Box sx={{ mb: 4 }}>
                <Logo />
            </Box>

            {/* Login Card */}
            <StyledCard>
                <CardContent sx={{ p: 4 }}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 700, color: '#111827', mb: 1, textAlign: 'center' }}
                    >
                        Đăng nhập
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#6b7280', mb: 3, textAlign: 'center' }}
                    >
                        Chào mừng bạn quay trở lại với Thư viện Số VLU
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formValues.email}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            margin="normal"
                            autoComplete="email"
                            autoFocus
                        />

                        {/* Password */}
                        <TextField
                            label="Mật khẩu"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formValues.password}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            margin="normal"
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePassword}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                bgcolor: '#c1121f',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                py: 1.5,
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                '&:hover': {
                                    bgcolor: '#991b1b',
                                },
                                '&:disabled': {
                                    bgcolor: '#d1d5db',
                                    color: '#9ca3af',
                                },
                            }}
                        >
                            {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
                        </Button>
                    </form>

                    {/* Register Link */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Chưa có tài khoản?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#c1121f',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                Đăng ký ngay
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </StyledCard>

            {/* Footer */}
            <Typography
                variant="caption"
                sx={{ color: '#9ca3af', mt: 4, textAlign: 'center' }}
            >
                © 2025 Thư viện Số VLU. All rights reserved.
            </Typography>
        </Box>
    );
};

export default LoginPage;