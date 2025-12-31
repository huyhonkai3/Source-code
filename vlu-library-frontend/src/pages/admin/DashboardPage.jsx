import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Skeleton,
  alpha,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PersonAdd as PersonAddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CloudDone as CloudDoneIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  MenuBook as MenuBookIcon,
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
 * DashboardPage Component - VLU Design System v2.0.1
 * Modern & Bold Admin Dashboard - Tổng quan hệ thống
 * UPDATED: Thêm Top 10 Download & Top 10 View
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
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Tab state cho Top Documents
  const [topDocsTab, setTopDocsTab] = useState(0); // 0: Top Views, 1: Top Downloads

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await dashboardAPI.getStats();
      if (statsResponse.status === "success") {
        setStats(statsResponse.data);
      }
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showSnackbar("Đã cập nhật dữ liệu", "success");
  };

  const calculateStorageUsage = () => {
    const totalDocuments = stats.overview.totalDocuments || 0;
    const estimatedSizeMB = totalDocuments * 5;
    const maxStorageGB = 1000;
    const maxStorageMB = maxStorageGB * 1024;
    const percentage = Math.min((estimatedSizeMB / maxStorageMB) * 100, 100);
    return {
      used: estimatedSizeMB,
      total: maxStorageMB,
      percentage: Math.round(percentage),
    };
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleAddCategory = () => {
    navigate("/admin/categories");
  };

  const handleReviewDocuments = () => {
    navigate("/admin/moderation");
  };

  const formatFileSize = (mb) => {
    if (mb < 1024) return mb + " MB";
    return (mb / 1024).toFixed(1) + " GB";
  };

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

  /**
   * Truncate text với ellipsis
   */
  const truncateText = (text, maxLength = 40) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const storage = calculateStorageUsage();

  const overviewCards = [
    {
      title: "Tổng thành viên",
      value: stats.overview.activeUsers?.toLocaleString() || "0",
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: "primary",
      trend: { value: "+5%", direction: "up" },
    },
    {
      title: "Tổng tài liệu",
      value: stats.overview.totalDocuments?.toLocaleString() || "0",
      icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
      color: "info",
      trend: null,
    },
    {
      title: "Tài liệu chờ duyệt",
      value: stats.overview.pendingDocuments || "0",
      icon: <HourglassEmptyIcon sx={{ fontSize: 28 }} />,
      color: "warning",
      trend: null,
    },
    {
      title: "Yêu cầu nâng cấp",
      value: upgradeRequests.pending || "0",
      icon: <PersonAddIcon sx={{ fontSize: 28 }} />,
      color: "error",
      trend: null,
    },
  ];

  const quickActions = [
    {
      title: "Thêm Danh mục mới",
      subtitle: "Tạo chuyên mục tài liệu",
      icon: <CreateNewFolderIcon />,
      color: "primary",
      onClick: handleAddCategory,
    },
    {
      title: "Duyệt tài liệu",
      subtitle: "Xử lý các tài liệu chờ",
      icon: <AssignmentIcon />,
      color: "warning",
      badge: stats.overview.pendingDocuments || 0,
      onClick: handleReviewDocuments,
    },
  ];

  const getStorageColor = () => {
    if (storage.percentage > 80) return "#D32F2F";
    if (storage.percentage > 60) return "#FF9800";
    return "#4CAF50";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header />
      <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <AdminSidebar
              active="dashboard"
              pendingCount={stats.overview.pendingDocuments}
              upgradeCount={upgradeRequests.pending}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            {loading ? (
              <Box>
                <Skeleton
                  variant="rounded"
                  height={160}
                  sx={{ borderRadius: "24px", mb: 3 }}
                />
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <Grid item xs={12} sm={6} md={3} key={n}>
                      <Skeleton
                        variant="rounded"
                        height={140}
                        sx={{ borderRadius: "16px" }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Box>
                {/* Hero Banner */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: "24px",
                    background:
                      "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 50%, #FF8E53 100%)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "50%",
                      height: "100%",
                      background:
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                      opacity: 0.5,
                    }}
                  />
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <DashboardIcon sx={{ fontSize: 18 }} /> Admin / Tổng quan
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "white",
                            fontFamily:
                              "'Plus Jakarta Sans', 'Inter', sans-serif",
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            fontSize: {
                              xs: "1.75rem",
                              sm: "2rem",
                              md: "2.25rem",
                            },
                          }}
                        >
                          Tổng quan hệ thống
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            mt: 1,
                            fontSize: "1rem",
                          }}
                        >
                          Chào mừng trở lại! Đây là tổng quan hệ thống
                          VLU-Library.
                        </Typography>
                      </Box>
                      <Tooltip title="Làm mới dữ liệu" arrow>
                        <IconButton
                          onClick={handleRefresh}
                          disabled={refreshing}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(10px)",
                            color: "white",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                            "& .MuiSvgIcon-root": {
                              animation: refreshing
                                ? "spin 1s linear infinite"
                                : "none",
                            },
                            "@keyframes spin": {
                              "0%": { transform: "rotate(0deg)" },
                              "100%": { transform: "rotate(360deg)" },
                            },
                          }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>

                {/* Overview Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {overviewCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Box
                        sx={{
                          animation: "fadeInUp 0.4s ease forwards",
                          animationDelay: index * 0.1 + "s",
                          opacity: 0,
                          "@keyframes fadeInUp": {
                            from: { opacity: 0, transform: "translateY(20px)" },
                            to: { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        <StatCard
                          title={card.title}
                          value={card.value}
                          icon={card.icon}
                          color={card.color}
                          trend={card.trend}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Main Content Grid */}
                <Grid container spacing={3}>
                  {/* Left Column */}
                  <Grid item xs={12} md={7}>
                    {/* Quick Actions */}
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: alpha("#7C4DFF", 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <SpeedIcon sx={{ fontSize: 20, color: "#7C4DFF" }} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#1A1A2E",
                            fontSize: "1.125rem",
                          }}
                        >
                          Thao tác nhanh
                        </Typography>
                      </Box>
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

                    {/* Upgrade Requests */}
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "10px",
                                bgcolor: alpha("#D32F2F", 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <PersonAddIcon
                                sx={{ fontSize: 20, color: "#D32F2F" }}
                              />
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: "#1A1A2E",
                                fontSize: "1.125rem",
                              }}
                            >
                              Yêu cầu nâng cấp gần đây
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#D32F2F",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.9375rem",
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
                            borderRadius: "16px",
                            overflow: "hidden",
                            bgcolor: "white",
                            boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                            border: "1px solid #F0F0F5",
                          }}
                        >
                          {upgradeRequests.recent.map((request, index) => (
                            <Box
                              key={request.id}
                              sx={{
                                p: 2.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                borderBottom:
                                  index < upgradeRequests.recent.length - 1
                                    ? "1px solid #F0F0F5"
                                    : "none",
                                transition: "background 0.2s ease",
                                "&:hover": { bgcolor: "#FAFAFC" },
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "#D32F2F",
                                  width: 44,
                                  height: 44,
                                  fontWeight: 600,
                                  fontSize: "1.125rem",
                                }}
                              >
                                {request.userName.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#1A1A2E",
                                    fontSize: "0.9375rem",
                                  }}
                                >
                                  {request.userName}
                                </Typography>
                                <Typography
                                  sx={{
                                    color: "#8E8EA9",
                                    fontSize: "0.8125rem",
                                  }}
                                >
                                  {request.email}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "#8E8EA9",
                                    mb: 0.5,
                                  }}
                                >
                                  <ScheduleIcon sx={{ fontSize: 14 }} />
                                  <Typography sx={{ fontSize: "0.8125rem" }}>
                                    {formatRelativeTime(request.requestedAt)}
                                  </Typography>
                                </Box>
                                <Chip
                                  label="Xem xét"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha("#D32F2F", 0.1),
                                    color: "#D32F2F",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    height: 24,
                                  }}
                                />
                              </Box>
                            </Box>
                          ))}
                        </Paper>
                      </Box>
                    )}

                    {/* ========== TOP DOCUMENTS SECTION ========== */}
                    {(stats.topViewed?.length > 0 ||
                      stats.topDownloaded?.length > 0) && (
                      <Box sx={{ mt: 4 }}>
                        {/* Section Header with Tabs */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                            flexWrap: "wrap",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "10px",
                                bgcolor: alpha("#FF9800", 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <TrendingUpIcon
                                sx={{ fontSize: 20, color: "#FF9800" }}
                              />
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: "#1A1A2E",
                                fontSize: "1.125rem",
                              }}
                            >
                              Tài liệu nổi bật
                            </Typography>
                          </Box>

                          {/* Tab Switcher */}
                          <Box
                            sx={{
                              display: "flex",
                              bgcolor: "#F0F0F5",
                              borderRadius: "10px",
                              p: 0.5,
                            }}
                          >
                            <Box
                              onClick={() => setTopDocsTab(0)}
                              sx={{
                                px: 2,
                                py: 1,
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor:
                                  topDocsTab === 0 ? "white" : "transparent",
                                boxShadow:
                                  topDocsTab === 0
                                    ? "0 2px 8px rgba(0,0,0,0.08)"
                                    : "none",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <VisibilityIcon
                                sx={{
                                  fontSize: 16,
                                  color:
                                    topDocsTab === 0 ? "#2196F3" : "#8E8EA9",
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "0.8125rem",
                                  fontWeight: topDocsTab === 0 ? 600 : 400,
                                  color:
                                    topDocsTab === 0 ? "#2196F3" : "#8E8EA9",
                                }}
                              >
                                Top Views
                              </Typography>
                            </Box>
                            <Box
                              onClick={() => setTopDocsTab(1)}
                              sx={{
                                px: 2,
                                py: 1,
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor:
                                  topDocsTab === 1 ? "white" : "transparent",
                                boxShadow:
                                  topDocsTab === 1
                                    ? "0 2px 8px rgba(0,0,0,0.08)"
                                    : "none",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <DownloadIcon
                                sx={{
                                  fontSize: 16,
                                  color:
                                    topDocsTab === 1 ? "#4CAF50" : "#8E8EA9",
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "0.8125rem",
                                  fontWeight: topDocsTab === 1 ? 600 : 400,
                                  color:
                                    topDocsTab === 1 ? "#4CAF50" : "#8E8EA9",
                                }}
                              >
                                Top Downloads
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Document List */}
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: "16px",
                            overflow: "hidden",
                            bgcolor: "white",
                            boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                            border: "1px solid #F0F0F5",
                          }}
                        >
                          {(topDocsTab === 0
                            ? stats.topViewed
                            : stats.topDownloaded
                          )
                            ?.slice(0, 10)
                            .map((doc, index) => (
                              <Box
                                key={doc.id}
                                onClick={() => navigate(`/documents/${doc.id}`)}
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  borderBottom:
                                    index < 9 ? "1px solid #F0F0F5" : "none",
                                  cursor: "pointer",
                                  transition: "background 0.2s ease",
                                  "&:hover": { bgcolor: "#FAFAFC" },
                                }}
                              >
                                {/* Rank Badge */}
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "8px",
                                    bgcolor:
                                      index < 3
                                        ? index === 0
                                          ? alpha("#FFD700", 0.15)
                                          : index === 1
                                            ? alpha("#C0C0C0", 0.2)
                                            : alpha("#CD7F32", 0.15)
                                        : "#F0F0F5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.875rem",
                                      color:
                                        index < 3
                                          ? index === 0
                                            ? "#B8860B"
                                            : index === 1
                                              ? "#696969"
                                              : "#8B4513"
                                          : "#8E8EA9",
                                    }}
                                  >
                                    {index + 1}
                                  </Typography>
                                </Box>

                                {/* Document Icon */}
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "10px",
                                    bgcolor: alpha(
                                      topDocsTab === 0 ? "#2196F3" : "#4CAF50",
                                      0.1,
                                    ),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <MenuBookIcon
                                    sx={{
                                      fontSize: 20,
                                      color:
                                        topDocsTab === 0
                                          ? "#2196F3"
                                          : "#4CAF50",
                                    }}
                                  />
                                </Box>

                                {/* Document Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      color: "#1A1A2E",
                                      fontSize: "0.9375rem",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {truncateText(doc.title, 50)}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        color: "#8E8EA9",
                                        fontSize: "0.8125rem",
                                      }}
                                    >
                                      {doc.category || "Chưa phân loại"}
                                    </Typography>
                                    {doc.author && (
                                      <>
                                        <Box
                                          sx={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: "50%",
                                            bgcolor: "#D0D0D0",
                                          }}
                                        />
                                        <Typography
                                          sx={{
                                            color: "#8E8EA9",
                                            fontSize: "0.8125rem",
                                          }}
                                        >
                                          {truncateText(doc.author, 20)}
                                        </Typography>
                                      </>
                                    )}
                                  </Box>
                                </Box>

                                {/* Stats Badge */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: "8px",
                                    bgcolor: alpha(
                                      topDocsTab === 0 ? "#2196F3" : "#4CAF50",
                                      0.1,
                                    ),
                                  }}
                                >
                                  {topDocsTab === 0 ? (
                                    <VisibilityIcon
                                      sx={{ fontSize: 16, color: "#2196F3" }}
                                    />
                                  ) : (
                                    <DownloadIcon
                                      sx={{ fontSize: 16, color: "#4CAF50" }}
                                    />
                                  )}
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.875rem",
                                      color:
                                        topDocsTab === 0
                                          ? "#2196F3"
                                          : "#4CAF50",
                                    }}
                                  >
                                    {(topDocsTab === 0
                                      ? doc.views
                                      : doc.downloads
                                    )?.toLocaleString() || 0}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}

                          {/* Empty State */}
                          {(topDocsTab === 0
                            ? stats.topViewed
                            : stats.topDownloaded
                          )?.length === 0 && (
                            <Box
                              sx={{
                                p: 4,
                                textAlign: "center",
                                color: "#8E8EA9",
                              }}
                            >
                              <Typography>Chưa có dữ liệu</Typography>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    )}
                    {/* ========== END TOP DOCUMENTS SECTION ========== */}
                  </Grid>

                  {/* Right Column - System Status */}
                  <Grid item xs={12} md={5}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "16px",
                        bgcolor: "white",
                        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                        border: "1px solid #F0F0F5",
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: alpha("#4CAF50", 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CloudDoneIcon
                            sx={{ fontSize: 20, color: "#4CAF50" }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#1A1A2E",
                            fontSize: "1.125rem",
                          }}
                        >
                          Trạng thái hệ thống
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          bgcolor: alpha("#4CAF50", 0.08),
                          mb: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "#4A4A68", fontSize: "0.9375rem" }}
                        >
                          Server status
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: "#4CAF50",
                              boxShadow: "0 0 8px rgba(76,175,80,0.5)",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "#4CAF50",
                              fontSize: "0.9375rem",
                            }}
                          >
                            Online
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <StorageIcon
                              sx={{ fontSize: 18, color: "#8E8EA9" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#4A4A68", fontSize: "0.9375rem" }}
                            >
                              Storage Usage
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: getStorageColor(),
                              fontSize: "0.9375rem",
                            }}
                          >
                            {storage.percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={storage.percentage}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "#F0F0F5",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 5,
                              bgcolor: getStorageColor(),
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            color: "#8E8EA9",
                            mt: 1,
                            display: "block",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {formatFileSize(storage.used)} /{" "}
                          {formatFileSize(storage.total)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          bgcolor: "#FAFAFC",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "#4A4A68", fontSize: "0.9375rem" }}
                        >
                          Database
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: "#4CAF50",
                            fontSize: "0.9375rem",
                          }}
                        >
                          Stable
                        </Typography>
                      </Box>
                    </Paper>

                    {/* Admin Notification */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "16px",
                        bgcolor: alpha("#D32F2F", 0.04),
                        border: "1px solid",
                        borderColor: alpha("#D32F2F", 0.2),
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            bgcolor: alpha("#D32F2F", 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <NotificationsIcon sx={{ color: "#D32F2F" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: "#1A1A2E",
                              mb: 0.5,
                              fontSize: "0.9375rem",
                            }}
                          >
                            Thông báo Admin
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#4A4A68", fontSize: "0.875rem" }}
                          >
                            Hệ thống sẽ bảo trì định kỳ vào{" "}
                            <Box
                              component="span"
                              sx={{ fontWeight: 700, color: "#D32F2F" }}
                            >
                              02:00 AM ngày 25/12/2025
                            </Box>
                            . Vui lòng thông báo cho người dùng nếu cần thiết.
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            fontSize: "0.9375rem",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
