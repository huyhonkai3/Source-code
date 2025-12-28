import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Pagination,
  Skeleton,
  Alert,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/common/Header";
import DocumentCard from "../../components/documents/DocumentCard";
import DocumentListItem from "../../components/documents/DocumentListItem";
import SearchSidebar from "../../components/documents/SearchSidebar";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";

/**
 * SearchPage Component
 * Main document search page with filters and pagination
 */
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Popular search tags
  const popularTags = [
    "Machine Learning",
    "Kinh tế số",
    "Luận văn 2024",
    "UX/UI Design",
    "ReactJS",
    "Python",
  ];

  /**
   * Fetch categories for sidebar
   */
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await categoriesAPI.getAll();
        if (response.status === "success") {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Fetch documents based on search params
   */
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError("");

      try {
        // Build query params from URL
        const params = {
          q: searchParams.get("q") || "",
          category: searchParams.getAll("category"), // Lấy tất cả category values
          page: searchParams.get("page") || 1,
          limit: 12,
          sort: searchParams.get("sort") || "newest",
          yearFrom: searchParams.get("yearFrom"),
          yearTo: searchParams.get("yearTo"),
          type: searchParams.get("type"),
        };

        // Remove empty params
        Object.keys(params).forEach((key) => {
          if (
            !params[key] ||
            (Array.isArray(params[key]) && params[key].length === 0)
          ) {
            delete params[key];
          }
        });

        console.log("[SearchPage] Fetching documents with params:", params);

        const response = await documentsAPI.getAll(params);
        console.log("[SearchPage] Response:", response);

        if (response.status === "success") {
          setDocuments(response.data.documents || []);
          setPagination({
            page: response.data.pagination?.currentPage || 1,
            totalPages: response.data.pagination?.totalPages || 1,
            total: response.data.pagination?.totalDocuments || 0,
            limit: response.data.pagination?.limit || 12,
            hasNextPage: response.data.pagination?.hasNextPage || false,
            hasPrevPage: response.data.pagination?.hasPrevPage || false,
          });
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(
          err.response?.data?.message || "Không thể tải danh sách tài liệu",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [searchParams]);

  /**
   * Initialize search keyword from URL
   */
  useEffect(() => {
    const keyword = searchParams.get("q") || "";
    setSearchKeyword(keyword);
  }, [searchParams]);

  /**
   * Initialize sort from URL
   */
  useEffect(() => {
    const sort = searchParams.get("sort") || "newest";
    setSortBy(sort);
  }, [searchParams]);

  /**
   * Handle search submit
   */
  const handleSearch = (e) => {
    e.preventDefault();

    // Tạo URLSearchParams mới, chỉ giữ lại các filter hiện tại
    const newParams = new URLSearchParams();

    // Giữ lại search keyword
    if (searchKeyword.trim()) {
      newParams.set("q", searchKeyword.trim());
    }

    // Giữ lại categories
    searchParams.getAll("category").forEach((cat) => {
      newParams.append("category", cat);
    });

    // Giữ lại các filter khác
    if (searchParams.get("yearFrom")) {
      newParams.set("yearFrom", searchParams.get("yearFrom"));
    }
    if (searchParams.get("yearTo")) {
      newParams.set("yearTo", searchParams.get("yearTo"));
    }
    if (searchParams.get("type")) {
      newParams.set("type", searchParams.get("type"));
    }
    if (searchParams.get("sort")) {
      newParams.set("sort", searchParams.get("sort"));
    }

    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  /**
   * Handle popular tag click
   */
  const handleTagClick = (tag) => {
    setSearchKeyword(tag);
    const newParams = new URLSearchParams();
    newParams.set("q", tag);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  /**
   * Handle filter apply from SearchSidebar
   *
   * FIX: Tạo URLSearchParams hoàn toàn mới để tránh bug với multiple category values
   */
  const handleFilter = (filters) => {
    console.log("[SearchPage] handleFilter called with:", filters);

    // Tạo URLSearchParams MỚI HOÀN TOÀN
    const newParams = new URLSearchParams();

    // 1. Giữ lại search keyword (q) nếu có
    const currentQ = searchParams.get("q");
    if (currentQ) {
      newParams.set("q", currentQ);
    }

    // 2. Giữ lại sort nếu có
    const currentSort = searchParams.get("sort");
    if (currentSort) {
      newParams.set("sort", currentSort);
    }

    // 3. Thêm categories từ filter
    // QUAN TRỌNG: Gửi từng category riêng biệt với key "category" (không có [])
    // Express sẽ tự động gộp thành array khi có nhiều giá trị cùng key
    if (filters.category && filters.category.length > 0) {
      filters.category.forEach((catId) => {
        newParams.append("category", catId);
      });
    }

    // 4. Thêm yearFrom nếu có
    if (filters.yearFrom) {
      newParams.set("yearFrom", filters.yearFrom);
    }

    // 5. Thêm yearTo nếu có
    if (filters.yearTo) {
      newParams.set("yearTo", filters.yearTo);
    }

    // 6. Thêm type nếu có
    if (filters.type) {
      newParams.set("type", filters.type);
    }

    // 7. Reset về page 1
    newParams.set("page", "1");

    console.log("[SearchPage] Setting new params:", newParams.toString());

    // Update URL
    setSearchParams(newParams);
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);

    // Tạo URLSearchParams mới để giữ lại tất cả params
    const newParams = new URLSearchParams();

    // Copy tất cả params hiện tại
    searchParams.forEach((value, key) => {
      if (key !== "sort" && key !== "page") {
        newParams.append(key, value);
      }
    });

    newParams.set("sort", newSort);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (event, value) => {
    // Tạo URLSearchParams mới để giữ lại tất cả params
    const newParams = new URLSearchParams();

    // Copy tất cả params hiện tại
    searchParams.forEach((value, key) => {
      if (key !== "page") {
        newParams.append(key, value);
      }
    });

    newParams.set("page", value.toString());
    setSearchParams(newParams);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Get initial filters from URL for sidebar
   */
  const getInitialFilters = () => {
    return {
      category: searchParams.getAll("category"), // Lấy TẤT CẢ category values
      yearFrom: searchParams.get("yearFrom") || "",
      yearTo: searchParams.get("yearTo") || "",
      type: searchParams.get("type") || "all",
    };
  };

  return (
    <>
      <Header />

      {/* Search Banner */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 4, md: 6 },
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Search Box */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              maxWidth: 800,
              mx: "auto",
            }}
          >
            <Paper
              elevation={3}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 0.5,
              }}
            >
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
              <TextField
                fullWidth
                placeholder="Tìm kiếm tài liệu, luận văn, giáo trình..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: "1.1rem" },
                }}
                sx={{ mx: 2 }}
              />
            </Paper>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                px: 4,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              Tìm kiếm
            </Button>
          </Box>

          {/* Popular Tags */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              Phổ biến:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {popularTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagClick(tag)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          {/* Sidebar - Desktop */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <SearchSidebar
              categories={categories}
              onFilter={handleFilter}
              initialFilters={getInitialFilters()}
              loading={categoriesLoading}
            />
          </Grid>

          {/* Results Area */}
          <Grid item xs={12} md={9}>
            {/* Top Bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {/* Results Count */}
              <Typography variant="body1" color="text.secondary">
                Hiển thị <strong>{pagination.total}</strong> kết quả
                {searchParams.get("q") && (
                  <>
                    {" "}
                    cho từ khóa "<strong>{searchParams.get("q")}</strong>"
                  </>
                )}
              </Typography>

              {/* Controls */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {/* View Mode Toggle */}
                <Box>
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                  >
                    <GridViewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode("list")}
                    color={viewMode === "list" ? "primary" : "default"}
                  >
                    <ListViewIcon />
                  </IconButton>
                </Box>

                {/* Sort Dropdown */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select value={sortBy} onChange={handleSortChange}>
                    <MenuItem value="newest">Mới nhất</MenuItem>
                    <MenuItem value="oldest">Cũ nhất</MenuItem>
                    <MenuItem value="mostViewed">Xem nhiều nhất</MenuItem>
                    <MenuItem value="mostDownloaded">Tải nhiều nhất</MenuItem>
                    <MenuItem value="highestRated">Đánh giá cao nhất</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Document Grid/List */}
            {loading ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Grid item xs={12} sm={6} lg={4} key={n}>
                    <Skeleton variant="rectangular" height={300} />
                  </Grid>
                ))}
              </Grid>
            ) : documents.length > 0 ? (
              <>
                {/* Grid View */}
                {viewMode === "grid" ? (
                  <Grid container spacing={3}>
                    {documents.map((doc) => (
                      <Grid item xs={12} sm={6} lg={4} key={doc.id || doc._id}>
                        <DocumentCard document={doc} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  /* List View */
                  <Stack spacing={2}>
                    {documents.map((doc) => (
                      <DocumentListItem
                        key={doc.id || doc._id}
                        document={doc}
                      />
                    ))}
                  </Stack>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                  >
                    <Pagination
                      count={pagination.totalPages}
                      page={pagination.page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy kết quả phù hợp
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default SearchPage;
