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
  LinearProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff,
  HowToReg as RegisterIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Register Page Component
 * Trang đăng ký với layout 2 cột: Banner + Form
 */
const RegisterPage = () => {
  // State Management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  //  Auth context
  const { register, loading } = useAuth();

  /**
   * Calculate password strength
   * @returns {number} - 0 to 4 (weak to strong)
   */
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let strength = 0;
    // Length check
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    // Complexity checks
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++; // Has both cases
    if (/\d/.test(pwd)) strength++; // Has numbers
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++; // Has special chars

    return Math.min(strength, 4);
  };

  /**
   * Get password strength label and color
   */
  const getPasswordStrengthInfo = () => {
    const strength = getPasswordStrength();
    const info = [
      { label: "", color: "transparent", value: 0 },
      { label: "Rất yếu", color: "#f44336", value: 25 },
      { label: "Yếu", color: "#ff9800", value: 50 }, // FIX: Thêm # vào color
      { label: "Trung bình", color: "#ffeb3b", value: 75 },
      { label: "Mạnh", color: "#4caf50", value: 100 },
    ];
    return info[strength];
  };

  /**
   * Validate email format
   * Email phải có đuôi @vanlanguni.vn
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@vanlanguni\.vn$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password complexity
   * At least 8 chars, mix of upper, lower, numbers
   */
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải có ít nhất một ký tự in hoa";
    }
    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải có ít nhất một ký tự in thường";
    }
    if (!/\d/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ số";
    }
    return null;
  };

  /**
   * Validate single field (for real-time validation on blur)
   * @param {string} fieldName - Tên field cần validate
   * @param {string} value - Giá trị của field
   * @returns {string|null} - Error message hoặc null
   */
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          return "Vui lòng nhập họ tên";
        }
        if (value.trim().length < 2) {
          return "Họ tên phải có ít nhất 2 ký tự";
        }
        return null;

      case "email":
        if (!value) {
          return "Vui lòng nhập email";
        }
        if (!validateEmail(value)) {
          return "Email phải có đuôi @vanlanguni.vn";
        }
        return null;

      case "password":
        if (!value) {
          return "Vui lòng nhập mật khẩu";
        }
        return validatePassword(value);

      case "confirmPassword":
        if (!value) {
          return "Vui lòng nhập lại mật khẩu";
        }
        if (formData.password !== value) {
          return "Mật khẩu không khớp";
        }
        return null;

      default:
        return null;
    }
  };

  /**
   * Validate form
   * @returns {boolean} - True nếu form hợp lệ
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    }
    // Validate email
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email phải có đuôi @vanlanguni.vn";
    }
    // Validate password
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }
    // Validate terms agreement
    if (!agreeTerms) {
      newErrors.terms = "Vui lòng đồng ý với điều khoản sử dụng";
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
    // clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // clear API error
    if (apiError) {
      setApiError("");
    }
  };

  /**
   * Handle input blur - Validate field khi rời khỏi input
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError || "",
    }));

    // Re-validate confirmPassword khi password thay đổi
    if (name === "password" && formData.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword,
      );
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError || "",
      }));
    }
  };

  /**
   * Handle toggle password visibility
   */
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Handle toggle confirm password visibility
   */
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // FIX: Thêm () để GỌI hàm validateForm
    if (!validateForm()) {
      return;
    }

    try {
      // Gọi register từ AuthContext
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Register thành công - AuthContext sẽ tự động login và navigate => sẽ implement logic gửi mail xác thực sau
    } catch (error) {
      // Hiển thị lỗi từ API
      setApiError(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  // Lấy độ mạnh mật khẩu để hiển thị
  const passwordStrength = getPasswordStrengthInfo();

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Cột trái - Banner */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          position: "relative",
          backgroundImage: "url(/assets/library-banner.jpg)", // thay hình ảnh sau
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
            backgroundColor: "rgba(211, 47, 47, 0.7)",
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
            Tham gia cộng đồng học thuật của chúng tôi
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: 500,
              lineHeight: 1.6,
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Tạo tài khoản của bạn để truy cập hàng ngàn tài nguyên số, bài
            nghiên cứu và tạp chí học thuật dành riêng cho sinh viên Đại học Văn
            Lang.
          </Typography>
        </Box>
      </Grid>

      {/* Cột phải - Form */}
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
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            my: { xs: 4, md: 8 },
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
            {/* Thay bằng Logo của trường sau */}
            <Typography
              variant="h3"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              VLU
            </Typography>
          </Box>
          {/* Tên website */}
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
          >
            Đăng ký tài khoản
          </Typography>
          {/* Mô tả */}
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}
          >
            Tham gia thư viện số VLU ngay hôm nay
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
            {/* Name Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Họ tên đầy đủ"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="Nguyễn Văn A"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email}
              helperText={errors.email || "Chỉ chấp nhận email @vanlanguni.vn"}
              placeholder="nguyenvana@vanlanguni.vn"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: {
                  color: errors.email ? "error.main" : "info.main",
                },
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Độ mạnh mật khẩu
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: passwordStrength.color, fontWeight: 600 }}
                  >
                    {passwordStrength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.value}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: passwordStrength.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}

            {/* Confirm Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              placeholder="Nhập lại mật khẩu của bạn"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Terms & Conditions Checkbox */}
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    value="agreeTerms"
                    color="primary"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors((prev) => ({ ...prev, terms: "" }));
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Tôi đồng ý với{" "}
                    <Link
                      component={RouterLink}
                      to="/terms"
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link
                      component={RouterLink}
                      to="/privacy"
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Chính sách bảo mật
                    </Link>
                  </Typography>
                }
              />
              {errors.terms && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 4, display: "block" }}
                >
                  {errors.terms}
                </Typography>
              )}
            </Box>

            {/* Register Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                position: "relative",
              }}
              startIcon={!loading && <RegisterIcon />}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Đăng ký"
              )}
            </Button>

            {/* Divider */}
            <Box sx={{ textAlign: "center", my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Hoặc
              </Typography>
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Bạn đã có tài khoản?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Đăng nhập
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

export default RegisterPage;
