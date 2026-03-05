import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  TextField,
  MenuItem,
  Grid,
  Pagination,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Fade,
  alpha,
  Link as MuiLink,
} from "@mui/material";
import {
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  WarningAmber as WarningIcon,
  DeleteForever as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
  AssignmentLate as AssignmentLateIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Header from "../../components/common/Header";
import {
  getAdminReports,
  resolveReport,
  rejectReport,
  REPORT_REASON_LABELS,
} from "../../api/reports.api";

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    color: "warning",
    bgColor: "#FFF3E0",
    textColor: "#E65100",
    borderColor: "#FFB74D",
  },
  RESOLVED: {
    label: "Đã gỡ tài liệu",
    color: "error",
    bgColor: "#FFEBEE",
    textColor: "#B71C1C",
    borderColor: "#EF9A9A",
  },
  REJECTED: {
    label: "Đã bác bỏ",
    color: "success",
    bgColor: "#E8F5E9",
    textColor: "#1B5E20",
    borderColor: "#A5D6A7",
  },
};

// ─── Confirm Dialog ──────────────────────────────────────────────────────────

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  action,
  reportData,
  loading,
}) => {
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (open) setAdminNote("");
  }, [open]);

  const isResolve = action === "resolve";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 700,
          fontSize: "1.125rem",
          color: isResolve ? "#B71C1C" : "#1B5E20",
        }}
      >
        {isResolve ? (
          <DeleteIcon sx={{ color: "#D32F2F" }} />
        ) : (
          <RestoreIcon sx={{ color: "#388E3C" }} />
        )}
        {isResolve ? "Xác nhận gỡ bỏ tài liệu" : "Xác nhận bác bỏ báo cáo"}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: isResolve
              ? alpha("#D32F2F", 0.05)
              : alpha("#388E3C", 0.05),
            border: "1px solid",
            borderColor: isResolve
              ? alpha("#D32F2F", 0.2)
              : alpha("#388E3C", 0.2),
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 0.5, color: "#1A1A2E" }}
          >
            Tài liệu:{" "}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {reportData?.document?.title || "—"}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: "#4A4A68" }}>
            Người báo cáo:{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {reportData?.reporter?.name || reportData?.reporter?.email || "—"}
            </Box>
          </Typography>
        </Box>

        <DialogContentText
          sx={{ mb: 2, fontSize: "0.9375rem", color: "#4A4A68" }}
        >
          {isResolve
            ? "Hành động này sẽ đánh dấu tài liệu là vi phạm và gửi thông báo đến tác giả. Không thể hoàn tác."
            : "Hành động này sẽ bác bỏ báo cáo và khôi phục tài liệu về trạng thái đã duyệt."}
        </DialogContentText>

        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Ghi chú của Admin (tùy chọn)"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Nhập lý do hoặc ghi chú..."
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              fontSize: "0.9375rem",
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: "10px",
            fontWeight: 600,
            borderColor: "#E0E0E0",
            color: "#4A4A68",
            "&:hover": { bgcolor: "#F0F0F5" },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={() => onConfirm(adminNote)}
          disabled={loading}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : isResolve ? (
              <DeleteIcon />
            ) : (
              <RestoreIcon />
            )
          }
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            px: 3,
            bgcolor: isResolve ? "#D32F2F" : "#388E3C",
            "&:hover": { bgcolor: isResolve ? "#B71C1C" : "#2E7D32" },
          }}
        >
          {isResolve ? "Gỡ bỏ tài liệu" : "Bác bỏ báo cáo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── StatusChip ──────────────────────────────────────────────────────────────

const StatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bgColor: "#F0F0F5",
    textColor: "#4A4A68",
    borderColor: "#E0E0E0",
  };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.5,
        py: 0.5,
        borderRadius: "8px",
        bgcolor: config.bgColor,
        border: "1px solid",
        borderColor: config.borderColor,
      }}
    >
      <Typography
        sx={{ fontSize: "0.8125rem", fontWeight: 700, color: config.textColor }}
      >
        {config.label}
      </Typography>
    </Box>
  );
};

// ─── ReasonChip ──────────────────────────────────────────────────────────────

