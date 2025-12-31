import { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  LinearProgress,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  LockReset as LockResetIcon,
} from "@mui/icons-material";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import authAPI from "../../api/auth.api";

/**
 * ChangePasswordPage Component - VLU Design System v2.0
 * Modern & Bold password change page với visual strength indicator
 */
const ChangePasswordPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide password states
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Handle input change
   */
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /**
   * Toggle password visibility
   */
  const handleTogglePassword = (field) => () => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  /**
   * Calculate password strength với Design System v2.0 colors
   */
  const calculatePasswordStrength = (password) => {
    if (!password)
      return { strength: 0, label: "", color: "#E0E0E0", bgColor: "#F0F0F5" };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;

    let label = "";
    let color = "";
    let bgColor = "";

    if (strength <= 25) {
      label = "Yếu";
      color = "#D32F2F";
      bgColor = "#FFEBEE";
    } else if (strength <= 50) {
      label = "Trung bình";
      color = "#FF7043";
      bgColor = "#FFF3E0";
    } else if (strength <= 75) {
      label = "Khá";
      color = "#2196F3";
      bgColor = "#E3F2FD";
    } else {
      label = "Mạnh";
      color = "#4CAF50";
      bgColor = "#E8F5E9";
    }

    return { strength, label, color, bgColor };
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.status === "success") {
        setSnackbar({
          open: true,
          message: "Đổi mật khẩu thành công!",
          severity: "success",
        });

        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);

      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach((err) => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
      } else {
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message ||
            "Không thể đổi mật khẩu. Vui lòng thử lại.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  /**
   * Password requirements checklist
   */
  const passwordRequirements = [
    {
      label: "Ít nhất 8 ký tự",
      met: formData.newPassword.length >= 8,
    },
    {
      label: "Bao gồm chữ hoa và chữ thường",
      met:
        /[a-z]/.test(formData.newPassword) &&
        /[A-Z]/.test(formData.newPassword),
    },
    {
      label: "Bao gồm số",
      met: /[0-9]/.test(formData.newPassword),
    },
    {
      label: "Bao gồm ký tự đặc biệt (!@#$%...)",
      met: /[^a-zA-Z0-9]/.test(formData.newPassword),
    },
  ];

  // Text field common styles
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#FAFAFC",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#C4C4D4",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#D32F2F",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#D32F2F",
    },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header />

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Grid container spacing={3}>
          {/* ========== SIDEBAR ========== */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="password" />
          </Grid>

          {/* ========== MAIN CONTENT ========== */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                bgcolor: "white",
                boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                border: "1px solid #F0F0F5",
              }}
            >
              {/* ========== HEADER ========== */}
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderBottom: "1px solid #F0F0F5",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                    flexShrink: 0,
                  }}
                >
                  <LockIcon sx={{ fontSize: 28, color: "white" }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "#1A1A2E",
                      mb: 0.5,
                    }}
                  >
                    Đổi mật khẩu
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho
                    người khác.
                  </Typography>
                </Box>
              </Box>

              {/* ========== FORM ========== */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ p: { xs: 3, md: 4 } }}
              >
                {/* Security Tips Banner */}
                <Box
                  sx={{
                    p: 2.5,
                    mb: 4,
                    borderRadius: "14px",
                    bgcolor: alpha("#2196F3", 0.08),
                    border: "1px solid",
                    borderColor: alpha("#2196F3", 0.2),
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <ShieldIcon
                    sx={{ color: "#2196F3", fontSize: 24, mt: 0.25 }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#1A1A2E", mb: 0.5 }}
                    >
                      Mẹo bảo mật
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#4A4A68", lineHeight: 1.6 }}
                    >
                      Sử dụng mật khẩu có ít nhất 12 ký tự, kết hợp chữ hoa, chữ
                      thường, số và ký tự đặc biệt. Không sử dụng thông tin cá
                      nhân như ngày sinh, tên, số điện thoại.
                    </Typography>
                  </Box>
                </Box>

                {/* ========== CURRENT PASSWORD ========== */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      color: "#1A1A2E",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <KeyIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                    Mật khẩu hiện tại
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword.current ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại"
                    value={formData.currentPassword}
                    onChange={handleChange("currentPassword")}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#8E8EA9" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword("current")}
                            edge="end"
                            sx={{ color: "#8E8EA9" }}
                          >
                            {showPassword.current ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldStyles}
                  />
                </Box>

                {/* ========== NEW PASSWORD ========== */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      color: "#1A1A2E",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <LockResetIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                    Mật khẩu mới
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword.new ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={formData.newPassword}
                    onChange={handleChange("newPassword")}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#8E8EA9" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword("new")}
                            edge="end"
                            sx={{ color: "#8E8EA9" }}
                          >
                            {showPassword.new ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldStyles}
                  />

                  {/* ========== PASSWORD STRENGTH INDICATOR ========== */}
                  {formData.newPassword && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: "12px",
                        bgcolor: passwordStrength.bgColor,
                        border: "1px solid",
                        borderColor: alpha(passwordStrength.color, 0.2),
                      }}
                    >
                      {/* Strength Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#4A4A68", fontWeight: 500 }}
                        >
                          Độ mạnh mật khẩu
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: passwordStrength.color,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <SecurityIcon sx={{ fontSize: 14 }} />
                          {passwordStrength.label}
                        </Typography>
                      </Box>

                      {/* Progress Bar */}
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength.strength}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(passwordStrength.color, 0.15),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            bgcolor: passwordStrength.color,
                          },
                        }}
                      />

                      {/* Requirements Checklist */}
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        {passwordRequirements.map((req, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: "8px",
                              bgcolor: req.met
                                ? alpha("#4CAF50", 0.1)
                                : alpha("#8E8EA9", 0.1),
                              border: "1px solid",
                              borderColor: req.met
                                ? alpha("#4CAF50", 0.3)
                                : "transparent",
                            }}
                          >
                            {req.met ? (
                              <CheckCircleIcon
                                sx={{ fontSize: 14, color: "#4CAF50" }}
                              />
                            ) : (
                              <CancelIcon
                                sx={{ fontSize: 14, color: "#C4C4D4" }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: req.met ? "#4CAF50" : "#8E8EA9",
                              }}
                            >
                              {req.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* ========== CONFIRM PASSWORD ========== */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      color: "#1A1A2E",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                    Xác nhận mật khẩu mới
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword.confirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#8E8EA9" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword("confirm")}
                            edge="end"
                            sx={{ color: "#8E8EA9" }}
                          >
                            {showPassword.confirm ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldStyles}
                  />

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      {formData.newPassword === formData.confirmPassword ? (
                        <>
                          <CheckCircleIcon
                            sx={{ fontSize: 16, color: "#4CAF50" }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "#4CAF50", fontWeight: 500 }}
                          >
                            Mật khẩu khớp
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CancelIcon sx={{ fontSize: 16, color: "#D32F2F" }} />
                          <Typography
                            variant="caption"
                            sx={{ color: "#D32F2F", fontWeight: 500 }}
                          >
                            Mật khẩu không khớp
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>

                {/* ========== SUBMIT BUTTON ========== */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    pt: 3,
                    borderTop: "1px solid #F0F0F5",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <LockResetIcon />
                      )
                    }
                    sx={{
                      bgcolor: "#D32F2F",
                      color: "white",
                      borderRadius: "12px",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                      "&:hover": {
                        bgcolor: "#B71C1C",
                        boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#E0E0E0",
                        color: "#8E8EA9",
                      },
                    }}
                  >
                    {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ========== SNACKBAR ========== */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              fontWeight: 500,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ChangePasswordPage;
