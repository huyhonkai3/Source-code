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
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  AutoStories as LibraryIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MicrosoftLoginButton from "../../components/common/MicrosoftLoginButton";

/**
 * LoginPage - VLU Design System v2.0.1
 * Modern & Bold với Glass morphism + Gradient backgrounds + Tăng font sizes
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithMicrosoft, loading } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@vanlanguni\.vn$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    else if (!validateEmail(formData.email))
      newErrors.email = "Email phải có đuôi @vanlanguni.vn";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 8)
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleMicrosoftSuccess = async (microsoftAccessToken) => {
    setApiError("");
    setIsSubmitting(true);
    try {
      await loginWithMicrosoft(microsoftAccessToken);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng nhập Microsoft thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftError = (error) =>
    setApiError("Không thể kết nối đến Microsoft. Vui lòng thử lại.");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Sai email hoặc mật khẩu",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left Banner - Modern Gradient */}
      <Grid
        item
        xs={false}
        sm={5}
        md={7}
        sx={{
          position: "relative",
          background:
            "linear-gradient(135deg, #D32F2F 0%, #B71C1C 50%, #880E4F 100%)",
          display: { xs: "none", sm: "block" },
          overflow: "hidden",
        }}
      >
        {/* Decorative Pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        {/* Floating Shapes */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-20px)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "15%",
            right: "5%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            animation: "float 6s ease-in-out infinite reverse",
          }}
        />

        {/* Content */}
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
            px: 6,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              mb: 4,
              borderRadius: "24px",
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <LibraryIcon sx={{ fontSize: 48, color: "white" }} />
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontFamily: "'Inter', sans-serif",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              fontSize: { sm: "2.5rem", md: "3.5rem" },
              lineHeight: 1.2,
            }}
          >
            Đạo đức - Ý chí - Sáng tạo
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: 520,
              lineHeight: 1.8,
              opacity: 0.95,
              fontWeight: 400,
              fontSize: "1.125rem",
            }}
          >
            Truy cập kho tàng tri thức số của Đại học Văn Lang. Kết nối, nghiên
            cứu và phát triển tương lai của bạn.
          </Typography>

          {/* Stats */}
          <Box sx={{ display: "flex", gap: 6, mt: 6 }}>
            {[
              { value: "50K+", label: "Tài liệu" },
              { value: "10K+", label: "Người dùng" },
              { value: "100+", label: "Danh mục" },
            ].map((stat, i) => (
              <Box key={i} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "2rem",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: "0.9375rem", opacity: 0.8 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* Right Form */}
      <Grid
        item
        xs={12}
        sm={7}
        md={5}
        component={Paper}
        elevation={0}
        square
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: "#FAFAFC",
        }}
      >
        <Box
          sx={{
            my: { xs: 4, md: 6 },
            mx: { xs: 3, md: 6 },
            maxWidth: 440,
            width: "100%",
            alignSelf: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 72,
              height: 72,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
              borderRadius: "18px",
              boxShadow: "0 8px 24px rgba(211, 47, 47, 0.35)",
              mx: "auto",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: "1.75rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              VLU
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "#1A1A2E",
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: "2rem",
              textAlign: "center",
            }}
          >
            Chào mừng trở lại
          </Typography>
          <Typography
            sx={{
              color: "#8E8EA9",
              mb: 4,
              fontSize: "1rem",
              textAlign: "center",
            }}
          >
            Đăng nhập để tiếp tục với VLU Library
          </Typography>

          {apiError && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: "12px", fontSize: "0.9375rem" }}
              onClose={() => setApiError("")}
            >
              {apiError}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 1,
                fontSize: "0.9375rem",
              }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              name="email"
              placeholder="email@vanlanguni.vn"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#8E8EA9" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "white",
                  fontSize: "0.9375rem",
                  "& fieldset": { borderColor: "#E0E0E0" },
                  "&:hover fieldset": { borderColor: "#D32F2F" },
                  "&.Mui-focused fieldset": { borderColor: "#D32F2F" },
                },
                "& .MuiFormHelperText-root": { fontSize: "0.8125rem" },
              }}
            />

            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 1,
                fontSize: "0.9375rem",
              }}
            >
              Mật khẩu
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu của bạn"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#8E8EA9" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "white",
                  fontSize: "0.9375rem",
                  "& fieldset": { borderColor: "#E0E0E0" },
                  "&:hover fieldset": { borderColor: "#D32F2F" },
                  "&.Mui-focused fieldset": { borderColor: "#D32F2F" },
                },
                "& .MuiFormHelperText-root": { fontSize: "0.8125rem" },
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    sx={{
                      color: "#D32F2F",
                      "&.Mui-checked": { color: "#D32F2F" },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.9375rem", color: "#4A4A68" }}>
                    Ghi nhớ tôi
                  </Typography>
                }
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                sx={{
                  color: "#D32F2F",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Quên mật khẩu?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              startIcon={!isLoading && <LoginIcon />}
              sx={{
                py: 1.75,
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                bgcolor: "#D32F2F",
                boxShadow: "0 4px 14px rgba(211, 47, 47, 0.4)",
                "&:hover": {
                  bgcolor: "#B71C1C",
                  boxShadow: "0 6px 20px rgba(211, 47, 47, 0.5)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <MicrosoftLoginButton
              onLoginSuccess={handleMicrosoftSuccess}
              onError={handleMicrosoftError}
            />

            <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: "#E0E0E0" }} />
              <Typography
                sx={{ px: 2, color: "#8E8EA9", fontSize: "0.9375rem" }}
              >
                hoặc
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: "#E0E0E0" }} />
            </Box>

            <Typography
              sx={{
                textAlign: "center",
                color: "#4A4A68",
                fontSize: "0.9375rem",
              }}
            >
              Bạn không có tài khoản?{" "}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: "#D32F2F",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Đăng ký ngay
              </Link>
            </Typography>

            <Typography
              sx={{
                mt: 4,
                textAlign: "center",
                color: "#8E8EA9",
                fontSize: "0.875rem",
              }}
            >
              © {new Date().getFullYear()} Van Lang University. All rights
              reserved.
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
