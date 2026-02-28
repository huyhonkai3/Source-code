/**
 * RequestsManagementPage.jsx
 * Trang quản lý tất cả yêu cầu cho Admin:
 * - Tab 1: Yêu cầu nâng cấp Author (từ UpgradeRequestsPage)
 * - Tab 2: Yêu cầu chỉnh sửa tài liệu (mới)
 *
 * Đường dẫn: src/pages/admin/RequestsManagementPage.jsx
 */

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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  HourglassEmpty as PendingIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Upgrade as UpgradeIcon,
  AssignmentInd as RequestIcon,
  EditNote as EditNoteIcon,
  Description as DocIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ReviewRequestDialog from "../../components/admin/ReviewRequestDialog";
import userAPI from "../../api/user.api";
import documentsAPI from "../../api/documents.api";

// =====================================================================
// REJECT EDIT REQUEST DIALOG
// =====================================================================
const RejectEditRequestDialog = ({ open, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    if (loading) return;
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.125rem", pb: 1 }}>
        Lý do từ chối yêu cầu chỉnh sửa
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="VD: Nội dung chỉnh sửa không phù hợp với chính sách thư viện..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{
            mt: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              fontSize: "0.9375rem",
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: "#4A4A68",
            borderRadius: "12px",
            border: "1px solid #E0E0E0",
            px: 3,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={!reason.trim() || loading}
          onClick={handleConfirm}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <RejectIcon />
            )
          }
          sx={{
            bgcolor: "#EF4444",
            borderRadius: "12px",
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#DC2626" },
          }}
        >
          {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =====================================================================
// MAIN COMPONENT
// =====================================================================
const RequestsManagementPage = () => {
  const [mainTab, setMainTab] = useState(0); // 0 = Nâng cấp, 1 = Chỉnh sửa

  // ---- UPGRADE REQUESTS STATE ----
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [upgradeLoading, setUpgradeLoading] = useState(true);
  const [upgradeActionLoading, setUpgradeActionLoading] = useState(false);
  const [upgradeSubTab, setUpgradeSubTab] = useState(0);
  const [upgradePage, setUpgradePage] = useState(0);
  const [upgradeRowsPerPage, setUpgradeRowsPerPage] = useState(10);
  const [upgradeTotalRequests, setUpgradeTotalRequests] = useState(0);
  const [upgradeStats, setUpgradeStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedUpgradeRequest, setSelectedUpgradeRequest] = useState(null);

  // ---- EDIT REQUESTS STATE ----
  const [editRequests, setEditRequests] = useState([]);
  const [editLoading, setEditLoading] = useState(true);
  const [editActionLoading, setEditActionLoading] = useState(false);
  const [editSubTab, setEditSubTab] = useState(0);
  const [editPage, setEditPage] = useState(0);
  const [editRowsPerPage, setEditRowsPerPage] = useState(10);
  const [editTotalRequests, setEditTotalRequests] = useState(0);
  const [editStats, setEditStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [rejectEditDialog, setRejectEditDialog] = useState({
    open: false,
    reqId: null,
  });

  // ---- SHARED STATE ----
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (mainTab === 0) {
      fetchUpgradeRequests();
    } else {
      fetchEditRequests();
    }
  }, [
    mainTab,
    upgradeSubTab,
    upgradePage,
    upgradeRowsPerPage,
    editSubTab,
    editPage,
    editRowsPerPage,
  ]);

  useEffect(() => {
    fetchUpgradeStats();
    fetchEditStats();
  }, []);

  // =====================================================================
  // UPGRADE REQUESTS LOGIC
  // =====================================================================
  const fetchUpgradeRequests = async () => {
    setUpgradeLoading(true);
    try {
      const status = upgradeSubTab === 0 ? "pending" : undefined;
      const response = await userAPI.getUpgradeRequests({
        status,
        page: upgradePage + 1,
        limit: upgradeRowsPerPage,
      });
      if (response.status === "success") {
        setUpgradeRequests(response.data.requests || []);
        setUpgradeTotalRequests(response.data.pagination?.totalRequests || 0);
      }
    } catch (err) {
      showSnackbar("Không thể tải yêu cầu nâng cấp", "error");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const fetchUpgradeStats = async () => {
    try {
      const [p, a, r] = await Promise.all([
        userAPI.getUpgradeRequests({ status: "pending", limit: 1 }),
        userAPI.getUpgradeRequests({ status: "approved", limit: 1 }),
        userAPI.getUpgradeRequests({ status: "rejected", limit: 1 }),
      ]);
      setUpgradeStats({
        pending: p.data?.pagination?.totalRequests || 0,
        approved: a.data?.pagination?.totalRequests || 0,
        rejected: r.data?.pagination?.totalRequests || 0,
      });
    } catch (err) {}
  };

  const handleApproveUpgrade = async () => {
    if (!selectedUpgradeRequest) return;
    setUpgradeActionLoading(true);
    try {
      await userAPI.reviewUpgradeRequest(selectedUpgradeRequest.id, {
        status: "approved",
      });
      showSnackbar("Đã chấp thuận! Người dùng đã được nâng cấp lên Author! 🎉");
      setReviewDialogOpen(false);
      fetchUpgradeRequests();
      fetchUpgradeStats();
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Không thể chấp thuận",
        "error",
      );
    } finally {
      setUpgradeActionLoading(false);
    }
  };

  const handleRejectUpgrade = async (rejectionReason) => {
    if (!selectedUpgradeRequest) return;
    setUpgradeActionLoading(true);
    try {
      await userAPI.reviewUpgradeRequest(selectedUpgradeRequest.id, {
        status: "rejected",
        rejectionReason,
      });
      showSnackbar("Đã từ chối yêu cầu", "info");
      setReviewDialogOpen(false);
      fetchUpgradeRequests();
      fetchUpgradeStats();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Không thể từ chối", "error");
    } finally {
      setUpgradeActionLoading(false);
    }
  };

  // =====================================================================
  // EDIT REQUESTS LOGIC
  // =====================================================================
  const fetchEditRequests = async () => {
    setEditLoading(true);
    try {
      const status = editSubTab === 0 ? "pending" : undefined;
      const response = await documentsAPI.getEditRequests({
        status,
        page: editPage + 1,
        limit: editRowsPerPage,
      });
      if (response.status === "success") {
        setEditRequests(response.data.requests || []);
        setEditTotalRequests(response.data.pagination?.totalRequests || 0);
      }
    } catch (err) {
      showSnackbar("Không thể tải yêu cầu chỉnh sửa", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const fetchEditStats = async () => {
    try {
      const [p, a, r] = await Promise.all([
        documentsAPI.getEditRequests({ status: "pending", limit: 1 }),
        documentsAPI.getEditRequests({ status: "approved", limit: 1 }),
        documentsAPI.getEditRequests({ status: "rejected", limit: 1 }),
      ]);
      setEditStats({
        pending: p.data?.pagination?.totalRequests || 0,
        approved: a.data?.pagination?.totalRequests || 0,
        rejected: r.data?.pagination?.totalRequests || 0,
      });
    } catch (err) {}
  };

  const handleApproveEditRequest = async (reqId) => {
    setEditActionLoading(true);
    try {
      await documentsAPI.reviewEditRequest(reqId, { status: "approved" });
      showSnackbar(
        "Đã chấp thuận! Tài liệu chuyển về 'Chờ duyệt' để Author sửa. ✅",
      );
      fetchEditRequests();
      fetchEditStats();
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Không thể chấp thuận",
        "error",
      );
    } finally {
      setEditActionLoading(false);
    }
  };

  const handleRejectEditRequest = async (reason) => {
    setEditActionLoading(true);
    try {
      await documentsAPI.reviewEditRequest(rejectEditDialog.reqId, {
        status: "rejected",
        adminReason: reason,
      });
      showSnackbar("Đã từ chối yêu cầu chỉnh sửa", "info");
      setRejectEditDialog({ open: false, reqId: null });
      fetchEditRequests();
      fetchEditStats();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Không thể từ chối", "error");
    } finally {
      setEditActionLoading(false);
    }
  };

  // =====================================================================
  // HELPERS
  // =====================================================================
  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return format(new Date(d), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "-";
    }
  };

  const formatRelative = (d) => {
    if (!d) return "";
    try {
      return formatDistanceToNow(new Date(d), { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  };

  const truncate = (text, max = 80) => {
    if (!text) return "-";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2)
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const getStatusConfig = (status) =>
    ({
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
    })[status] || {
      label: "Chờ duyệt",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      icon: PendingIcon,
    };

  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
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
            {value}
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
      </Box>
    </Paper>
  );

  // =====================================================================
  // RENDER
  // =====================================================================
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
                {/* Hero */}
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
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <UpgradeIcon sx={{ fontSize: 18 }} /> Dashboard / Quản lý
                      Yêu cầu
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
                            fontSize: { xs: "1.75rem", md: "2.25rem" },
                          }}
                        >
                          Quản lý Yêu cầu
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            mt: 1,
                            fontSize: "1rem",
                          }}
                        >
                          Xét duyệt yêu cầu nâng cấp tài khoản và chỉnh sửa tài
                          liệu
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Main Tabs */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #E0E0E0",
                    bgcolor: "white",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ px: 3, pt: 2, borderBottom: "2px solid #E0E0E0" }}>
                    <Tabs
                      value={mainTab}
                      onChange={(e, v) => setMainTab(v)}
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
                          "&.Mui-selected": {
                            fontWeight: 700,
                            color: "#10B981",
                          },
                        },
                      }}
                    >
                      <Tab
                        iconPosition="start"
                        icon={<UpgradeIcon sx={{ fontSize: 20 }} />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            Yêu cầu nâng cấp Author
                            {upgradeStats.pending > 0 && (
                              <Chip
                                label={upgradeStats.pending}
                                size="small"
                                sx={{
                                  height: 22,
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
                        iconPosition="start"
                        icon={<EditNoteIcon sx={{ fontSize: 20 }} />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            Yêu cầu sửa tài liệu
                            {editStats.pending > 0 && (
                              <Chip
                                label={editStats.pending}
                                size="small"
                                sx={{
                                  height: 22,
                                  bgcolor: "#DBEAFE",
                                  color: "#1D4ED8",
                                  fontWeight: 700,
                                  fontSize: "0.8125rem",
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </Tabs>
                  </Box>

                  {/* ===================== TAB 0: UPGRADE REQUESTS ===================== */}
                  {mainTab === 0 && (
                    <Box sx={{ p: 3 }}>
                      {/* Stats */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <StatsCard
                            icon={PendingIcon}
                            label="Chờ duyệt"
                            value={upgradeStats.pending}
                            color="#F59E0B"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <StatsCard
                            icon={CheckCircleIcon}
                            label="Đã duyệt"
                            value={upgradeStats.approved}
                            color="#10B981"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <StatsCard
                            icon={CancelIcon}
                            label="Từ chối"
                            value={upgradeStats.rejected}
                            color="#EF4444"
                          />
                        </Grid>
                      </Grid>

                      {/* Sub-tabs */}
                      <Box sx={{ borderBottom: "1px solid #E0E0E0", mb: 2 }}>
                        <Tabs
                          value={upgradeSubTab}
                          onChange={(e, v) => {
                            setUpgradeSubTab(v);
                            setUpgradePage(0);
                          }}
                          sx={{
                            "& .MuiTab-root": {
                              textTransform: "none",
                              fontSize: "0.9375rem",
                            },
                            "& .MuiTabs-indicator": { bgcolor: "#F59E0B" },
                          }}
                        >
                          <Tab label={`Chờ duyệt (${upgradeStats.pending})`} />
                          <Tab label="Lịch sử" />
                        </Tabs>
                      </Box>

                      {upgradeLoading ? (
                        <Box sx={{ py: 4, textAlign: "center" }}>
                          <CircularProgress />
                        </Box>
                      ) : upgradeRequests.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                          <RequestIcon
                            sx={{ fontSize: 48, color: "#C4C4D4", mb: 2 }}
                          />
                          <Typography
                            sx={{ color: "#4A4A68", fontWeight: 600 }}
                          >
                            Không có yêu cầu nào
                          </Typography>
                        </Box>
                      ) : (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#FAFAFC" }}>
                                {[
                                  "Người dùng",
                                  "Thời gian",
                                  "Lý do",
                                  upgradeSubTab === 1 && "Trạng thái",
                                  "Hành động",
                                ]
                                  .filter(Boolean)
                                  .map((h) => (
                                    <TableCell
                                      key={h}
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: "0.8125rem",
                                        color: "#8E8EA9",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      {h}
                                    </TableCell>
                                  ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {upgradeRequests.map((req, i) => {
                                const sc = getStatusConfig(req.status);
                                const StatusIcon = sc.icon;
                                return (
                                  <Fade in key={req._id} timeout={300 + i * 50}>
                                    <TableRow
                                      hover
                                      sx={{ "&:hover": { bgcolor: "#FAFAFC" } }}
                                    >
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                          }}
                                        >
                                          <Avatar
                                            src={req.userId?.avatarUrl}
                                            sx={{
                                              width: 44,
                                              height: 44,
                                              background:
                                                "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {getInitials(req.userId?.name)}
                                          </Avatar>
                                          <Box>
                                            <Typography
                                              sx={{
                                                fontWeight: 600,
                                                color: "#1A1A2E",
                                                fontSize: "0.9375rem",
                                              }}
                                            >
                                              {req.userId?.name}
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
                                                {req.userId?.email}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Typography
                                          sx={{
                                            color: "#4A4A68",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {formatDate(req.createdAt)}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            color: "#8E8EA9",
                                            fontSize: "0.8125rem",
                                          }}
                                        >
                                          {formatRelative(req.createdAt)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Typography
                                          sx={{
                                            maxWidth: 240,
                                            fontStyle: "italic",
                                            color: "#4A4A68",
                                            fontSize: "0.9375rem",
                                          }}
                                        >
                                          "{truncate(req.reason)}"
                                        </Typography>
                                      </TableCell>
                                      {upgradeSubTab === 1 && (
                                        <TableCell sx={{ py: 2.5 }}>
                                          <Chip
                                            icon={
                                              <StatusIcon
                                                sx={{
                                                  fontSize: "16px !important",
                                                }}
                                              />
                                            }
                                            label={sc.label}
                                            size="small"
                                            sx={{
                                              bgcolor: sc.bgColor,
                                              color: sc.color,
                                              fontWeight: 600,
                                              borderRadius: "8px",
                                              "& .MuiChip-icon": {
                                                color: sc.color,
                                              },
                                            }}
                                          />
                                        </TableCell>
                                      )}
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Button
                                          variant="contained"
                                          size="small"
                                          startIcon={<VisibilityIcon />}
                                          onClick={() => {
                                            setSelectedUpgradeRequest(req);
                                            setReviewDialogOpen(true);
                                          }}
                                          sx={{
                                            textTransform: "none",
                                            borderRadius: "10px",
                                            fontWeight: 600,
                                            px: 2,
                                            fontSize: "0.875rem",
                                            bgcolor: "#10B981",
                                            "&:hover": { bgcolor: "#059669" },
                                          }}
                                        >
                                          {upgradeSubTab === 0
                                            ? "Xem xét"
                                            : "Chi tiết"}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  </Fade>
                                );
                              })}
                            </TableBody>
                          </Table>
                          <TablePagination
                            component="div"
                            count={upgradeTotalRequests}
                            page={upgradePage}
                            onPageChange={(e, p) => setUpgradePage(p)}
                            rowsPerPage={upgradeRowsPerPage}
                            onRowsPerPageChange={(e) => {
                              setUpgradeRowsPerPage(
                                parseInt(e.target.value, 10),
                              );
                              setUpgradePage(0);
                            }}
                            rowsPerPageOptions={[5, 10, 20]}
                            labelRowsPerPage="Số dòng:"
                            labelDisplayedRows={({ from, to, count }) =>
                              `${from}-${to} trong ${count}`
                            }
                          />
                        </TableContainer>
                      )}
                    </Box>
                  )}

                  {/* ===================== TAB 1: EDIT REQUESTS ===================== */}
                  {mainTab === 1 && (
                    <Box sx={{ p: 3 }}>
                      {/* Stats */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <StatsCard
                            icon={PendingIcon}
                            label="Chờ xử lý"
                            value={editStats.pending}
                            color="#2196F3"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <StatsCard
                            icon={CheckCircleIcon}
                            label="Đã chấp thuận"
                            value={editStats.approved}
                            color="#10B981"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <StatsCard
                            icon={CancelIcon}
                            label="Từ chối"
                            value={editStats.rejected}
                            color="#EF4444"
                          />
                        </Grid>
                      </Grid>

                      {/* Sub-tabs */}
                      <Box sx={{ borderBottom: "1px solid #E0E0E0", mb: 2 }}>
                        <Tabs
                          value={editSubTab}
                          onChange={(e, v) => {
                            setEditSubTab(v);
                            setEditPage(0);
                          }}
                          sx={{
                            "& .MuiTab-root": {
                              textTransform: "none",
                              fontSize: "0.9375rem",
                            },
                            "& .MuiTabs-indicator": { bgcolor: "#2196F3" },
                          }}
                        >
                          <Tab label={`Chờ xử lý (${editStats.pending})`} />
                          <Tab label="Lịch sử" />
                        </Tabs>
                      </Box>

                      {editLoading ? (
                        <Box sx={{ py: 4, textAlign: "center" }}>
                          <CircularProgress />
                        </Box>
                      ) : editRequests.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                          <EditNoteIcon
                            sx={{ fontSize: 48, color: "#C4C4D4", mb: 2 }}
                          />
                          <Typography
                            sx={{ color: "#4A4A68", fontWeight: 600 }}
                          >
                            Không có yêu cầu chỉnh sửa nào
                          </Typography>
                          <Typography
                            sx={{
                              color: "#8E8EA9",
                              fontSize: "0.9375rem",
                              mt: 0.5,
                            }}
                          >
                            {editSubTab === 0
                              ? "Tất cả yêu cầu đã được xử lý"
                              : "Lịch sử xử lý sẽ hiển thị ở đây"}
                          </Typography>
                        </Box>
                      ) : (
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
                                  }}
                                >
                                  Tác giả
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.8125rem",
                                    color: "#8E8EA9",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Tài liệu
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.8125rem",
                                    color: "#8E8EA9",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Lý do xin sửa
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.8125rem",
                                    color: "#8E8EA9",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Thời gian
                                </TableCell>
                                {editSubTab === 1 && (
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.8125rem",
                                      color: "#8E8EA9",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Trạng thái
                                  </TableCell>
                                )}
                                {editSubTab === 0 && (
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.8125rem",
                                      color: "#8E8EA9",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Hành động
                                  </TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {editRequests.map((req, i) => {
                                const sc = getStatusConfig(req.status);
                                const StatusIcon = sc.icon;
                                return (
                                  <Fade in key={req._id} timeout={300 + i * 50}>
                                    <TableRow
                                      hover
                                      sx={{ "&:hover": { bgcolor: "#FAFAFC" } }}
                                    >
                                      {/* Author */}
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                          }}
                                        >
                                          <Avatar
                                            src={req.author?.avatarUrl}
                                            sx={{
                                              width: 40,
                                              height: 40,
                                              background:
                                                "linear-gradient(135deg, #2196F3 0%, #1565C0 100%)",
                                              fontWeight: 600,
                                              fontSize: "0.875rem",
                                            }}
                                          >
                                            {getInitials(req.author?.name)}
                                          </Avatar>
                                          <Box>
                                            <Typography
                                              sx={{
                                                fontWeight: 600,
                                                color: "#1A1A2E",
                                                fontSize: "0.9375rem",
                                              }}
                                            >
                                              {req.author?.name}
                                            </Typography>
                                            <Typography
                                              sx={{
                                                color: "#8E8EA9",
                                                fontSize: "0.8125rem",
                                              }}
                                            >
                                              {req.author?.email}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </TableCell>

                                      {/* Document */}
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <DocIcon
                                            sx={{
                                              fontSize: 18,
                                              color: "#D32F2F",
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              fontWeight: 500,
                                              color: "#1A1A2E",
                                              fontSize: "0.875rem",
                                              maxWidth: 200,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {req.document?.title || "N/A"}
                                          </Typography>
                                        </Box>
                                      </TableCell>

                                      {/* Reason */}
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Typography
                                          sx={{
                                            maxWidth: 220,
                                            fontStyle: "italic",
                                            color: "#4A4A68",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          "{truncate(req.reason, 60)}"
                                        </Typography>
                                      </TableCell>

                                      {/* Time */}
                                      <TableCell sx={{ py: 2.5 }}>
                                        <Typography
                                          sx={{
                                            color: "#4A4A68",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {formatDate(req.createdAt)}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            color: "#8E8EA9",
                                            fontSize: "0.8125rem",
                                          }}
                                        >
                                          {formatRelative(req.createdAt)}
                                        </Typography>
                                      </TableCell>

                                      {/* Status (history tab) */}
                                      {editSubTab === 1 && (
                                        <TableCell sx={{ py: 2.5 }}>
                                          <Chip
                                            icon={
                                              <StatusIcon
                                                sx={{
                                                  fontSize: "16px !important",
                                                }}
                                              />
                                            }
                                            label={sc.label}
                                            size="small"
                                            sx={{
                                              bgcolor: sc.bgColor,
                                              color: sc.color,
                                              fontWeight: 600,
                                              borderRadius: "8px",
                                              "& .MuiChip-icon": {
                                                color: sc.color,
                                              },
                                            }}
                                          />
                                          {req.adminReason && (
                                            <Tooltip
                                              title={`Lý do: ${req.adminReason}`}
                                              arrow
                                            >
                                              <Typography
                                                sx={{
                                                  color: "#8E8EA9",
                                                  fontSize: "0.75rem",
                                                  mt: 0.5,
                                                  cursor: "help",
                                                }}
                                              >
                                                {truncate(req.adminReason, 30)}
                                              </Typography>
                                            </Tooltip>
                                          )}
                                        </TableCell>
                                      )}

                                      {/* Actions (pending tab) */}
                                      {editSubTab === 0 && (
                                        <TableCell sx={{ py: 2.5 }}>
                                          <Box sx={{ display: "flex", gap: 1 }}>
                                            <Tooltip
                                              title="Chấp thuận - Tài liệu sẽ chuyển về Pending"
                                              arrow
                                            >
                                              <Button
                                                variant="contained"
                                                size="small"
                                                disabled={editActionLoading}
                                                onClick={() =>
                                                  handleApproveEditRequest(
                                                    req._id || req.id,
                                                  )
                                                }
                                                startIcon={<ApproveIcon />}
                                                sx={{
                                                  textTransform: "none",
                                                  borderRadius: "10px",
                                                  fontWeight: 600,
                                                  px: 2,
                                                  fontSize: "0.8125rem",
                                                  bgcolor: "#10B981",
                                                  "&:hover": {
                                                    bgcolor: "#059669",
                                                  },
                                                }}
                                              >
                                                Duyệt
                                              </Button>
                                            </Tooltip>
                                            <Tooltip title="Từ chối" arrow>
                                              <Button
                                                variant="outlined"
                                                size="small"
                                                disabled={editActionLoading}
                                                onClick={() =>
                                                  setRejectEditDialog({
                                                    open: true,
                                                    reqId: req._id || req.id,
                                                  })
                                                }
                                                startIcon={<RejectIcon />}
                                                sx={{
                                                  textTransform: "none",
                                                  borderRadius: "10px",
                                                  fontWeight: 600,
                                                  px: 2,
                                                  fontSize: "0.8125rem",
                                                  borderColor: "#EF4444",
                                                  color: "#EF4444",
                                                  "&:hover": {
                                                    bgcolor: alpha(
                                                      "#EF4444",
                                                      0.06,
                                                    ),
                                                    borderColor: "#DC2626",
                                                  },
                                                }}
                                              >
                                                Từ chối
                                              </Button>
                                            </Tooltip>
                                          </Box>
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  </Fade>
                                );
                              })}
                            </TableBody>
                          </Table>
                          <TablePagination
                            component="div"
                            count={editTotalRequests}
                            page={editPage}
                            onPageChange={(e, p) => setEditPage(p)}
                            rowsPerPage={editRowsPerPage}
                            onRowsPerPageChange={(e) => {
                              setEditRowsPerPage(parseInt(e.target.value, 10));
                              setEditPage(0);
                            }}
                            rowsPerPageOptions={[5, 10, 20]}
                            labelRowsPerPage="Số dòng:"
                            labelDisplayedRows={({ from, to, count }) =>
                              `${from}-${to} trong ${count}`
                            }
                          />
                        </TableContainer>
                      )}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Dialogs */}
      <ReviewRequestDialog
        request={selectedUpgradeRequest}
        open={reviewDialogOpen}
        onClose={() => !upgradeActionLoading && setReviewDialogOpen(false)}
        onApprove={handleApproveUpgrade}
        onReject={handleRejectUpgrade}
        loading={upgradeActionLoading}
        isReadOnly={
          upgradeSubTab === 1 && selectedUpgradeRequest?.status !== "pending"
        }
      />

      <RejectEditRequestDialog
        open={rejectEditDialog.open}
        onClose={() => setRejectEditDialog({ open: false, reqId: null })}
        onConfirm={handleRejectEditRequest}
        loading={editActionLoading}
      />

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

export default RequestsManagementPage;
