import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import apiClient from "../api/axiosConfig";

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

        setSubmitSuccess("Đăng ký tài khoản thành công. Vui lòng đăng nhập.");
        // Sau 1–2s có thể tự động chuyển về /login, ở đây dùng navigate trực tiếp
        navigate("/login");
        } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Register error:", err);
        const apiMessage =
            err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
        setSubmitError(apiMessage);
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout>
        <Card className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
            <CardContent className="p-0">
            <Logo />
            <Typography
                variant="h5"
                align="center"
                gutterBottom
                className="font-bold text-gray-900"
            >
                TẠO TÀI KHOẢN THƯ VIỆN
            </Typography>

            {submitError && (
                <Alert severity="error" className="mt-2">
                {submitError}
                </Alert>
            )}

            {submitSuccess && (
                <Alert severity="success" className="mt-2">
                {submitSuccess}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
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
                />

                <TextField
                label="Email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                margin="normal"
                error={!!errors.email}
                helperText={errors.email || "Chỉ sử dụng email @vanlanguni.vn"}
                />

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
                helperText={errors.password || ""}
                />

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

                <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                className="rounded-lg mt-4 mb-2 shadow-md"
                disabled={isSubmitting}
                >
                ĐĂNG KÝ
                </Button>

                <div className="mt-2 text-center">
                <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-red-700"
                >
                    Đã có tài khoản? Đăng nhập
                </Link>
                </div>
            </form>
            </CardContent>
        </Card>
        </AuthLayout>
    );
};

export default RegisterPage;
