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
  Badge,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  PhotoCamera as PhotoCameraIcon,
  EmojiEvents as TrophyIcon,
  Save as SaveIcon,
  CameraAlt as CameraAltIcon,
} from "@mui/icons-material";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import RequestAuthorDialog from "../../components/user/RequestAuthorDialog";
import userAPI from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";

// Base URL của Backend API
// Sử dụng process.env cho Create React App (CRA)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Server URL (không có /api) - dùng cho static files như avatar
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

/**
 * Helper function để tạo full URL cho avatar
 * @param {string} avatarPath - Relative path hoặc full URL của avatar
 * @returns {string} Full URL để hiển thị avatar
 */
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "";

  // Nếu đã là full URL (http:// hoặc https://) thì return luôn
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  // Sử dụng SERVER_URL (không có /api) cho static files
  const baseUrl = SERVER_URL.endsWith("/")
    ? SERVER_URL.slice(0, -1)
    : SERVER_URL;
  const path = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;

  return `${baseUrl}${path}`;
};

/**
 * ProfilePage Component
 * Trang quản lý thông tin cá nhân của user
 */
const ProfilePage = () => {
  const { user: authUser, updateUserAvatar } = useAuth();

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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

  // Avatar upload config
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

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
   * Handle avatar file selection and upload
   */
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset input để có thể chọn lại cùng file
    event.target.value = "";

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      showSnackbar(
        "Định dạng file không hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF hoặc WEBP.",
        "error",
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showSnackbar(
        "Kích thước file quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.",
        "error",
      );
      return;
    }

    // Start upload
    setUploadingAvatar(true);

    try {
      // Tạo FormData
      const formDataToSend = new FormData();
      formDataToSend.append("avatar", file);

      // Gọi API upload
      const response = await userAPI.uploadAvatar(formDataToSend);

      if (response.status === "success" && response.data?.avatarUrl) {
        const newAvatarUrl = response.data.avatarUrl;

        // Cập nhật local state
        setFormData((prev) => ({
          ...prev,
          avatar: newAvatarUrl,
        }));

        // Cập nhật AuthContext để Header và các component khác cũng thay đổi
        updateUserAvatar(newAvatarUrl);

        showSnackbar("Cập nhật ảnh đại diện thành công!", "success");
      }
    } catch (error) {
      console.error("Upload avatar error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể upload ảnh. Vui lòng thử lại.";
      showSnackbar(errorMessage, "error");
    } finally {
      setUploadingAvatar(false);
    }
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
              Yêu cầu đang chờ xét duyệt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yêu cầu trở thành Tác giả của bạn đang được Admin xem xét. Vui
              lòng đợi từ 24-48 giờ.
            </Typography>
          </Box>

          {/* Status Chip */}
          <Chip label="Đang chờ" color="warning" size="small" />
        </Box>
      );
    }

    // CASE 2: Đã bị từ chối - User có thể gửi lại yêu cầu
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
              Yêu cầu đã bị từ chối
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {requestStatus?.rejectionReason ||
                "Yêu cầu của bạn không được duyệt. Bạn có thể gửi lại yêu cầu mới."}
            </Typography>
          </Box>

          {/* Retry Button */}
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setUpgradeDialogOpen(true)}
          >
            Gửi lại
          </Button>
        </Box>
      );
    }

    // CASE 3: Chưa gửi yêu cầu - Hiển thị banner mời gửi
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
        {/* Icon */}
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
            Trở thành Tác giả
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đăng ký để có thể chia sẻ tài liệu với cộng đồng VLU. Yêu cầu sẽ
            được Admin xét duyệt trong vòng 24-48 giờ.
          </Typography>
        </Box>

        {/* CTA Button */}
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => setUpgradeDialogOpen(true)}
        >
          Đăng ký ngay
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
                    {/* Avatar with Upload Badge */}
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <IconButton
                          component="label"
                          disabled={uploadingAvatar}
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            width: 36,
                            height: 36,
                            border: "3px solid white",
                            boxShadow: 2,
                            "&:hover": {
                              bgcolor: "primary.dark",
                            },
                            "&.Mui-disabled": {
                              bgcolor: "grey.400",
                              color: "white",
                            },
                          }}
                        >
                          <CameraAltIcon sx={{ fontSize: 18 }} />
                          <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleAvatarChange}
                          />
                        </IconButton>
                      }
                    >
                      <Box sx={{ position: "relative" }}>
                        {/* SỬA: Sử dụng getFullAvatarUrl để build full URL */}
                        <Avatar
                          src={getFullAvatarUrl(formData.avatar)}
                          alt={formData.name}
                          sx={{
                            width: 100,
                            height: 100,
                            border: "4px solid",
                            borderColor: "primary.main",
                            opacity: uploadingAvatar ? 0.5 : 1,
                            transition: "opacity 0.3s",
                          }}
                        >
                          {formData.name?.charAt(0).toUpperCase()}
                        </Avatar>

                        {/* Loading overlay on avatar */}
                        {uploadingAvatar && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CircularProgress size={40} />
                          </Box>
                        )}
                      </Box>
                    </Badge>

                    {/* Upload Instructions */}
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        size="small"
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? "Đang tải..." : "Tải ảnh lên"}
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleAvatarChange}
                        />
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Cho phép định dạng JPG, PNG, GIF hoặc WEBP.
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
