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
  alpha,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff,
  HowToReg as RegisterIcon,
  AutoStories as LibraryIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * RegisterPage - VLU Design System v2.0.1
 * Modern & Bold với Glass morphism + Gradient backgrounds + Tăng font sizes
 */
const RegisterPage = () => {
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

  const { register, loading } = useAuth();

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthInfo = () => {
    const strength = getPasswordStrength();
    const info = [
      { label: "", color: "transparent", value: 0 },
      { label: "Rất yếu", color: "#EF4444", value: 25 },
      { label: "Yếu", color: "#F59E0B", value: 50 },
      { label: "Trung bình", color: "#FBBF24", value: 75 },
      { label: "Mạnh", color: "#10B981", value: 100 },
    ];
    return info[strength];
  };

  const validateEmail = (email) => /^[^\s@]+@vanlanguni\.vn$/.test(email);

  const validatePassword = (password) => {
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(password))
      return "Mật khẩu phải có ít nhất một ký tự in hoa";
    if (!/[a-z]/.test(password))
      return "Mật khẩu phải có ít nhất một ký tự in thường";
    if (!/\d/.test(password)) return "Mật khẩu phải có ít nhất một chữ số";
    return null;
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "name":
        return !value.trim()
          ? "Vui lòng nhập họ tên"
          : value.trim().length < 2
            ? "Họ tên phải có ít nhất 2 ký tự"
            : null;
      case "email":
        return !value
          ? "Vui lòng nhập email"
          : !validateEmail(value)
            ? "Email phải có đuôi @vanlanguni.vn"
            : null;
      case "password":
        return !value ? "Vui lòng nhập mật khẩu" : validatePassword(value);
      case "confirmPassword":
        return !value
          ? "Vui lòng nhập lại mật khẩu"
          : formData.password !== value
            ? "Mật khẩu không khớp"
            : null;
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    else if (formData.name.trim().length < 2)
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    else if (!validateEmail(formData.email))
      newErrors.email = "Email phải có đuôi @vanlanguni.vn";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else {
      const pwdErr = validatePassword(formData.password);
      if (pwdErr) newErrors.password = pwdErr;
    }
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";
    if (!agreeTerms) newErrors.terms = "Vui lòng đồng ý với điều khoản sử dụng";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError || "" }));
    if (name === "password" && formData.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword,
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError || "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    } catch (error) {
      setApiError(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  const passwordStrength = getPasswordStrengthInfo();

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left Banner */}
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            right: "10%",
            width: 250,
            height: 250,
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
            bottom: "20%",
            left: "5%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            animation: "float 6s ease-in-out infinite reverse",
          }}
        />

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
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              fontSize: { sm: "2rem", md: "3rem" },
              lineHeight: 1.2,
            }}
          >
            Tham gia cộng đồng học thuật
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: 520,
              lineHeight: 1.8,
              opacity: 0.95,
              fontWeight: 400,
              fontSize: "1.0625rem",
            }}
          >
            Tạo tài khoản để truy cập hàng ngàn tài nguyên số, bài nghiên cứu và
            tạp chí học thuật dành riêng cho sinh viên Đại học Văn Lang.
          </Typography>

          {/* Benefits */}
          <Box sx={{ mt: 5, textAlign: "left" }}>
            {[
              "Truy cập 50,000+ tài liệu số",
              "Tải xuống và đọc offline",
              "Cộng đồng học thuật sôi động",
            ].map((benefit, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "8px",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  {benefit}
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
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            my: { xs: 3, md: 4 },
            mx: { xs: 3, md: 5 },
            maxWidth: 440,
            width: "100%",
            alignSelf: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              mb: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(211, 47, 47, 0.35)",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: "1.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textAlign: "center",
              }}
            >
              VLU
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              color: "#1A1A2E",
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: "1.75rem",
              textAlign: "center",
            }}
          >
            Đăng ký tài khoản
          </Typography>
          <Typography sx={{ color: "#8E8EA9", mb: 3, fontSize: "0.9375rem" }}>
            Tham gia thư viện số VLU ngay hôm nay
          </Typography>

          {apiError && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: "12px", fontSize: "0.9375rem" }}
            >
              {apiError}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            {/* Name Field */}
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 0.75,
                fontSize: "0.9375rem",
              }}
            >
              Họ tên đầy đủ
            </Typography>
            <TextField
              fullWidth
              name="name"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#8E8EA9" }} />
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

            {/* Email Field */}
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 0.75,
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
              onBlur={handleBlur}
              error={!!errors.email}
              helperText={errors.email || "Chỉ chấp nhận email @vanlanguni.vn"}
              FormHelperTextProps={{
                sx: {
                  color: errors.email ? "error.main" : "#2196F3",
                  fontSize: "0.8125rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#8E8EA9" }} />
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
              }}
            />

            {/* Password Field */}
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 0.75,
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
              onBlur={handleBlur}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#8E8EA9" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
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

            {/* Password Strength */}
            {formData.password && (
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.8125rem", color: "#8E8EA9" }}>
                    Độ mạnh mật khẩu
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      color: passwordStrength.color,
                      fontWeight: 600,
                    }}
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
                    bgcolor: "#E0E0E0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: passwordStrength.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}

            {/* Confirm Password */}
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 0.75,
                fontSize: "0.9375rem",
              }}
            >
              Xác nhận mật khẩu
            </Typography>
            <TextField
              fullWidth
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu của bạn"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetIcon sx={{ color: "#8E8EA9" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
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

            {/* Terms */}
            <Box sx={{ mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.terms)
                        setErrors((prev) => ({ ...prev, terms: "" }));
                    }}
                    sx={{
                      color: "#D32F2F",
                      "&.Mui-checked": { color: "#D32F2F" },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem", color: "#4A4A68" }}>
                    Tôi đồng ý với{" "}
                    <Link
                      component={RouterLink}
                      to="/terms"
                      sx={{
                        color: "#D32F2F",
                        textDecoration: "none",
                        fontWeight: 600,
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
                        color: "#D32F2F",
                        textDecoration: "none",
                        fontWeight: 600,
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
                  sx={{ color: "#EF4444", fontSize: "0.8125rem", ml: 4 }}
                >
                  {errors.terms}
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={!loading && <RegisterIcon />}
              sx={{
                py: 1.5,
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
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Đăng ký"
              )}
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", my: 2.5 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: "#E0E0E0" }} />
              <Typography
                sx={{ px: 2, color: "#8E8EA9", fontSize: "0.875rem" }}
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
              Bạn đã có tài khoản?{" "}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: "#D32F2F",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Đăng nhập
              </Link>
            </Typography>

            <Typography
              sx={{
                mt: 3,
                textAlign: "center",
                color: "#8E8EA9",
                fontSize: "0.8125rem",
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

export default RegisterPage;
