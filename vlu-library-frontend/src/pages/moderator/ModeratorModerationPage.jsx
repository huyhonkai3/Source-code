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
} from "@mui/material";
import {
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Sort as SortIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import ModerationTable from "../../components/admin/ModerationTable";
import documentsAPI from "../../api/documents.api";

/**
 * ModeratorModerationPage Component
 * Trang kiểm duyệt tài liệu dành riêng cho Moderator
 * - Sử dụng UserSidebar thay vì AdminSidebar
 * - Tái sử dụng phần body (nội dung) giống ModerationPage của Admin
 * - Route: /moderation
 */
const ModeratorModerationPage = () => {
  const navigate = useNavigate();

  // Tab state
  const [currentTab, setCurrentTab] = useState(0); // 0: pending, 1: approved, 2: rejected

  // Data state
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    category: "all",
    sort: "-createdAt", // Newest first
  });

  // Counts for badges
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Map tab index to status
   */
  const getStatusFromTab = (tabIndex) => {
    const statusMap = ["pending", "approved", "rejected"];
    return statusMap[tabIndex];
  };

  /**
   * Map tab index to title
   */
  const getTitleFromTab = (tabIndex) => {
    const titleMap = [
      "Danh sách Chờ duyệt",
      "Lịch sử Đã duyệt",
      "Lịch sử Từ chối",
    ];
    return titleMap[tabIndex];
  };

  /**
   * Fetch documents based on current filters
   */
  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    try {
      const status = getStatusFromTab(currentTab);

      const params = {
        page,
        limit: 10,
        status,
        sort: filters.sort,
      };

      // Add category filter if not "all"
      if (filters.category !== "all") {
        params.category = filters.category;
      }

      const response = await documentsAPI.getAllAdmin(params);

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

  /**
   * Fetch status counts for badges
   */
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
   * Initial data load
   */
  useEffect(() => {
    fetchDocuments();
    fetchStatusCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, filters]);

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchDocuments(page);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      category: event.target.value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      sort: event.target.value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  /**
   * Handle review document
   * Điều hướng đến trang review riêng cho Moderator
   */
  const handleReview = (documentId) => {
    navigate(`/moderation/${documentId}`);
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

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar - UserSidebar cho Moderator */}
          <Grid item xs={12} md={3}>
            <UserSidebar active="moderation" />
          </Grid>

          {/* Right Content - Tái sử dụng phần body giống Admin */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Breadcrumb & Title */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Kiểm duyệt tài liệu
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
                  <Typography variant="h4" fontWeight="bold">
                    {getTitleFromTab(currentTab)}
                  </Typography>

                  {/* Filters */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Category Filter */}
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <Select
                        value={filters.category}
                        onChange={handleCategoryChange}
                        startAdornment={
                          <CategoryIcon
                            sx={{ mr: 1, color: "action.active" }}
                          />
                        }
                        sx={{ borderRadius: 1 }}
                      >
                        <MenuItem value="all">Tất cả danh mục</MenuItem>
                        {/* TODO: Load from API */}
                        <MenuItem value="khoa-hoc-du-lieu">
                          Khoa học Dữ liệu
                        </MenuItem>
                        <MenuItem value="my-thuat-cong-nghiep">
                          Mỹ thuật Công nghiệp
                        </MenuItem>
                        <MenuItem value="cong-nghe-thong-tin">
                          Công nghệ Thông tin
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* Sort Filter */}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={filters.sort}
                        onChange={handleSortChange}
                        startAdornment={
                          <SortIcon sx={{ mr: 1, color: "action.active" }} />
                        }
                        sx={{ borderRadius: 1 }}
                      >
                        <MenuItem value="-createdAt">Mới nhất trước</MenuItem>
                        <MenuItem value="createdAt">Cũ nhất trước</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              {/* Tabs Navigation */}
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  aria-label="moderation tabs"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.9375rem",
                      minHeight: 48,
                    },
                    "& .Mui-selected": {
                      fontWeight: 600,
                    },
                  }}
                >
                  {/* Tab 1: Chờ duyệt */}
                  <Tab
                    icon={<PendingIcon />}
                    iconPosition="start"
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>Chờ duyệt</span>
                        <Badge
                          badgeContent={statusCounts.pending}
                          color="error"
                          max={99}
                          sx={{
                            "& .MuiBadge-badge": {
                              backgroundColor: "#FFEBEE",
                              color: "#D32F2F",
                              fontWeight: 600,
                            },
                          }}
                        />
                      </Box>
                    }
                  />

                  {/* Tab 2: Đã duyệt */}
                  <Tab
                    icon={<ApprovedIcon />}
                    iconPosition="start"
                    label="Lịch sử Đã duyệt"
                  />

                  {/* Tab 3: Từ chối */}
                  <Tab
                    icon={<RejectedIcon />}
                    iconPosition="start"
                    label="Lịch sử Từ chối"
                  />
                </Tabs>
              </Box>

              {/* Data Table */}
              <ModerationTable
                documents={documents}
                loading={loading}
                page={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalDocuments={pagination.totalDocuments}
                currentTab={currentTab}
                onPageChange={handlePageChange}
                onReview={handleReview}
              />
            </Box>
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

export default ModeratorModerationPage;
