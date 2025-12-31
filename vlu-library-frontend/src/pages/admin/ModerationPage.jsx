import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Chip,
  alpha,
  InputAdornment,
  TextField,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Sort as SortIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserSidebar from "../../components/user/UserSidebar";
import ModerationTable from "../../components/admin/ModerationTable";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";
import { useAuth } from "../../context/AuthContext";

/**
 * ModerationPage Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes để UX tốt hơn
 */
const ModerationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "Admin";
  const isModerator = user?.role === "Moderator";

  const [currentTab, setCurrentTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
  });
  const [filters, setFilters] = useState({
    category: "all",
    sort: "-createdAt",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const getStatusFromTab = (tabIndex) =>
    ["pending", "approved", "rejected"][tabIndex];
  const getTitleFromTab = (tabIndex) =>
    ["Danh sách Chờ duyệt", "Lịch sử Đã duyệt", "Lịch sử Từ chối"][tabIndex];
  const getTabDescription = (tabIndex) =>
    [
      "Các tài liệu đang chờ xét duyệt từ người dùng",
      "Tài liệu đã được phê duyệt và xuất bản",
      "Tài liệu bị từ chối do không đạt yêu cầu",
    ][tabIndex];

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    try {
      const status = getStatusFromTab(currentTab);
      const params = { page, limit: 10, status, sort: filters.sort };
      if (filters.category !== "all") params.category = filters.category;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await documentsAPI.getAllAdmin(params);
      console.log("Fetch documents response:", response.data);
      if (response.status === "success") {
        setDocuments(response.data.documents || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalDocuments: 0,
          },
        );
      }
    } catch (error) {
      console.error("Fetch documents error:", error);
      showSnackbar("Không thể tải danh sách tài liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        documentsAPI.getAllAdmin({ status: "pending", limit: 1 }),
        documentsAPI.getAllAdmin({ status: "approved", limit: 1 }),
        documentsAPI.getAllAdmin({ status: "rejected", limit: 1 }),
      ]);
      setStatusCounts({
        pending: pendingRes.data?.pagination?.totalDocuments || 0,
        approved: approvedRes.data?.pagination?.totalDocuments || 0,
        rejected: rejectedRes.data?.pagination?.totalDocuments || 0,
      });
    } catch (error) {
      console.error("Fetch status counts error:", error);
    }
  };

  /**
   * Fetch categories từ API
   */
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      if (response.status === "success") {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDocuments(),
      fetchStatusCounts(),
      fetchCategories(),
    ]);
    setRefreshing(false);
    showSnackbar("Đã cập nhật dữ liệu", "success");
  };

  // Fetch categories một lần khi mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch documents khi tab hoặc filters thay đổi
  useEffect(() => {
    fetchDocuments();
    fetchStatusCounts();
  }, [currentTab, filters]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchDocuments(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (event) => {
    setFilters((prev) => ({ ...prev, category: event.target.value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (event) => {
    setFilters((prev) => ({ ...prev, sort: event.target.value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (event) => {
    if (event.key === "Enter") fetchDocuments();
  };

  const handleReview = (documentId) => {
    navigate(`/admin/moderation/${documentId}`);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const renderSidebar = () => {
    if (isAdmin)
      return (
        <AdminSidebar active="moderation" pendingCount={statusCounts.pending} />
      );
    if (isModerator) return <UserSidebar active="moderation" />;
    return null;
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
              {renderSidebar()}
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
                      "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 50%, #FFC107 100%)",
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
                      <AssessmentIcon sx={{ fontSize: 18 }} />
                      {isAdmin ? "Dashboard / " : ""}Kiểm duyệt tài liệu
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
                          Trung tâm Kiểm duyệt
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "rgba(255,255,255,0.9)",
                            mt: 1,
                            fontSize: "1rem",
                          }}
                        >
                          Quản lý và xét duyệt tài liệu từ người dùng
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
                      value={statusCounts.pending}
                      color="#F59E0B"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={ApprovedIcon}
                      label="Đã duyệt"
                      value={statusCounts.approved}
                      color="#10B981"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatsCard
                      icon={RejectedIcon}
                      label="Từ chối"
                      value={statusCounts.rejected}
                      color="#EF4444"
                    />
                  </Grid>
                </Grid>

                {/* Filters Section */}
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
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      placeholder="Tìm kiếm tài liệu..."
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#8E8EA9" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 200,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          bgcolor: "#F0F0F5",
                          fontSize: "0.9375rem",
                          "&:hover": { bgcolor: "#E8E8ED" },
                          "&.Mui-focused": { bgcolor: "white" },
                          "& fieldset": { borderColor: "transparent" },
                          "&:hover fieldset": { borderColor: "transparent" },
                          "&.Mui-focused fieldset": { borderColor: "#D32F2F" },
                        },
                      }}
                    />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <Select
                        value={filters.category}
                        onChange={handleCategoryChange}
                        IconComponent={ArrowDownIcon}
                        startAdornment={
                          <InputAdornment position="start">
                            <CategoryIcon sx={{ color: "#8E8EA9", ml: 1 }} />
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: "12px",
                          bgcolor: "#F0F0F5",
                          fontSize: "0.9375rem",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "transparent",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "transparent",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#D32F2F",
                          },
                        }}
                      >
                        <MenuItem value="all" sx={{ fontSize: "0.9375rem" }}>
                          Tất cả danh mục
                        </MenuItem>
                        {categoriesLoading ? (
                          <MenuItem disabled sx={{ fontSize: "0.9375rem" }}>
                            Đang tải...
                          </MenuItem>
                        ) : (
                          categories.map((cat) => (
                            <MenuItem
                              key={cat.id}
                              value={cat.id}
                              sx={{ fontSize: "0.9375rem" }}
                            >
                              {cat.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <Select
                        value={filters.sort}
                        onChange={handleSortChange}
                        IconComponent={ArrowDownIcon}
                        startAdornment={
                          <InputAdornment position="start">
                            <SortIcon sx={{ color: "#8E8EA9", ml: 1 }} />
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: "12px",
                          bgcolor: "#F0F0F5",
                          fontSize: "0.9375rem",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "transparent",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "transparent",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#D32F2F",
                          },
                        }}
                      >
                        <MenuItem
                          value="-createdAt"
                          sx={{ fontSize: "0.9375rem" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <ScheduleIcon sx={{ fontSize: 16 }} />
                            Mới nhất
                          </Box>
                        </MenuItem>
                        <MenuItem
                          value="createdAt"
                          sx={{ fontSize: "0.9375rem" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <ScheduleIcon sx={{ fontSize: 16 }} />
                            Cũ nhất
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                    {(filters.category !== "all" || searchQuery) && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {filters.category !== "all" && (
                          <Chip
                            label={
                              categories.find((c) => c.id === filters.category)
                                ?.name || filters.category
                            }
                            size="small"
                            onDelete={() =>
                              setFilters((prev) => ({
                                ...prev,
                                category: "all",
                              }))
                            }
                            sx={{
                              bgcolor: alpha("#D32F2F", 0.1),
                              color: "#D32F2F",
                              fontWeight: 500,
                              fontSize: "0.8125rem",
                              "& .MuiChip-deleteIcon": {
                                color: "#D32F2F",
                                "&:hover": { color: "#B71C1C" },
                              },
                            }}
                          />
                        )}
                        {searchQuery && (
                          <Chip
                            label={`"${searchQuery}"`}
                            size="small"
                            onDelete={() => setSearchQuery("")}
                            sx={{
                              bgcolor: alpha("#2196F3", 0.1),
                              color: "#2196F3",
                              fontWeight: 500,
                              fontSize: "0.8125rem",
                              "& .MuiChip-deleteIcon": {
                                color: "#2196F3",
                                "&:hover": { color: "#1976D2" },
                              },
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </Paper>

                {/* Tabs Navigation */}
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
                  <Box
                    sx={{
                      px: 3,
                      pt: 2,
                      borderBottom: "1px solid",
                      borderColor: "#E0E0E0",
                    }}
                  >
                    <Tabs
                      value={currentTab}
                      onChange={handleTabChange}
                      aria-label="moderation tabs"
                      sx={{
                        "& .MuiTabs-indicator": {
                          height: 3,
                          borderRadius: "3px 3px 0 0",
                          bgcolor: "#D32F2F",
                        },
                        "& .MuiTab-root": {
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "1rem",
                          minHeight: 56,
                          color: "#4A4A68",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            color: "#D32F2F",
                            bgcolor: alpha("#D32F2F", 0.04),
                          },
                          "&.Mui-selected": {
                            fontWeight: 600,
                            color: "#D32F2F",
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
                                currentTab === 0
                                  ? alpha("#F59E0B", 0.15)
                                  : "#F0F0F5",
                              color: currentTab === 0 ? "#F59E0B" : "#8E8EA9",
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
                            {statusCounts.pending > 0 && (
                              <Chip
                                label={statusCounts.pending}
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
                                currentTab === 1
                                  ? alpha("#10B981", 0.15)
                                  : "#F0F0F5",
                              color: currentTab === 1 ? "#10B981" : "#8E8EA9",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <ApprovedIcon sx={{ fontSize: 20 }} />
                          </Box>
                        }
                        iconPosition="start"
                        label="Đã duyệt"
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
                                currentTab === 2
                                  ? alpha("#EF4444", 0.15)
                                  : "#F0F0F5",
                              color: currentTab === 2 ? "#EF4444" : "#8E8EA9",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <RejectedIcon sx={{ fontSize: 20 }} />
                          </Box>
                        }
                        iconPosition="start"
                        label="Từ chối"
                      />
                    </Tabs>
                  </Box>
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      bgcolor: "#FAFAFC",
                      borderBottom: "1px solid",
                      borderColor: "#E0E0E0",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#4A4A68",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <FilterIcon sx={{ fontSize: 16, color: "#8E8EA9" }} />
                      {getTabDescription(currentTab)}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 0 }}>
                    <ModerationTable
                      documents={documents}
                      loading={loading}
                      page={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      totalDocuments={pagination.totalDocuments}
                      currentTab={currentTab}
                      onPageChange={handlePageChange}
                      onReview={handleReview}
                      userRole={user?.role}
                    />
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

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

export default ModerationPage;
