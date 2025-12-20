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
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  HourglassEmpty as PendingIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ReviewRequestDialog from "../../components/admin/ReviewRequestDialog";
import userAPI from "../../api/user.api";

/**
 * UpgradeRequestsPage Component
 * Admin page để quản lý và xét duyệt yêu cầu nâng cấp lên Author
 */
const UpgradeRequestsPage = () => {
  // State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter state
  const [activeTab, setActiveTab] = useState(0); // 0: Chờ duyệt, 1: Lịch sử

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRequests, setTotalRequests] = useState(0);

  // Dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Fetch requests on mount and when filters change
   */
  useEffect(() => {
    fetchRequests();
  }, [activeTab, page, rowsPerPage]);

  /**
   * Fetch upgrade requests from API
   */
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const status = activeTab === 0 ? "pending" : undefined; // Tab 0: pending, Tab 1: all

      const response = await userAPI.getUpgradeRequests({
        status,
        page: page + 1, // Backend uses 1-indexed pages
        limit: rowsPerPage,
      });

      if (response.status === "success") {
        setRequests(response.data.requests || []);
        setTotalRequests(response.data.pagination?.totalRequests || 0);
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
      showSnackbar("Không thể tải danh sách yêu cầu", "error");
    } finally {
      setLoading(false);
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
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page
  };

  /**
   * Handle page change
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Handle review button click
   */
  const handleReview = (request) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  /**
   * Handle approve request
   */
  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const response = await userAPI.reviewUpgradeRequest(selectedRequest._id, {
        status: "approved",
      });

      if (response.status === "success") {
        showSnackbar(
          "Đã chấp thuận yêu cầu. Người dùng đã được nâng cấp lên Author!",
          "success",
        );
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error("Approve request error:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể chấp thuận yêu cầu";
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle reject request
   */
  const handleReject = async (rejectionReason) => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const response = await userAPI.reviewUpgradeRequest(selectedRequest._id, {
        status: "rejected",
        rejectionReason,
      });

      if (response.status === "success") {
        showSnackbar("Đã từ chối yêu cầu", "info");
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error("Reject request error:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể từ chối yêu cầu";
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Get status chip configuration
   */
  const getStatusChip = (status) => {
    const configs = {
      pending: {
        label: "Chờ duyệt",
        color: "warning",
        icon: <PendingIcon fontSize="small" />,
      },
      approved: {
        label: "Đã duyệt",
        color: "success",
      },
      rejected: {
        label: "Đã từ chối",
        color: "error",
      },
    };
    return configs[status] || configs.pending;
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "-";
    }
  };

  /**
   * Truncate text
   */
  const truncateText = (text, maxLength = 80) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <AdminSidebar active="upgrade-requests" />
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Breadcrumb & Title */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Dashboard / Yêu cầu Nâng cấp
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Yêu cầu nâng cấp Author
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xét duyệt các yêu cầu nâng cấp tài khoản lên Tác giả.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Tabs */}
              <Paper
                elevation={0}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    px: 2,
                  }}
                >
                  <Tab
                    icon={<PendingIcon />}
                    iconPosition="start"
                    label={`Chờ duyệt${activeTab === 0 && totalRequests > 0 ? ` (${totalRequests})` : ""}`}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                  <Tab
                    icon={<HistoryIcon />}
                    iconPosition="start"
                    label="Lịch sử"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                </Tabs>

                {/* Loading State */}
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
                  <>
                    {/* Table */}
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>
                              NGƯỜI DÙNG
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              THỜI GIAN GỬI
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              LÝ DO ĐĂNG KÝ
                            </TableCell>
                            {activeTab === 1 && (
                              <TableCell sx={{ fontWeight: 600 }}>
                                TRẠNG THÁI
                              </TableCell>
                            )}
                            <TableCell sx={{ fontWeight: 600 }}>
                              HÀNH ĐỘNG
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
                                <Box sx={{ py: 8 }}>
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                  >
                                    {activeTab === 0
                                      ? "Không có yêu cầu nào đang chờ duyệt"
                                      : "Chưa có lịch sử xét duyệt"}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            requests.map((request) => (
                              <TableRow
                                key={request._id}
                                hover
                                sx={{
                                  "&:last-child td": { border: 0 },
                                }}
                              >
                                {/* User Info */}
                                <TableCell>
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
                                      sx={{ width: 40, height: 40 }}
                                    >
                                      {request.userId?.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight="600"
                                      >
                                        {request.userId?.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {request.userId?.email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>

                                {/* Created At */}
                                <TableCell>
                                  <Typography variant="body2">
                                    {formatDate(request.createdAt)}
                                  </Typography>
                                </TableCell>

                                {/* Reason */}
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      maxWidth: 300,
                                      fontStyle: "italic",
                                      color: "text.secondary",
                                    }}
                                  >
                                    {truncateText(request.reason)}
                                  </Typography>
                                </TableCell>

                                {/* Status (History tab only) */}
                                {activeTab === 1 && (
                                  <TableCell>
                                    <Chip
                                      label={
                                        getStatusChip(request.status).label
                                      }
                                      color={
                                        getStatusChip(request.status).color
                                      }
                                      size="small"
                                      icon={getStatusChip(request.status).icon}
                                    />
                                  </TableCell>
                                )}

                                {/* Actions */}
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => handleReview(request)}
                                    disabled={
                                      activeTab === 0
                                        ? false
                                        : request.status === "pending"
                                    }
                                  >
                                    {activeTab === 0 ? "Xem xét" : "Chi tiết"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {requests.length > 0 && (
                      <TablePagination
                        component="div"
                        count={totalRequests}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        labelRowsPerPage="Số dòng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) =>
                          `Hiển thị ${from}-${to} trong số ${count} yêu cầu`
                        }
                      />
                    )}
                  </>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Review Dialog */}
      <ReviewRequestDialog
        request={selectedRequest}
        open={reviewDialogOpen}
        onClose={() => !actionLoading && setReviewDialogOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
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

export default UpgradeRequestsPage;
