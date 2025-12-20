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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import authAPI from "../../api/auth.api";

/**
 * ChangePasswordPage Component
 * Trang đổi mật khẩu cho User
 *
 * Features:
 * - 3 input fields: Current password, New password, Confirm password
 * - Show/hide password với icon mắt
 * - Password strength indicator
 * - Real-time validation
 * - Success/Error feedback
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
    // Clear error when user types
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
   * Calculate password strength
   */
  const calculatePasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;

    let label = "";
    let color = "";
    if (strength <= 25) {
      label = "Yếu";
      color = "error";
    } else if (strength <= 50) {
      label = "Trung bình";
      color = "warning";
    } else if (strength <= 75) {
      label = "Khá";
      color = "info";
    } else {
      label = "Mạnh";
      color = "success";
    }

    return { strength, label, color };
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
        // Success
        setSnackbar({
          open: true,
          message: "Đổi mật khẩu thành công",
          severity: "success",
        });

        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);

      // Handle errors
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
      label: "Bao gồm số hoặc ký tự đặc biệt",
      met:
        /[0-9]/.test(formData.newPassword) ||
        /[^a-zA-Z0-9]/.test(formData.newPassword),
    },
  ];

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="password" />
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <LockIcon sx={{ color: "primary.main" }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Đổi mật khẩu
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho
                  người khác.
                </Typography>
              </Box>

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit}>
                {/* Current Password */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
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
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword("current")}
                            edge="end"
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
                  />
                </Box>

                {/* New Password */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
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
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword("new")}
                            edge="end"
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
                  />

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Độ mạnh mật khẩu
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: `${passwordStrength.color}.main`,
                          }}
                        >
                          {passwordStrength.label}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength.strength}
                        color={passwordStrength.color}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {/* Password Requirements */}
                  {formData.newPassword && (
                    <Box sx={{ mt: 2 }}>
                      {passwordRequirements.map((req, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          {req.met ? (
                            <CheckCircleIcon
                              sx={{ fontSize: 16, color: "success.main" }}
                            />
                          ) : (
                            <CancelIcon
                              sx={{ fontSize: 16, color: "text.disabled" }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: req.met
                                ? "success.main"
                                : "text.secondary",
                            }}
                          >
                            {req.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Confirm Password */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
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
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword("confirm")}
                            edge="end"
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
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    px: 4,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ChangePasswordPage;