const ReasonChip = ({ reason }) => {
  const isIP = reason === "COPYRIGHT_INFRINGEMENT";
  return (
    <Chip
      label={REPORT_REASON_LABELS[reason] || reason}
      size="small"
      sx={{
        fontSize: "0.75rem",
        fontWeight: 600,
        borderRadius: "6px",
        bgcolor: isIP ? alpha("#D32F2F", 0.08) : alpha("#1976D2", 0.08),
        color: isIP ? "#D32F2F" : "#1565C0",
        border: "1px solid",
        borderColor: isIP ? alpha("#D32F2F", 0.2) : alpha("#1976D2", 0.2),
      }}
    />
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const ReportsManagementPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [limit] = useState(15);

  const [filters, setFilters] = useState({ status: "", reason: "" });

  const [dialog, setDialog] = useState({
    open: false,
    action: null, // "resolve" | "reject"
    report: null,
  });
  const [dialogLoading, setDialogLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ── Fetch ───────────────────────────────────────────────────────────────

  const fetchReports = useCallback(
    async (showRefreshSpinner = false) => {
      if (showRefreshSpinner) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = {
          page: currentPage,
          limit,
          ...(filters.status && { status: filters.status }),
          ...(filters.reason && { reason: filters.reason }),
        };
        const res = await getAdminReports(params);
        if (res.status === "success") {
          setReports(res.data.reports);
          setTotalPages(res.data.pagination.totalPages);
          setTotalReports(res.data.pagination.total);
          setPendingCount(res.data.pendingCount ?? 0);
        }
      } catch (err) {
        console.error("fetchReports error:", err);
        setError(
          err.response?.data?.message || "Không thể tải danh sách báo cáo",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, limit, filters],
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
    setCurrentPage(1);
  };

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDialog = (action, report) => {
    setDialog({ open: true, action, report });
  };

  const handleCloseDialog = () => {
    if (!dialogLoading) setDialog({ open: false, action: null, report: null });
  };

  const handleConfirmAction = async (adminNote) => {
    setDialogLoading(true);
    const { action, report } = dialog;
    try {
      if (action === "resolve") {
        await resolveReport(report.id, { adminNote });
        setSnackbar({
          open: true,
          message: "Đã gỡ bỏ tài liệu và thông báo cho tác giả",
          severity: "success",
        });
      } else {
        await rejectReport(report.id, { adminNote });
        setSnackbar({
          open: true,
          message: "Đã bác bỏ báo cáo và khôi phục tài liệu",
          severity: "success",
        });
      }
      setDialog({ open: false, action: null, report: null });
      await fetchReports();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
        severity: "error",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const TABLE_HEAD = [
    { label: "#", width: 48 },
    { label: "Người báo cáo" },
    { label: "Tài liệu bị báo cáo" },
    { label: "Lý do" },
    { label: "Thời gian" },
    { label: "Trạng thái", align: "center" },
    { label: "Hành động", align: "center" },
  ];

  return (
    <>
      <Header />
      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC", pt: 4, pb: 6 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid item xs={12} md={3}>
              <AdminSidebar
                active="reports"
                pendingCount={0}
                upgradeCount={0}
              />
            </Grid>

            {/* Main content */}
            <Grid item xs={12} md={9}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* ── Hero ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: "24px",
                    background:
                      "linear-gradient(135deg, #B71C1C 0%, #D32F2F 50%, #E53935 100%)",
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
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                      opacity: 0.6,
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
                      <FlagIcon sx={{ fontSize: 18 }} />
                      Dashboard / Báo cáo vi phạm
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
                            textShadow: "0 2px 4px rgba(0,0,0,0.15)",
                            fontSize: {
                              xs: "1.75rem",
                              sm: "2rem",
                              md: "2.25rem",
                            },
                          }}
                        >
                          Quản lý Báo Cáo Vi Phạm
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            mt: 1,
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {pendingCount > 0 && (
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.25,
                                borderRadius: "8px",
                                bgcolor: "rgba(255,255,255,0.25)",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                              }}
                            >
                              {pendingCount} chờ xử lý
                            </Box>
                          )}
                          Xem xét và quyết định về các báo cáo từ người dùng
                        </Typography>
                      </Box>
                      <Tooltip title="Làm mới dữ liệu" arrow>
                        <IconButton
                          onClick={() => fetchReports(true)}
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

                {/* ── Stats ── */}
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Tổng báo cáo",
                      value: totalReports,
                      color: "#5C6BC0",
                      icon: AssignmentLateIcon,
                    },
                    {
                      label: "Chờ xử lý",
                      value: pendingCount,
                      color: "#E65100",
                      icon: WarningIcon,
                    },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: "16px",
                          border: "1px solid",
                          borderColor: alpha(color, 0.2),
                          background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              color: "#4A4A68",
                              fontWeight: 600,
                              fontSize: "0.8125rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
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
                              fontSize: { xs: "1.75rem", sm: "2rem" },
                            }}
                          >
                            {value.toLocaleString()}
                          </Typography>
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
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* ── Filters ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    border: "1px solid #E0E0E0",
                    bgcolor: "white",
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Trạng thái"
                        value={filters.status}
                        onChange={handleFilterChange("status")}
                        SelectProps={{ IconComponent: ArrowDownIcon }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "#F0F0F5",
                            fontSize: "0.9375rem",
                            "& fieldset": { borderColor: "transparent" },
                            "&:hover fieldset": { borderColor: "transparent" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#D32F2F",
                            },
                          },
                          "& .MuiInputLabel-root": { fontSize: "0.9375rem" },
                        }}
                      >
                        <MenuItem value="">Tất cả trạng thái</MenuItem>
                        <MenuItem value="PENDING">⏳ Chờ xử lý</MenuItem>
                        <MenuItem value="RESOLVED">🚫 Đã gỡ tài liệu</MenuItem>
                        <MenuItem value="REJECTED">✅ Đã bác bỏ</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Lý do báo cáo"
                        value={filters.reason}
                        onChange={handleFilterChange("reason")}
                        SelectProps={{ IconComponent: ArrowDownIcon }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "#F0F0F5",
                            fontSize: "0.9375rem",
                            "& fieldset": { borderColor: "transparent" },
                            "&:hover fieldset": { borderColor: "transparent" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#D32F2F",
                            },
                          },
                          "& .MuiInputLabel-root": { fontSize: "0.9375rem" },
                        }}
                      >
                        <MenuItem value="">Tất cả lý do</MenuItem>
                        {Object.entries(REPORT_REASON_LABELS).map(
                          ([key, label]) => (
                            <MenuItem
                              key={key}
                              value={key}
                              sx={{ fontSize: "0.9375rem" }}
                            >
                              {label}
                            </MenuItem>
                          ),
                        )}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          setFilters({ status: "", reason: "" });
                          setCurrentPage(1);
                        }}
                        disabled={!filters.status && !filters.reason}
                        sx={{
                          height: 40,
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          borderColor: "#E0E0E0",
                          color: "#8E8EA9",
                        }}
                      >
                        Reset
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ borderRadius: "12px", fontSize: "0.9375rem" }}
                  >
                    {error}
                  </Alert>
                )}

                {/* ── Table ── */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid #E0E0E0",
                    bgcolor: "white",
                    overflow: "hidden",
                  }}
                >
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#FAFAFC" }}>
                          {TABLE_HEAD.map((col) => (
                            <TableCell
                              key={col.label}
                              align={col.align || "left"}
                              width={col.width}
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.8125rem",
                                color: "#4A4A68",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                borderBottom: "2px solid #F0F0F5",
                                py: 2,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {loading ? (
                          [...Array(6)].map((_, i) => (
                            <TableRow key={i}>
                              {TABLE_HEAD.map((col) => (
                                <TableCell key={col.label}>
                                  <Skeleton
                                    variant="rounded"
                                    height={20}
                                    sx={{ borderRadius: "6px" }}
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : reports.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={TABLE_HEAD.length}
                              align="center"
                              sx={{ py: 8 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 1.5,
                                  color: "#8E8EA9",
                                }}
                              >
                                <FlagIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                <Typography
                                  sx={{ fontWeight: 600, fontSize: "1rem" }}
                                >
                                  Không có báo cáo nào
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.875rem" }}
                                >
                                  Hệ thống chưa nhận được báo cáo vi phạm nào
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          reports.map((report, idx) => (
                            <TableRow
                              key={report.id}
                              sx={{
                                "&:hover": { bgcolor: "#FAFAFC" },
                                transition: "background-color 0.15s",
                                borderLeft:
                                  report.status === "PENDING"
                                    ? "3px solid #FFB74D"
                                    : "3px solid transparent",
                              }}
                            >
                              {/* # */}
                              <TableCell
                                sx={{
                                  color: "#8E8EA9",
                                  fontWeight: 600,
                                  fontSize: "0.875rem",
                                }}
                              >
                                {(currentPage - 1) * limit + idx + 1}
                              </TableCell>

                              {/* Reporter */}
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                  }}
                                >
                                  <Avatar
                                    src={report.reporter?.avatarUrl}
                                    sx={{
                                      width: 34,
                                      height: 34,
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {report.reporter?.name?.[0] || "?"}
                                  </Avatar>
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#1A1A2E",
                                      }}
                                    >
                                      {report.reporter?.name || "—"}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.75rem",
                                        color: "#8E8EA9",
                                      }}
                                    >
                                      {report.reporter?.email || "—"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              {/* Document */}
                              <TableCell sx={{ maxWidth: 240 }}>
                                {report.document ? (
                                  <Box>
                                    <MuiLink
                                      component={Link}
                                      to={`/documents/${report.document.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        color: "#1565C0",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        textDecoration: "none",
                                        "&:hover": {
                                          textDecoration: "underline",
                                        },
                                      }}
                                    >
                                      <Box
                                        component="span"
                                        sx={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          maxWidth: 180,
                                          display: "block",
                                        }}
                                      >
                                        {report.document.title}
                                      </Box>
                                      <OpenInNewIcon
                                        sx={{ fontSize: 14, flexShrink: 0 }}
                                      />
                                    </MuiLink>
                                    <Typography
                                      sx={{
                                        fontSize: "0.75rem",
                                        color: "#8E8EA9",
                                        mt: 0.25,
                                      }}
                                    >
                                      Trạng thái doc:{" "}
                                      <Box
                                        component="span"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        {report.document.status}
                                      </Box>
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography
                                    sx={{
                                      color: "#8E8EA9",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    Đã bị xóa
                                  </Typography>
                                )}
                              </TableCell>

                              {/* Reason */}
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.75,
                                  }}
                                >
                                  <ReasonChip reason={report.reason} />
                                  {report.description && (
                                    <Tooltip
                                      title={report.description}
                                      arrow
                                      placement="top"
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: "0.75rem",
                                          color: "#8E8EA9",
                                          cursor: "default",
                                          maxWidth: 160,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {report.description}
                                      </Typography>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>

                              {/* Time */}
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontSize: "0.8125rem",
                                    color: "#4A4A68",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {new Date(
                                    report.createdAt,
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "0.75rem", color: "#8E8EA9" }}
                                >
                                  {new Date(
                                    report.createdAt,
                                  ).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>
                              </TableCell>

                              {/* Status */}
                              <TableCell align="center">
                                <StatusChip status={report.status} />
                                {report.resolvedBy && (
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "#8E8EA9",
                                      mt: 0.5,
                                    }}
                                  >
                                    bởi {report.resolvedBy.name}
                                  </Typography>
                                )}
                              </TableCell>

                              {/* Actions */}
                              <TableCell align="center">
                                {report.status === "PENDING" ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Tooltip
                                      title="Đồng ý báo cáo — Gỡ bỏ tài liệu"
                                      arrow
                                    >
                                      <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={
                                          <DeleteIcon
                                            sx={{ fontSize: "14px !important" }}
                                          />
                                        }
                                        onClick={() =>
                                          handleOpenDialog("resolve", report)
                                        }
                                        sx={{
                                          borderRadius: "8px",
                                          fontWeight: 700,
                                          fontSize: "0.75rem",
                                          px: 1.5,
                                          py: 0.75,
                                          bgcolor: "#D32F2F",
                                          "&:hover": { bgcolor: "#B71C1C" },
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Gỡ tài liệu
                                      </Button>
                                    </Tooltip>
                                    <Tooltip
                                      title="Bác bỏ báo cáo — Khôi phục tài liệu"
                                      arrow
                                    >
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={
                                          <RestoreIcon
                                            sx={{ fontSize: "14px !important" }}
                                          />
                                        }
                                        onClick={() =>
                                          handleOpenDialog("reject", report)
                                        }
                                        sx={{
                                          borderRadius: "8px",
                                          fontWeight: 700,
                                          fontSize: "0.75rem",
                                          px: 1.5,
                                          py: 0.75,
                                          borderColor: "#388E3C",
                                          color: "#388E3C",
                                          "&:hover": {
                                            bgcolor: alpha("#388E3C", 0.06),
                                            borderColor: "#2E7D32",
                                          },
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Bỏ qua
                                      </Button>
                                    </Tooltip>
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    {report.status === "RESOLVED" ? (
                                      <CancelIcon
                                        sx={{ fontSize: 18, color: "#B71C1C" }}
                                      />
                                    ) : (
                                      <CheckCircleIcon
                                        sx={{ fontSize: 18, color: "#388E3C" }}
                                      />
                                    )}
                                    <Typography
                                      sx={{
                                        fontSize: "0.8125rem",
                                        color: "#8E8EA9",
                                        fontWeight: 500,
                                      }}
                                    >
                                      Đã xử lý
                                    </Typography>
                                  </Box>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 3,
                        borderTop: "1px solid #F0F0F5",
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
                          {Math.min(currentPage * limit, totalReports)}
                        </Box>{" "}
                        trong số{" "}
                        <Box
                          component="span"
                          sx={{ fontWeight: 700, color: "#1A1A2E" }}
                        >
                          {totalReports}
                        </Box>{" "}
                        báo cáo
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
                            "&.Mui-selected": {
                              bgcolor: "#D32F2F",
                              color: "white",
                              "&:hover": { bgcolor: "#B71C1C" },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog
        open={dialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        action={dialog.action}
        reportData={dialog.report}
        loading={dialogLoading}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
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

export default ReportsManagementPage;
