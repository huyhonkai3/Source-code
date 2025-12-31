import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  IconButton,
  Tooltip,
  Fade,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  HourglassEmpty as PendingIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Create as AuthorIcon,
  Upgrade as UpgradeIcon,
  AssignmentInd as RequestIcon,
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ReviewRequestDialog from "../../components/admin/ReviewRequestDialog";
import userAPI from "../../api/user.api";

/**
 * UpgradeRequestsPage Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const UpgradeRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRequests, setTotalRequests] = useState(0);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchRequests();
  }, [activeTab, page, rowsPerPage]);
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const status = activeTab === 0 ? "pending" : undefined;
      const response = await userAPI.getUpgradeRequests({
        status,
        page: page + 1,
        limit: rowsPerPage,
      });
      if (response.status === "success") {
        setRequests(response.data.requests || []);
        setTotalRequests(response.data.pagination?.totalRequests || 0);
        if (activeTab === 0)
          setStats((prev) => ({
            ...prev,
            pending: response.data.pagination?.totalRequests || 0,
          }));
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
      showSnackbar("Không thể tải danh sách yêu cầu", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        userAPI.getUpgradeRequests({ status: "pending", limit: 1 }),
        userAPI.getUpgradeRequests({ status: "approved", limit: 1 }),
        userAPI.getUpgradeRequests({ status: "rejected", limit: 1 }),
      ]);
      setStats({
        pending: pendingRes.data?.pagination?.totalRequests || 0,
        approved: approvedRes.data?.pagination?.totalRequests || 0,
        rejected: rejectedRes.data?.pagination?.totalRequests || 0,
      });
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchRequests(), fetchStats()]);
    setRefreshing(false);
    showSnackbar("Đã cập nhật dữ liệu", "success");
  };

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleReview = (request) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const response = await userAPI.reviewUpgradeRequest(selectedRequest.id, {
        status: "approved",
      });
      if (response.status === "success") {
        showSnackbar(
          "Đã chấp thuận yêu cầu. Người dùng đã được nâng cấp lên Author!",
          "success",
        );
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        fetchRequests();
        fetchStats();
      }
    } catch (error) {
      console.error("Approve request error:", error);
      showSnackbar(
        error.response?.data?.message || "Không thể chấp thuận yêu cầu",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const response = await userAPI.reviewUpgradeRequest(selectedRequest.id, {
        status: "rejected",
        rejectionReason,
      });
      if (response.status === "success") {
        showSnackbar("Đã từ chối yêu cầu", "info");
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        fetchRequests();
        fetchStats();
      }
    } catch (error) {
      console.error("Reject request error:", error);
      showSnackbar(
        error.response?.data?.message || "Không thể từ chối yêu cầu",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Chờ duyệt",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: PendingIcon,
      },
      approved: {
        label: "Đã duyệt",
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: CheckCircleIcon,
      },
      rejected: {
        label: "Từ chối",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        icon: CancelIcon,
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "-";
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2)
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const StatsCard = ({ icon: Icon, label, value, color, trend }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#4A4A68",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.8125rem",
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1A1A2E",
              mt: 0.5,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: { xs: "1.75rem", sm: "2rem" },
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Typography
              sx={{ color: "#8E8EA9", mt: 0.5, fontSize: "0.8125rem" }}
            >
              {trend}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            boxShadow: `0 4px 14px ${alpha(color, 0.4)}`,
          }}
        >
          <Icon sx={{ color: "white", fontSize: 24 }} />
        </Box>
      </Box>
    </Paper>
  );

  const SkeletonRow = ({ index }) => (
    <TableRow
      sx={{
        animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
        "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
      }}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box>
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={160} height={18} />
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={200} />
      </TableCell>
      {activeTab === 1 && (
        <TableCell>
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ borderRadius: "8px" }}
          />
        </TableCell>
      )}
      <TableCell>
        <Skeleton
          variant="rounded"
          width={100}
          height={36}
          sx={{ borderRadius: "10px" }}
        />
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Header />
      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC", pt: 4, pb: 6 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <AdminSidebar active="upgrade-requests" />
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Hero Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: "24px",
                    background:
                      "linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)",
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
                      <UpgradeIcon sx={{ fontSize: 18 }} />
                      Dashboard / Yêu cầu Nâng cấp
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
                          Yêu cầu nâng cấp Author
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            mt: 1,
                            fontSize: "1rem",
                          }}
                        >
                          Xét duyệt các yêu cầu nâng cấp tài khoản lên Tác giả
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

                {/* Stats Cards */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={PendingIcon}
                      label="Chờ duyệt"
                      value={stats.pending}
                      color="#F59E0B"
                      trend={stats.pending > 0 ? "Cần xử lý" : null}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={CheckCircleIcon}
                      label="Đã duyệt"
                      value={stats.approved}
                      color="#10B981"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={CancelIcon}
                      label="Từ chối"
                      value={stats.rejected}
                      color="#EF4444"
                    />
                  </Grid>
                </Grid>

                {/* Content Card */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "#E0E0E0",
                    bgcolor: "white",
                    overflow: "hidden",
                  }}
                >
                  {/* Tabs */}
                  <Box
                    sx={{
                      px: 3,
                      pt: 2,
                      borderBottom: "1px solid",
                      borderColor: "#E0E0E0",
                    }}
                  >
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      sx={{
                        "& .MuiTabs-indicator": {
                          height: 3,
                          borderRadius: "3px 3px 0 0",
                          bgcolor: "#10B981",
                        },
                        "& .MuiTab-root": {
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "1rem",
                          minHeight: 56,
                          color: "#4A4A68",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            color: "#10B981",
                            bgcolor: alpha("#10B981", 0.04),
                          },
                          "&.Mui-selected": {
                            fontWeight: 600,
                            color: "#10B981",
                          },
                        },
                      }}
                    >
                      <Tab
                        icon={
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor:
                                activeTab === 0
                                  ? alpha("#F59E0B", 0.15)
                                  : "#F0F0F5",
                              color: activeTab === 0 ? "#F59E0B" : "#8E8EA9",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <PendingIcon sx={{ fontSize: 20 }} />
                          </Box>
                        }
                        iconPosition="start"
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <span>Chờ duyệt</span>
                            {stats.pending > 0 && (
                              <Chip
                                label={stats.pending}
                                size="small"
                                sx={{
                                  height: 22,
                                  minWidth: 22,
                                  bgcolor: "#FEF3C7",
                                  color: "#B45309",
                                  fontWeight: 700,
                                  fontSize: "0.8125rem",
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                      <Tab
                        icon={
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor:
                                activeTab === 1
                                  ? alpha("#10B981", 0.15)
                                  : "#F0F0F5",
                              color: activeTab === 1 ? "#10B981" : "#8E8EA9",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <HistoryIcon sx={{ fontSize: 20 }} />
                          </Box>
                        }
                        iconPosition="start"
                        label="Lịch sử"
                      />
                    </Tabs>
                  </Box>

                  {loading ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#FAFAFC" }}>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.8125rem",
                                color: "#8E8EA9",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Người dùng
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.8125rem",
                                color: "#8E8EA9",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Thời gian
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.8125rem",
                                color: "#8E8EA9",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Lý do đăng ký
                            </TableCell>
                            {activeTab === 1 && (
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.8125rem",
                                  color: "#8E8EA9",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                Trạng thái
                              </TableCell>
                            )}
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.8125rem",
                                color: "#8E8EA9",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Hành động
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...Array(5)].map((_, index) => (
                            <SkeletonRow key={index} index={index} />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#FAFAFC" }}>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.8125rem",
                                  color: "#8E8EA9",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  py: 2,
                                }}
                              >
                                Người dùng
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.8125rem",
                                  color: "#8E8EA9",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  py: 2,
                                }}
                              >
                                Thời gian
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.8125rem",
                                  color: "#8E8EA9",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  py: 2,
                                }}
                              >
                                Lý do đăng ký
                              </TableCell>
                              {activeTab === 1 && (
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.8125rem",
                                    color: "#8E8EA9",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    py: 2,
                                  }}
                                >
                                  Trạng thái
                                </TableCell>
                              )}
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.8125rem",
                                  color: "#8E8EA9",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  py: 2,
                                }}
                              >
                                Hành động
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {requests.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={activeTab === 0 ? 4 : 5}
                                  align="center"
                                >
                                  <Box
                                    sx={{
                                      py: 8,
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "20px",
                                        bgcolor: "#F0F0F5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <RequestIcon
                                        sx={{ fontSize: 40, color: "#C4C4D4" }}
                                      />
                                    </Box>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        color: "#4A4A68",
                                        fontWeight: 600,
                                        fontSize: "1.125rem",
                                      }}
                                    >
                                      {activeTab === 0
                                        ? "Không có yêu cầu nào đang chờ duyệt"
                                        : "Chưa có lịch sử xét duyệt"}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "#8E8EA9",
                                        fontSize: "0.9375rem",
                                      }}
                                    >
                                      {activeTab === 0
                                        ? "Tất cả yêu cầu đã được xử lý"
                                        : "Các yêu cầu đã xử lý sẽ xuất hiện ở đây"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ) : (
                              requests.map((request, index) => {
                                const statusConfig = getStatusConfig(
                                  request.status,
                                );
                                const StatusIcon = statusConfig.icon;
                                return (
                                  <Fade
                                    in
                                    key={request._id}
                                    timeout={300 + index * 50}
                                  >
                                    <TableRow
                                      hover
                                      sx={{
                                        transition: "all 0.2s ease",
                                        "&:hover": { bgcolor: "#FAFAFC" },
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          py: 2.5,
                                          borderBottom: "1px solid #F0F0F5",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                          }}
                                        >
                                          <Avatar
                                            src={request.userId?.avatarUrl}
                                            alt={request.userId?.name}
                                            sx={{
                                              width: 44,
                                              height: 44,
                                              background:
                                                "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                                              fontWeight: 600,
                                              boxShadow:
                                                "0 4px 14px rgba(16, 185, 129, 0.3)",
                                            }}
                                          >
                                            {getInitials(request.userId?.name)}
                                          </Avatar>
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 600,
                                                color: "#1A1A2E",
                                                fontSize: "0.9375rem",
                                              }}
                                            >
                                              {request.userId?.name}
                                            </Typography>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                              }}
                                            >
                                              <EmailIcon
                                                sx={{
                                                  fontSize: 12,
                                                  color: "#C4C4D4",
                                                }}
                                              />
                                              <Typography
                                                sx={{
                                                  color: "#8E8EA9",
                                                  fontSize: "0.8125rem",
                                                }}
                                              >
                                                {request.userId?.email}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          py: 2.5,
                                          borderBottom: "1px solid #F0F0F5",
                                        }}
                                      >
                                        <Box>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <ScheduleIcon
                                              sx={{
                                                fontSize: 16,
                                                color: "#C4C4D4",
                                              }}
                                            />
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: "#4A4A68",
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              {formatDate(request.createdAt)}
                                            </Typography>
                                          </Box>
                                          <Typography
                                            sx={{
                                              color: "#8E8EA9",
                                              ml: 3,
                                              fontSize: "0.8125rem",
                                            }}
                                          >
                                            {formatRelativeTime(
                                              request.createdAt,
                                            )}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          py: 2.5,
                                          borderBottom: "1px solid #F0F0F5",
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            maxWidth: 280,
                                            fontStyle: "italic",
                                            color: "#4A4A68",
                                            lineHeight: 1.5,
                                            fontSize: "0.9375rem",
                                          }}
                                        >
                                          "{truncateText(request.reason)}"
                                        </Typography>
                                      </TableCell>
                                      {activeTab === 1 && (
                                        <TableCell
                                          sx={{
                                            py: 2.5,
                                            borderBottom: "1px solid #F0F0F5",
                                          }}
                                        >
                                          <Chip
                                            icon={
                                              <StatusIcon
                                                sx={{
                                                  fontSize: "16px !important",
                                                }}
                                              />
                                            }
                                            label={statusConfig.label}
                                            size="small"
                                            sx={{
                                              bgcolor: statusConfig.bgColor,
                                              color: statusConfig.color,
                                              fontWeight: 600,
                                              borderRadius: "8px",
                                              fontSize: "0.8125rem",
                                              "& .MuiChip-icon": {
                                                color: statusConfig.color,
                                              },
                                            }}
                                          />
                                        </TableCell>
                                      )}
                                      <TableCell
                                        sx={{
                                          py: 2.5,
                                          borderBottom: "1px solid #F0F0F5",
                                        }}
                                      >
                                        <Button
                                          variant="contained"
                                          size="small"
                                          startIcon={<VisibilityIcon />}
                                          onClick={() => handleReview(request)}
                                          disabled={
                                            activeTab === 1 &&
                                            request.status === "pending"
                                          }
                                          sx={{
                                            textTransform: "none",
                                            borderRadius: "10px",
                                            fontWeight: 600,
                                            px: 2,
                                            fontSize: "0.875rem",
                                            bgcolor:
                                              activeTab === 0
                                                ? "#10B981"
                                                : "#2196F3",
                                            boxShadow:
                                              activeTab === 0
                                                ? "0 4px 14px rgba(16, 185, 129, 0.3)"
                                                : "0 4px 14px rgba(33, 150, 243, 0.3)",
                                            "&:hover": {
                                              bgcolor:
                                                activeTab === 0
                                                  ? "#059669"
                                                  : "#1976D2",
                                              transform: "translateY(-2px)",
                                            },
                                            "&:disabled": {
                                              bgcolor: "#E0E0E0",
                                            },
                                          }}
                                        >
                                          {activeTab === 0
                                            ? "Xem xét"
                                            : "Chi tiết"}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  </Fade>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {requests.length > 0 && (
                        <TablePagination
                          component="div"
                          count={totalRequests}
                          page={page}
                          onPageChange={handleChangePage}
                          rowsPerPage={rowsPerPage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                          rowsPerPageOptions={[5, 10, 20, 50]}
                          labelRowsPerPage="Số dòng:"
                          labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} trong ${count}`
                          }
                          sx={{
                            borderTop: "1px solid #E0E0E0",
                            bgcolor: "#FAFAFC",
                            "& .MuiTablePagination-select": {
                              borderRadius: "8px",
                            },
                            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                              { fontSize: "0.9375rem" },
                          }}
                        />
                      )}
                    </>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <ReviewRequestDialog
        request={selectedRequest}
        open={reviewDialogOpen}
        onClose={() => !actionLoading && setReviewDialogOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
        isReadOnly={activeTab === 1 && selectedRequest?.status !== "pending"}
      />

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
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(26,26,46,0.15)",
            fontSize: "0.9375rem",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpgradeRequestsPage;
