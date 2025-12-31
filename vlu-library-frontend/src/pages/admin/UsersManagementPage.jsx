import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Grid,
  Pagination,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Fade,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Clear as ClearIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserTable from "../../components/admin/UserTable";
import ChangeRoleDialog from "../../components/admin/ChangeRoleDialog";
import LockUserDialog from "../../components/admin/LockUserDialog";
import Header from "../../components/common/Header";
import userAPI from "../../api/user.api";

/**
 * UsersManagementPage - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [searchInput, setSearchInput] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, locked: 0 });
  const [changeRoleDialog, setChangeRoleDialog] = useState({
    open: false,
    user: null,
  });
  const [roleDialogLoading, setRoleDialogLoading] = useState(false);
  const [lockDialog, setLockDialog] = useState({ open: false, user: null });
  const [lockDialogLoading, setLockDialogLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit,
        search: filters.search,
        role: filters.role,
        status: filters.status,
      };
      const response = await userAPI.getAllUsers(params);
      if (response.status === "success") {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
        setTotalUsers(response.data.pagination.totalUsers);
        const activeCount = response.data.users.filter(
          (u) => u.status === "active",
        ).length;
        const lockedCount = response.data.users.filter(
          (u) => u.status === "locked",
        ).length;
        setStats({
          total: response.data.pagination.totalUsers,
          active: activeCount,
          locked: lockedCount,
        });
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách người dùng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = (e) => setSearchInput(e.target.value);
  const handleRoleChange = (e) => {
    setFilters((prev) => ({ ...prev, role: e.target.value }));
    setCurrentPage(1);
  };
  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({ search: "", role: "", status: "" });
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    setSnackbar({
      open: true,
      message: "Đã cập nhật dữ liệu",
      severity: "success",
    });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleManageRole = (user) => setChangeRoleDialog({ open: true, user });
  const handleCloseRoleDialog = () => {
    if (!roleDialogLoading) setChangeRoleDialog({ open: false, user: null });
  };

  const handleConfirmRoleChange = async (userId, newRole) => {
    setRoleDialogLoading(true);
    try {
      const response = await userAPI.updateUserRole(userId, newRole);
      if (response.status === "success") {
        await fetchUsers();
        setChangeRoleDialog({ open: false, user: null });
        setSnackbar({
          open: true,
          message: "Đã cập nhật vai trò thành công",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Change role error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Không thể thay đổi vai trò. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setRoleDialogLoading(false);
    }
  };

  const handleToggleLock = (user) => setLockDialog({ open: true, user });
  const handleCloseLockDialog = () => {
    if (!lockDialogLoading) setLockDialog({ open: false, user: null });
  };

  const handleConfirmLock = async (userId, action, reason) => {
    setLockDialogLoading(true);
    try {
      const response = await userAPI.lockUser(userId, action, reason);
      if (response.status === "success") {
        await fetchUsers();
        setLockDialog({ open: false, user: null });
        const actionText = action === "lock" ? "khóa" : "mở khóa";
        setSnackbar({
          open: true,
          message: `Đã ${actionText} tài khoản thành công`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Lock/Unlock user error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Không thể thực hiện thao tác. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setLockDialogLoading(false);
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));
  const hasActiveFilters = filters.role || filters.status || searchInput;

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
            {value.toLocaleString()}
          </Typography>
          {trend && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
            >
              <TrendingUpIcon sx={{ fontSize: 14, color: "#10B981" }} />
              <Typography
                sx={{
                  color: "#10B981",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                }}
              >
                {trend}
              </Typography>
            </Box>
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

  return (
    <>
      <Header />
      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC", pt: 4, pb: 6 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <AdminSidebar active="users" />
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
                      "linear-gradient(135deg, #2196F3 0%, #00BCD4 50%, #4CAF50 100%)",
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
                      <GroupIcon sx={{ fontSize: 18 }} />
                      Dashboard / Người dùng
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
                          Quản lý Người dùng
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            mt: 1,
                            fontSize: "1rem",
                          }}
                        >
                          Quản lý tài khoản và phân quyền người dùng
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
                      icon={PeopleIcon}
                      label="Tổng người dùng"
                      value={stats.total}
                      color="#2196F3"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={CheckCircleIcon}
                      label="Đang hoạt động"
                      value={stats.active}
                      color="#10B981"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={BlockIcon}
                      label="Bị khóa"
                      value={stats.locked}
                      color="#EF4444"
                    />
                  </Grid>
                </Grid>

                {/* Filters Bar */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "#E0E0E0",
                    bgcolor: "white",
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: "#8E8EA9" }} />
                            </InputAdornment>
                          ),
                          endAdornment: searchInput && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => setSearchInput("")}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "#F0F0F5",
                            fontSize: "0.9375rem",
                            "&:hover": { bgcolor: "#E8E8ED" },
                            "&.Mui-focused": { bgcolor: "white" },
                            "& fieldset": { borderColor: "transparent" },
                            "&:hover fieldset": { borderColor: "transparent" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#2196F3",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Vai trò"
                        value={filters.role}
                        onChange={handleRoleChange}
                        SelectProps={{ IconComponent: ArrowDownIcon }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "#F0F0F5",
                            fontSize: "0.9375rem",
                            "& fieldset": { borderColor: "transparent" },
                            "&:hover fieldset": { borderColor: "transparent" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#2196F3",
                            },
                          },
                          "& .MuiInputLabel-root": { fontSize: "0.9375rem" },
                        }}
                      >
                        <MenuItem value="" sx={{ fontSize: "0.9375rem" }}>
                          Tất cả vai trò
                        </MenuItem>
                        <MenuItem value="Admin" sx={{ fontSize: "0.9375rem" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#D32F2F",
                              }}
                            />
                            Admin
                          </Box>
                        </MenuItem>
                        <MenuItem
                          value="Moderator"
                          sx={{ fontSize: "0.9375rem" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#1976D2",
                              }}
                            />
                            Moderator
                          </Box>
                        </MenuItem>
                        <MenuItem value="Author" sx={{ fontSize: "0.9375rem" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#388E3C",
                              }}
                            />
                            Author
                          </Box>
                        </MenuItem>
                        <MenuItem value="User" sx={{ fontSize: "0.9375rem" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#757575",
                              }}
                            />
                            User
                          </Box>
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Trạng thái"
                        value={filters.status}
                        onChange={handleStatusChange}
                        SelectProps={{ IconComponent: ArrowDownIcon }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "#F0F0F5",
                            fontSize: "0.9375rem",
                            "& fieldset": { borderColor: "transparent" },
                            "&:hover fieldset": { borderColor: "transparent" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#2196F3",
                            },
                          },
                          "& .MuiInputLabel-root": { fontSize: "0.9375rem" },
                        }}
                      >
                        <MenuItem value="" sx={{ fontSize: "0.9375rem" }}>
                          Tất cả trạng thái
                        </MenuItem>
                        <MenuItem value="active" sx={{ fontSize: "0.9375rem" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{ fontSize: 16, color: "#10B981" }}
                            />
                            Hoạt động
                          </Box>
                        </MenuItem>
                        <MenuItem value="locked" sx={{ fontSize: "0.9375rem" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <BlockIcon
                              sx={{ fontSize: 16, color: "#EF4444" }}
                            />
                            Bị khóa
                          </Box>
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        fullWidth
                        variant={hasActiveFilters ? "contained" : "outlined"}
                        startIcon={<RefreshIcon />}
                        onClick={handleResetFilters}
                        disabled={!hasActiveFilters}
                        sx={{
                          height: 40,
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          ...(hasActiveFilters
                            ? {
                                bgcolor: "#2196F3",
                                "&:hover": { bgcolor: "#1976D2" },
                              }
                            : { borderColor: "#E0E0E0", color: "#8E8EA9" }),
                        }}
                      >
                        Reset
                      </Button>
                    </Grid>
                  </Grid>
                  {hasActiveFilters && (
                    <Box
                      sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}
                    >
                      {searchInput && (
                        <Chip
                          label={`Tìm: "${searchInput}"`}
                          size="small"
                          onDelete={() => setSearchInput("")}
                          sx={{
                            bgcolor: alpha("#2196F3", 0.1),
                            color: "#2196F3",
                            fontWeight: 500,
                            fontSize: "0.8125rem",
                            "& .MuiChip-deleteIcon": { color: "#2196F3" },
                          }}
                        />
                      )}
                      {filters.role && (
                        <Chip
                          label={`Vai trò: ${filters.role}`}
                          size="small"
                          onDelete={() =>
                            setFilters((prev) => ({ ...prev, role: "" }))
                          }
                          sx={{
                            bgcolor: alpha("#7C4DFF", 0.1),
                            color: "#7C4DFF",
                            fontWeight: 500,
                            fontSize: "0.8125rem",
                            "& .MuiChip-deleteIcon": { color: "#7C4DFF" },
                          }}
                        />
                      )}
                      {filters.status && (
                        <Chip
                          label={`Trạng thái: ${filters.status === "active" ? "Hoạt động" : "Bị khóa"}`}
                          size="small"
                          onDelete={() =>
                            setFilters((prev) => ({ ...prev, status: "" }))
                          }
                          sx={{
                            bgcolor: alpha(
                              filters.status === "active"
                                ? "#10B981"
                                : "#EF4444",
                              0.1,
                            ),
                            color:
                              filters.status === "active"
                                ? "#10B981"
                                : "#EF4444",
                            fontWeight: 500,
                            fontSize: "0.8125rem",
                            "& .MuiChip-deleteIcon": {
                              color:
                                filters.status === "active"
                                  ? "#10B981"
                                  : "#EF4444",
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Paper>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "#FECACA",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {error}
                  </Alert>
                )}

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
                  {loading ? (
                    <Box sx={{ p: 4 }}>
                      {[...Array(5)].map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            py: 2,
                            borderBottom:
                              index < 4 ? "1px solid #F0F0F5" : "none",
                          }}
                        >
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="40%" height={24} />
                            <Skeleton variant="text" width="60%" height={18} />
                          </Box>
                          <Skeleton
                            variant="rounded"
                            width={80}
                            height={24}
                            sx={{ borderRadius: "8px" }}
                          />
                          <Skeleton
                            variant="rounded"
                            width={80}
                            height={24}
                            sx={{ borderRadius: "8px" }}
                          />
                          <Skeleton variant="text" width={100} />
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Skeleton
                              variant="circular"
                              width={32}
                              height={32}
                            />
                            <Skeleton
                              variant="circular"
                              width={32}
                              height={32}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <>
                      <UserTable
                        users={users}
                        onManageRole={handleManageRole}
                        onToggleLock={handleToggleLock}
                      />
                      {totalPages > 1 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 3,
                            borderTop: "1px solid",
                            borderColor: "#E0E0E0",
                            bgcolor: "#FAFAFC",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#4A4A68",
                              fontWeight: 500,
                              fontSize: "0.9375rem",
                            }}
                          >
                            Hiển thị{" "}
                            <Box
                              component="span"
                              sx={{ fontWeight: 700, color: "#1A1A2E" }}
                            >
                              {(currentPage - 1) * limit + 1}
                            </Box>{" "}
                            -{" "}
                            <Box
                              component="span"
                              sx={{ fontWeight: 700, color: "#1A1A2E" }}
                            >
                              {Math.min(currentPage * limit, totalUsers)}
                            </Box>{" "}
                            trong số{" "}
                            <Box
                              component="span"
                              sx={{ fontWeight: 700, color: "#1A1A2E" }}
                            >
                              {totalUsers}
                            </Box>{" "}
                            người dùng
                          </Typography>
                          <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            showFirstButton
                            showLastButton
                            sx={{
                              "& .MuiPaginationItem-root": {
                                fontWeight: 600,
                                borderRadius: "10px",
                                minWidth: 40,
                                height: 40,
                                fontSize: "0.9375rem",
                                "&:hover": { bgcolor: alpha("#2196F3", 0.08) },
                                "&.Mui-selected": {
                                  bgcolor: "#2196F3",
                                  color: "white",
                                  "&:hover": { bgcolor: "#1976D2" },
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <ChangeRoleDialog
        open={changeRoleDialog.open}
        onClose={handleCloseRoleDialog}
        user={changeRoleDialog.user}
        onConfirm={handleConfirmRoleChange}
        loading={roleDialogLoading}
      />
      <LockUserDialog
        open={lockDialog.open}
        onClose={handleCloseLockDialog}
        user={lockDialog.user}
        onConfirm={handleConfirmLock}
        loading={lockDialogLoading}
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

export default UsersManagementPage;
