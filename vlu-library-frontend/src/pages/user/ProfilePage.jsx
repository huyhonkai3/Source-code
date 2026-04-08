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
  alpha,
  Skeleton,
  LinearProgress,
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
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as PendingIcon,
  Cancel as CancelIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import RequestAuthorDialog from "../../components/user/RequestAuthorDialog";
import userAPI from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";

// Base URL của Backend API
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Server URL (không có /api) - dùng cho static files như avatar
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

/**
 * Helper function để tạo full URL cho avatar
 */
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "";

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  const baseUrl = SERVER_URL.endsWith("/")
    ? SERVER_URL.slice(0, -1)
    : SERVER_URL;
  const path = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;

  return `${baseUrl}${path}`;
};

/**
 * ProfilePage Component - VLU Design System v2.0
 * Modern & Bold profile page với glass morphism effects
 */
const ProfilePage = () => {
  const { user: authUser, updateUserAvatar } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
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
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // Role configuration với Design System v2.0 colors
  const getRoleConfig = (role) => {
    const configs = {
      Admin: {
        label: "Quản trị viên",
        color: "#D32F2F",
        bgColor: "#FFEBEE",
        icon: VerifiedIcon,
      },
      Moderator: {
        label: "Kiểm duyệt viên",
        color: "#7C4DFF",
        bgColor: "#EDE7F6",
        icon: VerifiedIcon,
      },
      Author: {
        label: "Tác giả",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
        icon: EditIcon,
      },
      User: {
        label: "Thành viên",
        color: "#2196F3",
        bgColor: "#E3F2FD",
        icon: PersonIcon,
      },
      Guest: {
        label: "Khách",
        color: "#8E8EA9",
        bgColor: "#F0F0F5",
        icon: PersonIcon,
      },
    };
    return configs[role] || configs.User;
  };

  // Departments options
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
    setHasChanges(true);
  };

  /**
   * Handle avatar file selection and upload
   */
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = "";

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      showSnackbar(
        "Định dạng file không hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF hoặc WEBP.",
        "error",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showSnackbar(
        "Kích thước file quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.",
        "error",
      );
      return;
    }

    setUploadingAvatar(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("avatar", file);

      const response = await userAPI.uploadAvatar(formDataToSend);

      if (response.status === "success" && response.data?.avatarUrl) {
        const newAvatarUrl = response.data.avatarUrl;

        setFormData((prev) => ({
          ...prev,
          avatar: newAvatarUrl,
        }));

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

      await fetchRequestStatus();
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
   */
  const renderAuthorBanner = () => {
    if (authUser?.role !== "User") {
      return null;
    }

    // CASE 1: Đang chờ duyệt
    if (requestStatus?.status === "pending") {
      return (
        <Box
          sx={{
            mb: 4,
            p: 3,
            background: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
            borderRadius: "16px",
            border: "1px solid #FFE082",
            display: "flex",
            alignItems: "center",
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              bgcolor: "#FFC107",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PendingIcon sx={{ fontSize: 28, color: "white" }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#1A1A2E", mb: 0.5 }}
            >
              Yêu cầu đang chờ xét duyệt
            </Typography>
            <Typography variant="body2" sx={{ color: "#4A4A68" }}>
              Yêu cầu trở thành Người đăng tài liệu của bạn đang được Admin xem
              xét. Vui lòng đợi từ 24-48 giờ.
            </Typography>
          </Box>

          <Chip
            icon={<PendingIcon sx={{ fontSize: 16 }} />}
            label="Đang chờ"
            sx={{
              bgcolor: "#FFC107",
              color: "white",
              fontWeight: 600,
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        </Box>
      );
    }

    // CASE 2: Đã bị từ chối
    if (requestStatus?.status === "rejected") {
      return (
        <Box
          sx={{
            mb: 4,
            p: 3,
            background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            borderRadius: "16px",
            border: "1px solid #EF9A9A",
            display: "flex",
            alignItems: "center",
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              bgcolor: "#EF5350",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CancelIcon sx={{ fontSize: 28, color: "white" }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#1A1A2E", mb: 0.5 }}
            >
              Yêu cầu đã bị từ chối
            </Typography>
            <Typography variant="body2" sx={{ color: "#4A4A68" }}>
              {requestStatus?.rejectionReason ||
                "Yêu cầu của bạn không được duyệt. Bạn có thể gửi lại yêu cầu mới."}
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => setUpgradeDialogOpen(true)}
            sx={{
              bgcolor: "#D32F2F",
              color: "white",
              borderRadius: "12px",
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
              "&:hover": {
                bgcolor: "#B71C1C",
              },
            }}
          >
            Gửi lại yêu cầu
          </Button>
        </Box>
      );
    }

    // CASE 3: Chưa gửi yêu cầu
    return (
      <Box
        sx={{
          mb: 4,
          p: 3,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          borderRadius: "16px",
          border: "1px solid #90CAF9",
          display: "flex",
          alignItems: "center",
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "14px",
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(33,150,243,0.3)",
          }}
        >
          <TrophyIcon sx={{ fontSize: 28, color: "white" }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#1A1A2E", mb: 0.5 }}
          >
            Trở thành Người đăng tài liệu ngay hôm nay!
          </Typography>
          <Typography variant="body2" sx={{ color: "#4A4A68" }}>
            Đăng ký để có thể chia sẻ tài liệu với cộng đồng VLU. Yêu cầu sẽ
            được Admin xét duyệt trong vòng 24-48 giờ.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setUpgradeDialogOpen(true)}
          sx={{
            bgcolor: "#2196F3",
            color: "white",
            borderRadius: "12px",
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(33,150,243,0.3)",
            "&:hover": {
              bgcolor: "#1976D2",
            },
          }}
        >
          Đăng ký ngay
        </Button>
      </Box>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
        <Header />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Skeleton
                variant="rounded"
                height={400}
                sx={{ borderRadius: "20px" }}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Skeleton
                variant="rounded"
                height={600}
                sx={{ borderRadius: "20px" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  const roleConfig = getRoleConfig(authUser?.role);
  const RoleIcon = roleConfig.icon;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header />

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Grid container spacing={3}>
          {/* ========== LEFT SIDEBAR ========== */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="profile" />
          </Grid>

          {/* ========== RIGHT CONTENT ========== */}
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
              {/* ========== PROFILE HEADER ========== */}
              <Box
                sx={{
                  position: "relative",
                  p: { xs: 3, md: 4 },
                  pb: { xs: 4, md: 5 },
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 50%, #FFC107 100%)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 3,
                  }}
                >
                  {/* Avatar with Upload */}
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <IconButton
                        component="label"
                        disabled={uploadingAvatar}
                        sx={{
                          bgcolor: "white",
                          color: "#D32F2F",
                          width: 40,
                          height: 40,
                          border: "3px solid white",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                          "&:hover": {
                            bgcolor: "#FFF5F5",
                          },
                          "&.Mui-disabled": {
                            bgcolor: "rgba(255,255,255,0.7)",
                            color: "#8E8EA9",
                          },
                        }}
                      >
                        {uploadingAvatar ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <CameraAltIcon sx={{ fontSize: 20 }} />
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleAvatarChange}
                        />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={getFullAvatarUrl(formData.avatar)}
                      alt={formData.name}
                      sx={{
                        width: 120,
                        height: 120,
                        border: "4px solid white",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        bgcolor: "#1A1A2E",
                        opacity: uploadingAvatar ? 0.7 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {formData.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>

                  {/* User Info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        mb: 0.5,
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}
                    >
                      {formData.name || "Chưa cập nhật"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        mb: 2,
                      }}
                    >
                      {formData.email}
                    </Typography>

                    {/* Role Badge */}
                    <Chip
                      icon={<RoleIcon sx={{ fontSize: 18 }} />}
                      label={roleConfig.label}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.95)",
                        color: roleConfig.color,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        height: 32,
                        "& .MuiChip-icon": {
                          color: roleConfig.color,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* ========== FORM CONTENT ========== */}
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                {/* Author Upgrade Banner */}
                {renderAuthorBanner()}

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  {/* Section Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1A1A2E",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <PersonIcon sx={{ color: "#D32F2F" }} />
                    Thông tin cá nhân
                  </Typography>

                  {/* Form Fields */}
                  <Grid container spacing={3}>
                    {/* Họ và tên */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ và tên"
                        value={formData.name}
                        onChange={handleChange("name")}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: "#8E8EA9" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
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
                        }}
                      />
                    </Grid>

                    {/* Email (Readonly) */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email đăng nhập"
                        value={formData.email}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: "#8E8EA9" }} />
                            </InputAdornment>
                          ),
                        }}
                        helperText="Email trường cấp không thể thay đổi."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "#F0F0F5",
                          },
                        }}
                      />
                    </Grid>

                    {/* Số điện thoại */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        value={formData.phoneNumber}
                        onChange={handleChange("phoneNumber")}
                        placeholder="0123456789"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon sx={{ color: "#8E8EA9" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
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
                        }}
                      />
                    </Grid>

                    {/* Khoa/Ngành */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Khoa / Ngành"
                        value={formData.address}
                        onChange={handleChange("address")}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SchoolIcon sx={{ color: "#8E8EA9" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
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

                  {/* ========== ACTION BUTTONS ========== */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      mt: 5,
                      pt: 3,
                      borderTop: "1px solid #F0F0F5",
                    }}
                  >
                    {hasChanges && (
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        sx={{
                          borderColor: "#E0E0E0",
                          color: "#4A4A68",
                          borderRadius: "12px",
                          px: 3,
                          py: 1.25,
                          fontWeight: 600,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#C4C4D4",
                            bgcolor: "#FAFAFC",
                          },
                        }}
                      >
                        Hủy bỏ
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!hasChanges || saving}
                      startIcon={
                        saving ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      sx={{
                        bgcolor: "#D32F2F",
                        color: "white",
                        borderRadius: "12px",
                        px: 4,
                        py: 1.25,
                        fontWeight: 600,
                        textTransform: "none",
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
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </Box>
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
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
