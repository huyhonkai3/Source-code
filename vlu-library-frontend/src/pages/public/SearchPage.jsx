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
          category: searchParams.getAll("category"),
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

        const response = await documentsAPI.getAll(params);

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
    const params = Object.fromEntries(searchParams);
    if (searchKeyword.trim()) {
      params.q = searchKeyword.trim();
    } else {
      delete params.q;
    }
    params.page = "1"; // Reset to first page
    setSearchParams(params);
  };

  /**
   * Handle popular tag click
   */
  const handleTagClick = (tag) => {
    setSearchKeyword(tag);
    const params = Object.fromEntries(searchParams);
    params.q = tag;
    params.page = "1";
    setSearchParams(params);
  };

  /**
   * Handle filter apply
   */
  const handleFilter = (filters) => {
    const params = Object.fromEntries(searchParams);

    // Remove old filter params
    delete params.category;
    delete params.yearFrom;
    delete params.yearTo;
    delete params.type;

    // Add new filters
    if (filters.category && filters.category.length > 0) {
      // For multiple categories, we need to handle differently
      // Using array format in URL
      const newParams = new URLSearchParams(params);
      filters.category.forEach((cat) => {
        newParams.append("category", cat);
      });
      if (filters.yearFrom) newParams.set("yearFrom", filters.yearFrom);
      if (filters.yearTo) newParams.set("yearTo", filters.yearTo);
      if (filters.type) newParams.set("type", filters.type);
      newParams.set("page", "1");
      setSearchParams(newParams);
      return;
    }

    // No categories selected
    Object.assign(params, filters);
    params.page = "1";
    setSearchParams(params);
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    const params = Object.fromEntries(searchParams);
    params.sort = newSort;
    params.page = "1";
    setSearchParams(params);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (event, value) => {
    const params = Object.fromEntries(searchParams);
    params.page = value.toString();
    setSearchParams(params);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Get initial filters from URL for sidebar
   */
  const getInitialFilters = () => {
    return {
      category: searchParams.getAll("category"),
      yearFrom: searchParams.get("yearFrom"),
      yearTo: searchParams.get("yearTo"),
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
