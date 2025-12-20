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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserTable from "../../components/admin/UserTable";
import ChangeRoleDialog from "../../components/admin/ChangeRoleDialog";
import LockUserDialog from "../../components/admin/LockUserDialog";
import userAPI from "../../api/user.api";

/**
 * UsersManagementPage
 * Trang quản lý toàn bộ người dùng dành cho Admin
 *
 * Features:
 * - Tìm kiếm theo tên/email (debounced)
 * - Lọc theo Role (User/Author/Moderator/Admin)
 * - Lọc theo Status (Active/Locked)
 * - Pagination
 * - Actions: Phân quyền, Khóa/Mở khóa (placeholder)
 */
const UsersManagementPage = () => {
  // ====== STATE MANAGEMENT ======
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    locked: 0,
  });

  // Change Role Dialog
  const [changeRoleDialog, setChangeRoleDialog] = useState({
    open: false,
    user: null,
  });
  const [roleDialogLoading, setRoleDialogLoading] = useState(false);

  // Lock/Unlock Dialog
  const [lockDialog, setLockDialog] = useState({
    open: false,
    user: null,
  });
  const [lockDialogLoading, setLockDialogLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ====== FETCH USERS ======
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

        // Calculate stats
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

  // ====== EFFECTS ======
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ====== HANDLERS ======
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

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
    setFilters({
      search: "",
      role: "",
      status: "",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Action handlers
  const handleManageRole = (user) => {
    setChangeRoleDialog({
      open: true,
      user,
    });
  };

  const handleCloseRoleDialog = () => {
    if (!roleDialogLoading) {
      setChangeRoleDialog({
        open: false,
        user: null,
      });
    }
  };

  const handleConfirmRoleChange = async (userId, newRole) => {
    setRoleDialogLoading(true);

    try {
      const response = await userAPI.updateUserRole(userId, newRole);

      if (response.status === "success") {
        // Success - Refresh user list
        await fetchUsers();

        // Close dialog
        setChangeRoleDialog({
          open: false,
          user: null,
        });

        // Show success message
        setSnackbar({
          open: true,
          message: `Đã cập nhật vai trò thành công`,
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

  const handleToggleLock = (user) => {
    setLockDialog({
      open: true,
      user,
    });
  };

  const handleCloseLockDialog = () => {
    if (!lockDialogLoading) {
      setLockDialog({
        open: false,
        user: null,
      });
    }
  };

  const handleConfirmLock = async (userId, action, reason) => {
    setLockDialogLoading(true);

    try {
      const response = await userAPI.lockUser(userId, action, reason);

      if (response.status === "success") {
        // Success - Refresh user list
        await fetchUsers();

        // Close dialog
        setLockDialog({
          open: false,
          user: null,
        });

        // Show success message
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ====== RENDER ======
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <AdminSidebar active="users" />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
              }}
            >
              Quản lý Người dùng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý toàn bộ người dùng trong hệ thống
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <PeopleIcon />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    Tổng số User
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {stats.total.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: "success.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <CheckCircleIcon />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    Đang hoạt động
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "success.main" }}
                  >
                    {stats.active.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: "error.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <BlockIcon />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    Bị khóa
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "error.main" }}
                  >
                    {stats.locked.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
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
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Role Filter */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Vai trò"
                  value={filters.role}
                  onChange={handleRoleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Tất cả vai trò</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Moderator">Moderator</MenuItem>
                  <MenuItem value="Author">Author</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </TextField>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Trạng thái"
                  value={filters.status}
                  onChange={handleStatusChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="locked">Bị khóa</MenuItem>
                </TextField>
              </Grid>

              {/* Reset Button */}
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                  sx={{ height: 40 }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Paper
              elevation={0}
              sx={{
                p: 8,
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Đang tải dữ liệu...
              </Typography>
            </Paper>
          ) : (
            <>
              {/* User Table */}
              <UserTable
                users={users}
                onManageRole={handleManageRole}
                onToggleLock={handleToggleLock}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 3,
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Hiển thị {(currentPage - 1) * limit + 1} đến{" "}
                    {Math.min(currentPage * limit, totalUsers)} trong tổng số{" "}
                    {totalUsers} người dùng
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={changeRoleDialog.open}
        onClose={handleCloseRoleDialog}
        user={changeRoleDialog.user}
        onConfirm={handleConfirmRoleChange}
        loading={roleDialogLoading}
      />

      {/* Lock/Unlock Dialog */}
      <LockUserDialog
        open={lockDialog.open}
        onClose={handleCloseLockDialog}
        user={lockDialog.user}
        onConfirm={handleConfirmLock}
        loading={lockDialogLoading}
      />

      {/* Snackbar for notifications */}
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
  );
};

export default UsersManagementPage;
