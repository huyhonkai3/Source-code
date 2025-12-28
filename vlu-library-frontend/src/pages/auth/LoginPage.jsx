import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MicrosoftLoginButton from "../../components/common/MicrosoftLoginButton";

/**
 * Login Page Component
 * Trang đăng nhập với layout 2 cột: Banner + Form
 */
const LoginPage = () => {
  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // Auth context
  const { login, loginWithMicrosoft, loading } = useAuth();
  const navigate = useNavigate();

  /**
   * Validate email format
   * Email phải có đuôi @vanlanguni.vn
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@vanlanguni\.vn$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form
   * @returns {boolean} - True nếu form hợp lệ
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email phải có đuôi @vanlanguni.vn";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear API error
    if (apiError) {
      setApiError("");
    }
  };

  /**
   * Handle toggle password visibility
   */
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMicrosoftSuccess = async (microsoftAccessToken) => {
    setApiError("");
    try {
      // Gọi hàm loginWithMicrosoft từ context
      await loginWithMicrosoft(microsoftAccessToken);
      // Context đã tự handle việc navigate nên không cần navigate ở đây
    } catch (err) {
      console.error("Backend Microsoft Login Error:", err);
      // Hiển thị lỗi từ backend trả về (ví dụ: email không hợp lệ, lỗi server...)
      setApiError(
        err.response?.data?.message ||
          "Đăng nhập Microsoft thất bại. Vui lòng thử lại.",
      );
    }
  };

  const handleMicrosoftError = (error) => {
    console.error("Frontend Microsoft Login Error:", error);
    setApiError("Không thể kết nối đến Microsoft. Vui lòng thử lại.");
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Gọi login từ AuthContext
      await login(formData.email, formData.password);

      // Login thành công - AuthContext sẽ tự động navigate
    } catch (error) {
      // Hiển thị lỗi từ API
      setApiError(error.message);
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Cột Trái - Banner */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          position: "relative",
          backgroundImage: "url(/assets/library-banner.jpg)", // Thay bằng đường dẫn ảnh thực tế
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: { xs: "none", sm: "block" },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(211, 47, 47, 0.7)", // VLU Red overlay
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            px: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Tri thức - Đạo đức - Sáng tạo
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: 500,
              lineHeight: 1.6,
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Truy cập kho tàng tri thức số của Đại học Văn Lang. Kết nối, nghiên
            cứu và phát triển tương lai của bạn.
          </Typography>
        </Box>
      </Grid>

      {/* Cột Phải - Form */}
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo VLU */}
          <Box
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "primary.main",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
            }}
          >
            {/* Thay bằng đường dẫn Logo */}
            <Typography
              variant="h3"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              VLU
            </Typography>
          </Box>

          {/* Tên ứng dụng */}
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
          >
            VLU Library
          </Typography>

          {/* Chào mừng */}
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
            Chào mừng trở lại
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}
          >
            Đăng nhập với tài khoản VLU để tiếp tục
          </Typography>

          {/* Alert hiển thị lỗi từ API */}
          {apiError && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {apiError}
            </Alert>
          )}

          {/* Form */}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ width: "100%" }}
          >
            {/* Email Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="email@vanlanguni.vn"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              placeholder="Nhập mật khẩu của bạn"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Remember Me & Forgot Password */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Ghi nhớ tôi"
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Quên mật khẩu?
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                position: "relative",
              }}
              startIcon={!loading && <LoginIcon />}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <MicrosoftLoginButton
              onLoginSuccess={handleMicrosoftSuccess}
              onError={handleMicrosoftError}
            />

            {/* Divider */}
            <Box sx={{ textAlign: "center", my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Hoặc
              </Typography>
            </Box>

            {/* Register Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Bạn không có tài khoản?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Đăng ký
                </Link>
              </Typography>
            </Box>

            {/* Copyright */}
            <Box sx={{ mt: 5, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Van Lang University. All rights
                reserved.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
