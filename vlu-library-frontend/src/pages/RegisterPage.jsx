import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import apiClient from "../api/axiosConfig";

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    maxWidth: 448,
    width: '100%',
}));

const RegisterPage = () => {
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        // Clear error khi user typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formValues.name.trim()) {
            newErrors.name = "Họ và tên không được để trống";
        }

        if (!formValues.email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!formValues.email.endsWith("@vanlanguni.vn")) {
            newErrors.email = "Email phải có đuôi @vanlanguni.vn";
        }

        if (!formValues.password) {
            newErrors.password = "Mật khẩu không được để trống";
        } else if (formValues.password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
        }

        if (!formValues.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (formValues.confirmPassword !== formValues.password) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setSubmitSuccess("");

        const isValid = validate();
        if (!isValid) return;

        try {
            setIsSubmitting(true);

            await apiClient.post("/api/auth/register", {
                name: formValues.name.trim(),
                email: formValues.email.trim(),
                password: formValues.password,
                confirmPassword: formValues.confirmPassword,
            });

            setSubmitSuccess("Đăng ký tài khoản thành công. Đang chuyển đến trang đăng nhập...");
            
            // Chuyển sang trang login sau 1.5s
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            console.error("Register error:", err);
            const apiMessage =
                err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            setSubmitError(apiMessage);
        } finally {
            setIsSubmitting(false);
        }
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

            {/* Register Card */}
            <StyledCard>
                <CardContent sx={{ p: 4 }}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 700, color: '#111827', mb: 1, textAlign: 'center' }}
                    >
                        Tạo tài khoản
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#6b7280', mb: 3, textAlign: 'center' }}
                    >
                        Đăng ký tài khoản Thư viện Số VLU
                    </Typography>

                    {submitError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {submitError}
                        </Alert>
                    )}

                    {submitSuccess && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {submitSuccess}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <TextField
                            label="Họ và tên"
                            name="name"
                            value={formValues.name}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name || ""}
                            autoFocus
                        />

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
                            error={!!errors.email}
                            helperText={errors.email || "Chỉ sử dụng email @vanlanguni.vn"}
                        />

                        {/* Password */}
                        <TextField
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            value={formValues.password}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password || "Tối thiểu 8 ký tự"}
                        />

                        {/* Confirm Password */}
                        <TextField
                            label="Xác nhận Mật khẩu"
                            name="confirmPassword"
                            type="password"
                            value={formValues.confirmPassword}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword || ""}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isSubmitting}
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
                            {isSubmitting ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ"}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Đã có tài khoản?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#c1121f',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                Đăng nhập ngay
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

export default RegisterPage;