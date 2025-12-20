import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  PhotoCamera as PhotoCameraIcon,
  EmojiEvents as TrophyIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import RequestAuthorDialog from "../../components/user/RequestAuthorDialog";
import userAPI from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";

/**
 * ProfilePage Component
 * Trang quản lý thông tin cá nhân của user
 */
const ProfilePage = () => {
  const { user: authUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "", // Map với Khoa/Ngành
    avatar: "",
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Author upgrade state
  const [requestStatus, setRequestStatus] = useState(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Role badge configuration
  const getRoleBadge = (role) => {
    const badges = {
      Admin: { label: "Quản trị viên", color: "error" },
      Moderator: { label: "Kiểm duyệt viên", color: "warning" },
      Author: { label: "Tác giả", color: "success" },
      User: { label: "Thành viên", color: "primary" },
      Guest: { label: "Khách", color: "default" },
    };
    return badges[role] || badges.User;
  };

  // Departments/Faculties options
  const departments = [
    "Công nghệ thông tin",
    "Kinh tế",
    "Kế toán",
    "Marketing",
    "Quản trị kinh doanh",
    "Luật",
    "Ngoại ngữ",
    "Kỹ thuật",
    "Kiến trúc",
    "Mỹ thuật",
  ];

  /**
   * Fetch user profile on component mount
   */
  useEffect(() => {
    fetchProfile();
    fetchRequestStatus();
  }, []);

  /**
   * Fetch profile data from API
   */
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;

      const data = {
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        avatar: userData.avatarUrl || "",
      };

      setFormData(data);
      setOriginalData(data);
    } catch (error) {
      console.error("Fetch profile error:", error);
      showSnackbar("Không thể tải thông tin cá nhân", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch upgrade request status
   */
  const fetchRequestStatus = async () => {
    try {
      const response = await userAPI.getRequestStatus();
      setRequestStatus(response.data);
    } catch (error) {
      console.error("Fetch request status error:", error);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check if data has changed
    setHasChanges(true);
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userAPI.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      showSnackbar("Cập nhật thông tin thành công!");
      setOriginalData(formData);
      setHasChanges(false);

      // Refresh profile
      await fetchProfile();
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage =
        error.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      showSnackbar(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle cancel - reset form
   */
  const handleCancel = () => {
    setFormData(originalData);
    setHasChanges(false);
  };

  /**
   * Handle submit upgrade request
   */
  const handleSubmitUpgradeRequest = async (data) => {
    setUpgradeLoading(true);
    try {
      await userAPI.requestUpgrade(data);

      showSnackbar(
        "Gửi yêu cầu thành công! Admin sẽ xem xét trong vòng 24-48 giờ.",
      );

      // Refresh status
      await fetchRequestStatus();

      // Close dialog
      setUpgradeDialogOpen(false);
    } catch (error) {
      console.error("Submit upgrade request error:", error);
      showSnackbar(
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        "error",
      );
    } finally {
      setUpgradeLoading(false);
    }
  };

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  /**
   * Render Author Upgrade Banner
   * Chỉ hiển thị cho User role (chưa phải Author)
   */
  const renderAuthorBanner = () => {
    // Chỉ hiển thị banner nếu role = 'User'
    if (authUser?.role !== "User") {
      return null;
    }

    // CASE 1: Đang chờ duyệt - User đã gửi yêu cầu và status = 'pending'
    if (requestStatus?.status === "pending") {
      return (
        <Box
          sx={{
            mb: 3,
            p: 3,
            bgcolor: "warning.lighter",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "warning.light",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "warning.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrophyIcon sx={{ fontSize: 28, color: "warning.dark" }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Yêu cầu đang chờ duyệt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yêu cầu trở thành Tác giả (Author) của bạn đã được gửi và đang chờ
              Ban quản trị xét duyệt. Chúng tôi sẽ thông báo kết quả qua email
              trong vòng 24-48 giờ.
            </Typography>
          </Box>

          {/* Status Badge */}
          <Chip
            label="Đang xử lý..."
            color="warning"
            size="small"
            sx={{ fontWeight: 600, flexShrink: 0 }}
          />
        </Box>
      );
    }

    // CASE 2: Rejected - Bị từ chối (cho phép gửi lại)
    if (requestStatus?.status === "rejected") {
      return (
        <Box
          sx={{
            mb: 3,
            p: 3,
            bgcolor: "error.lighter",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "error.light",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "error.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrophyIcon sx={{ fontSize: 28, color: "error.dark" }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Yêu cầu bị từ chối
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {requestStatus.rejectionReason ||
                "Yêu cầu của bạn không đáp ứng đủ điều kiện. Vui lòng xem lại thông tin và gửi lại."}
            </Typography>
          </Box>

          {/* Action Button */}
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setUpgradeDialogOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            Gửi lại
          </Button>
        </Box>
      );
    }

    // CASE 3: Chưa gửi yêu cầu - Hiển thị banner mời đăng ký Author
    // Match design: Trang thông tin cá nhân.png
    return (
      <Box
        sx={{
          mb: 3,
          p: 3,
          bgcolor: "primary.lighter",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "primary.light",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Icon Trophy */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "primary.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TrophyIcon sx={{ fontSize: 28, color: "primary.dark" }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Trở thành tác giả (Author)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đóng góp tài liệu, chia sẻ kiến thức và xây dựng danh tiếng học
            thuật của bạn trong cộng đồng VLU.
          </Typography>
        </Box>

        {/* Action Button */}
        <Button
          variant="text"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            textTransform: "none",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
          onClick={() => setUpgradeDialogOpen(true)}
        >
          Đăng ký tác giả
        </Button>
      </Box>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  const roleBadge = getRoleBadge(authUser?.role);

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="profile" />
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                  pb: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Hồ sơ cá nhân
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý thông tin cá nhân và cài đặt quyền riêng tư.
                  </Typography>
                </Box>
                <Chip
                  label={roleBadge.label}
                  color={roleBadge.color}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              </Box>

              {/* Author Upgrade Banner */}
              {renderAuthorBanner()}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit}>
                {/* Avatar Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Ảnh đại diện
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      mt: 2,
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      src={formData.avatar}
                      alt={formData.name}
                      sx={{
                        width: 100,
                        height: 100,
                        border: "4px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      {formData.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Upload Button */}
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        size="small"
                      >
                        Tải ảnh lên
                        <input type="file" hidden accept="image/*" />
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Cho phép định dạng JPG, GIF hoặc PNG.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Kích thước tối đa 5MB.
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Personal Information */}
                <Grid container spacing={3}>
                  {/* Họ và tên */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={formData.name}
                      onChange={handleChange("name")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                      required
                    />
                  </Grid>

                  {/* Email đăng nhập (Readonly) */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email đăng nhập"
                      value={formData.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Email trường cấp không thể thay đổi."
                    />
                  </Grid>

                  {/* Số điện thoại */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={formData.phoneNumber}
                      onChange={handleChange("phoneNumber")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="0123456789"
                    />
                  </Grid>

                  {/* Khoa/Ngành */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Khoa/ Ngành"
                      value={formData.address}
                      onChange={handleChange("address")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SchoolIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">-- Chọn khoa/ngành --</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {hasChanges && (
                    <Button variant="outlined" onClick={handleCancel}>
                      Hủy bỏ
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!hasChanges || saving}
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    sx={{
                      bgcolor: "error.main",
                      "&:hover": {
                        bgcolor: "error.dark",
                      },
                    }}
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Request Author Dialog */}
      <RequestAuthorDialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        onSubmit={handleSubmitUpgradeRequest}
        loading={upgradeLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfilePage;
