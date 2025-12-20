import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  LinearProgress,
  Alert,
  CircularProgress,
  Snackbar,
  Avatar,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PersonAdd as PersonAddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StatCard from "../../components/admin/StatCard";
import ActionCard from "../../components/admin/ActionCard";
import dashboardAPI from "../../api/dashboard.api";

/**
 * DashboardPage Component
 * Admin Dashboard - Tổng quan hệ thống
 */
const DashboardPage = () => {
  const navigate = useNavigate();

  // Data state
  const [stats, setStats] = useState({
    overview: {
      activeUsers: 0,
      totalDocuments: 0,
      pendingDocuments: 0,
      approvedThisMonth: 0,
    },
    topViewed: [],
    topDownloaded: [],
    categoryDistribution: [],
  });

  const [upgradeRequests, setUpgradeRequests] = useState({
    pending: 0,
    recent: [],
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Fetch dashboard data on mount
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch all dashboard data
   */
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats from backend
      const statsResponse = await dashboardAPI.getStats();

      if (statsResponse.status === "success") {
        setStats(statsResponse.data);
      }

      // Fetch upgrade requests
      const upgradeResponse = await dashboardAPI.getUpgradeRequests();
      if (upgradeResponse.status === "success") {
        setUpgradeRequests(upgradeResponse.data);
      }
    } catch (error) {
      console.error("Fetch dashboard data error:", error);
      showSnackbar("Không thể tải dữ liệu dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate storage usage (mock calculation)
   * Assume each document is ~5MB average
   */
  const calculateStorageUsage = () => {
    const totalDocuments = stats.overview.totalDocuments || 0;
    const estimatedSizeMB = totalDocuments * 5; // 5MB per document
    const maxStorageGB = 1000; // 1TB
    const maxStorageMB = maxStorageGB * 1024;
    const percentage = Math.min((estimatedSizeMB / maxStorageMB) * 100, 100);

    return {
      used: estimatedSizeMB,
      total: maxStorageMB,
      percentage: Math.round(percentage),
    };
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
   * Handle action card clicks
   */
  const handleAddCategory = () => {
    console.log("Add category clicked");
    // TODO: Open modal for adding category
    showSnackbar("Chức năng thêm danh mục đang được phát triển", "info");
  };

  const handleReviewDocuments = () => {
    navigate("/admin/moderation");
  };

  /**
   * Format file size
   */
  const formatFileSize = (mb) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  /**
   * Format relative time
   */
  const formatRelativeTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "N/A";
    }
  };

  // Calculate storage
  const storage = calculateStorageUsage();

  // Overview cards data
  const overviewCards = [
    {
      title: "Tổng thành viên",
      value: stats.overview.activeUsers?.toLocaleString() || "0",
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: "primary",
      trend: { value: "+5%", direction: "up" },
    },
    {
      title: "Tổng tài liệu",
      value: stats.overview.totalDocuments?.toLocaleString() || "0",
      icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
      color: "info",
      trend: null,
    },
    {
      title: "Tài liệu chờ duyệt",
      value: stats.overview.pendingDocuments || "0",
      icon: <HourglassEmptyIcon sx={{ fontSize: 32 }} />,
      color: "warning",
      trend: null,
    },
    {
      title: "Yêu cầu nâng cấp Author",
      value: upgradeRequests.pending || "0",
      icon: <PersonAddIcon sx={{ fontSize: 32 }} />,
      color: "error",
      trend: null,
    },
  ];

  // Quick actions data
  const quickActions = [
    {
      title: "Thêm Danh mục mới",
      subtitle: "Tạo chuyên mục tài liệu",
      icon: <CreateNewFolderIcon />,
      color: "primary",
      onClick: handleAddCategory,
    },
    {
      title: `Duyệt tài liệu (${stats.overview.pendingDocuments || 0})`,
      subtitle: "Xử lý các tài liệu chờ",
      icon: <AssignmentIcon />,
      color: "warning",
      badge: stats.overview.pendingDocuments || 0,
      onClick: handleReviewDocuments,
    },
  ];

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <AdminSidebar
              active="dashboard"
              pendingCount={stats.overview.pendingDocuments}
            />
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 400,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {/* Page Title */}
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Tổng quan hệ thống
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dashboard / Tổng quan
                  </Typography>
                </Box>

                {/* Overview Stats Cards */}
                <Grid container spacing={3}>
                  {overviewCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <StatCard
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        color={card.color}
                        trend={card.trend}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Content Grid - Quick Actions & System Status */}
                <Grid container spacing={3}>
                  {/* Left Column - Quick Actions */}
                  <Grid item xs={12} md={7}>
                    {/* Quick Actions Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Thao tác nhanh
                      </Typography>
                      <Grid container spacing={2}>
                        {quickActions.map((action, index) => (
                          <Grid item xs={12} key={index}>
                            <ActionCard
                              title={action.title}
                              subtitle={action.subtitle}
                              icon={action.icon}
                              color={action.color}
                              badge={action.badge}
                              onClick={action.onClick}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Recent Upgrade Requests */}
                    {upgradeRequests.recent.length > 0 && (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            Yêu cầu nâng cấp gần đây
                          </Typography>
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{
                              cursor: "pointer",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={() => navigate("/admin/upgrade-requests")}
                          >
                            Xem tất cả
                          </Typography>
                        </Box>

                        <Paper
                          elevation={0}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          {upgradeRequests.recent.map((request, index) => (
                            <Box
                              key={request.id}
                              sx={{
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                borderBottom:
                                  index < upgradeRequests.recent.length - 1
                                    ? "1px solid"
                                    : "none",
                                borderColor: "divider",
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                },
                              }}
                            >
                              <Avatar sx={{ bgcolor: "primary.main" }}>
                                {request.userName.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {request.userName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {request.email}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatRelativeTime(request.requestedAt)}
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  <Chip
                                    label="Xem xét"
                                    size="small"
                                    color="error"
                                    sx={{ fontSize: "0.75rem", height: 20 }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Paper>
                      </Box>
                    )}
                  </Grid>

                  {/* Right Column - System Status */}
                  <Grid item xs={12} md={5}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        mb: 3,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Trạng thái hệ thống
                      </Typography>

                      {/* Server Status */}
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Server status
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "success.main",
                              }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="success.main"
                            >
                              Online
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Storage Usage */}
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Storage Usage
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {storage.percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={storage.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            backgroundColor: "action.hover",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 1,
                              backgroundColor:
                                storage.percentage > 80
                                  ? "error.main"
                                  : storage.percentage > 60
                                    ? "warning.main"
                                    : "primary.main",
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {formatFileSize(storage.used)} /{" "}
                          {formatFileSize(storage.total)}
                        </Typography>
                      </Box>

                      {/* Database */}
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Database
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="success.main"
                          >
                            Stable
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Admin Notification */}
                    <Alert
                      severity="error"
                      icon={<NotificationsIcon />}
                      sx={{
                        "& .MuiAlert-icon": {
                          color: "error.main",
                        },
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          gutterBottom
                        >
                          Thông báo Admin
                        </Typography>
                        <Typography variant="body2">
                          Hệ thống sẽ bảo trì định kỳ vào{" "}
                          <strong>02:00 AM ngày 25/12/2025</strong>. Vui lòng
                          thông báo cho người dùng nếu cần thiết.
                        </Typography>
                      </Box>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DashboardPage;
