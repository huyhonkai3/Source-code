import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  TextField,
  Button,
  Typography,
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
  alpha,
  useTheme,
  useMediaQuery,
  Drawer,
  Fab,
  Zoom,
} from "@mui/material";
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  AutoAwesome as SparkleIcon,
  KeyboardArrowUp as ScrollTopIcon,
  Schedule as ScheduleIcon,
  DateRange as DateRangeIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/common/Header";
import DocumentCard from "../../components/documents/DocumentCard";
import DocumentListItem from "../../components/documents/DocumentListItem";
import SearchSidebar from "../../components/documents/SearchSidebar";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";

/**
 * SearchPage Component - VLU Design System v2.0.1
 * Modern & Bold design với Hero Search, Bento Grid layout
 * UPDATED: Tăng font sizes để UX tốt hơn + Fix sort values
 */
const SearchPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
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
  const [viewMode, setViewMode] = useState("grid");

  // Mobile filter drawer
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Search suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Popular search tags với màu sắc category
  const popularTags = [
    { label: "Machine Learning", color: "#7C4DFF" },
    { label: "Kinh tế số", color: "#FF7043" },
    { label: "Luận văn 2024", color: "#2196F3" },
    { label: "UX/UI Design", color: "#EC407A" },
    { label: "ReactJS", color: "#00BCD4" },
    { label: "Python", color: "#4CAF50" },
  ];

  // Recent searches (mock - có thể lấy từ localStorage)
  const recentSearches = [
    "Lập trình web",
    "Thiết kế đồ họa",
    "Quản trị kinh doanh",
  ];

  // Scroll handler for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        Object.keys(params).forEach((key) => {
          if (
            !params[key] ||
            (Array.isArray(params[key]) && params[key].length === 0)
          ) {
            delete params[key];
          }
        });

        // Kiểm tra trên devtools
        console.log("[SearchPage] Fetching documents with params:", params);

        const response = await documentsAPI.getAll(params);

        // Kiểm tra trên devtools
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
    setShowSuggestions(false);

    const newParams = new URLSearchParams();

    if (searchKeyword.trim()) {
      newParams.set("q", searchKeyword.trim());
    }

    searchParams.getAll("category").forEach((cat) => {
      newParams.append("category", cat);
    });

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
   */
  const handleFilter = (filters) => {
    console.log("[SearchPage] handleFilter called with:", filters);

    const newParams = new URLSearchParams();

    const currentQ = searchParams.get("q");
    if (currentQ) {
      newParams.set("q", currentQ);
    }

    const currentSort = searchParams.get("sort");
    if (currentSort) {
      newParams.set("sort", currentSort);
    }

    if (filters.category && filters.category.length > 0) {
      filters.category.forEach((catId) => {
        newParams.append("category", catId);
      });
    }

    if (filters.yearFrom) {
      newParams.set("yearFrom", filters.yearFrom);
    }

    if (filters.yearTo) {
      newParams.set("yearTo", filters.yearTo);
    }

    if (filters.type) {
      newParams.set("type", filters.type);
    }

    newParams.set("page", "1");

    console.log("[SearchPage] Setting new params:", newParams.toString());

    setSearchParams(newParams);
    setFilterDrawerOpen(false); // Close drawer on mobile after applying
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);

    const newParams = new URLSearchParams();

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
    const newParams = new URLSearchParams();

    searchParams.forEach((val, key) => {
      if (key !== "page") {
        newParams.append(key, val);
      }
    });

    newParams.set("page", value.toString());
    setSearchParams(newParams);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Get initial filters from URL for sidebar
   */
  const getInitialFilters = () => {
    return {
      category: searchParams.getAll("category"),
      yearFrom: searchParams.get("yearFrom") || "",
      yearTo: searchParams.get("yearTo") || "",
      type: searchParams.get("type") || "all",
    };
  };

  /**
   * Scroll to top handler
   */
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Count active filters
   */
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchParams.getAll("category").length > 0) count++;
    if (searchParams.get("yearFrom")) count++;
    if (searchParams.get("yearTo")) count++;
    if (searchParams.get("type") && searchParams.get("type") !== "all") count++;
    return count;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FAFAFC",
        position: "relative",
      }}
    >
      <Header />

      {/* ========== HERO SEARCH SECTION ========== */}
      <Box
        sx={{
          position: "relative",
          overflow: "visible",
          zIndex: 10,
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          mb: { xs: 3, md: 5 },
          // Đồng bộ với LandingPage HeroSection
          background: `
            linear-gradient(135deg,
              rgba(26, 26, 46, 0.95) 0%,
              rgba(139, 0, 0, 0.9) 50%,
              rgba(211, 47, 47, 0.85) 100%
            )
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.5,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Hero Title */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.25rem", sm: "2.75rem", md: "3.25rem" },
                fontWeight: 800,
                color: "white",
                mb: 2,
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                letterSpacing: "-0.02em",
              }}
            >
              Khám phá kho tri thức VLU
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 400,
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1.0625rem", md: "1.1875rem" },
              }}
            >
              Hàng nghìn tài liệu, luận văn, giáo trình đang chờ bạn khám phá
            </Typography>
          </Box>

          {/* ========== HERO SEARCH BOX ========== */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              maxWidth: 800,
              mx: "auto",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "white",
                borderRadius: "24px",
                p: { xs: "6px 6px 6px 20px", md: "8px 8px 8px 28px" },
                boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                border: searchFocused
                  ? "2px solid #D32F2F"
                  : "2px solid transparent",
                "&:hover": {
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                },
              }}
            >
              <SearchIcon sx={{ color: "#8E8EA9", fontSize: 28, mr: 2 }} />
              <TextField
                fullWidth
                placeholder="Tìm kiếm tài liệu, luận văn, giáo trình..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  setSearchFocused(false);
                  // Delay để cho phép click vào suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: { xs: "1.0625rem", md: "1.1875rem" },
                    color: "#1A1A2E",
                    py: { xs: 1, md: 1.5 },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "#D32F2F",
                  color: "white",
                  borderRadius: "16px",
                  px: { xs: 3, md: 4 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: "0.9375rem", md: "1.0625rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(211,47,47,0.4)",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "#B71C1C",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(211,47,47,0.5)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Tìm kiếm
              </Button>
            </Box>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  mt: 1,
                  bgcolor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <Box sx={{ p: 2, borderBottom: "1px solid #F0F0F5" }}>
                    <Typography
                      sx={{
                        color: "#8E8EA9",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                        fontSize: "0.8125rem",
                      }}
                    >
                      <HistoryIcon sx={{ fontSize: 16 }} />
                      Tìm kiếm gần đây
                    </Typography>
                    {recentSearches.map((search, index) => (
                      <Box
                        key={index}
                        onClick={() => handleTagClick(search)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1,
                          px: 1,
                          borderRadius: "8px",
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "#F0F0F5",
                          },
                        }}
                      >
                        <HistoryIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                        <Typography
                          sx={{ color: "#4A4A68", fontSize: "0.9375rem" }}
                        >
                          {search}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Trending Searches */}
                <Box sx={{ p: 2 }}>
                  <Typography
                    sx={{
                      color: "#8E8EA9",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                      fontSize: "0.8125rem",
                    }}
                  >
                    <TrendingIcon sx={{ fontSize: 16, color: "#FF7043" }} />
                    Xu hướng tìm kiếm
                  </Typography>
                  {popularTags.slice(0, 4).map((tag, index) => (
                    <Box
                      key={index}
                      onClick={() => handleTagClick(tag.label)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1,
                        px: 1,
                        borderRadius: "8px",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "#F0F0F5",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: tag.color,
                        }}
                      />
                      <Typography
                        sx={{ color: "#4A4A68", fontSize: "0.9375rem" }}
                      >
                        {tag.label}
                      </Typography>
                      <TrendingIcon
                        sx={{ fontSize: 14, color: "#10B981", ml: "auto" }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* ========== POPULAR TAGS ========== */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              sx={{
                mb: 2,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                fontSize: "0.9375rem",
              }}
            >
              <SparkleIcon sx={{ fontSize: 18 }} />
              Khám phá phổ biến
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
                  key={tag.label}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: tag.color,
                        }}
                      />
                      <span>{tag.label}</span>
                    </Box>
                  }
                  onClick={() => handleTagClick(tag.label)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 500,
                    fontSize: "0.9375rem",
                    py: 2.5,
                    px: 0.5,
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.25)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Container>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "-5%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,193,7,0.2)",
            filter: "blur(80px)",
          }}
        />
      </Box>

      {/* ========== MAIN CONTENT ========== */}
      <Container maxWidth="xl" sx={{ pb: 8 }}>
        <Grid container spacing={3}>
          {/* ========== SIDEBAR - Desktop ========== */}
          <Grid
            item
            xs={12}
            md={3}
            lg={2.5}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <SearchSidebar
              categories={categories}
              onFilter={handleFilter}
              initialFilters={getInitialFilters()}
              loading={categoriesLoading}
            />
          </Grid>

          {/* ========== RESULTS AREA ========== */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* ========== TOP BAR ========== */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
                p: { xs: 2, md: 2.5 },
                bgcolor: "white",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
              }}
            >
              {/* Results Count */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1A1A2E",
                    fontSize: { xs: "1.0625rem", md: "1.1875rem" },
                  }}
                >
                  {pagination.total.toLocaleString()} kết quả
                  {searchParams.get("q") && (
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 400,
                        color: "#8E8EA9",
                        ml: 1,
                      }}
                    >
                      cho "{searchParams.get("q")}"
                    </Box>
                  )}
                </Typography>

                {/* Active Filters Pills */}
                {getActiveFilterCount() > 0 && (
                  <Box
                    sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}
                  >
                    {searchParams.getAll("category").length > 0 && (
                      <Chip
                        label={`${searchParams.getAll("category").length} danh mục`}
                        size="small"
                        onDelete={() => {
                          const newFilters = getInitialFilters();
                          newFilters.category = [];
                          handleFilter(newFilters);
                        }}
                        sx={{
                          bgcolor: alpha("#D32F2F", 0.1),
                          color: "#D32F2F",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          "& .MuiChip-deleteIcon": {
                            color: "#D32F2F",
                          },
                        }}
                      />
                    )}
                    {(searchParams.get("yearFrom") ||
                      searchParams.get("yearTo")) && (
                      <Chip
                        label={`${searchParams.get("yearFrom") || "..."} - ${searchParams.get("yearTo") || "..."}`}
                        size="small"
                        onDelete={() => {
                          const newFilters = getInitialFilters();
                          newFilters.yearFrom = "";
                          newFilters.yearTo = "";
                          handleFilter(newFilters);
                        }}
                        sx={{
                          bgcolor: alpha("#2196F3", 0.1),
                          color: "#2196F3",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          "& .MuiChip-deleteIcon": {
                            color: "#2196F3",
                          },
                        }}
                      />
                    )}
                  </Box>
                )}
              </Box>

              {/* Controls */}
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                {/* Mobile Filter Button */}
                {isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setFilterDrawerOpen(true)}
                    sx={{
                      borderColor: "#E0E0E0",
                      color: "#4A4A68",
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      position: "relative",
                    }}
                  >
                    Bộ lọc
                    {getActiveFilterCount() > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 20,
                          height: 20,
                          bgcolor: "#D32F2F",
                          color: "white",
                          borderRadius: "50%",
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getActiveFilterCount()}
                      </Box>
                    )}
                  </Button>
                )}

                {/* View Mode Toggle */}
                <Box
                  sx={{
                    display: "flex",
                    bgcolor: "#F0F0F5",
                    borderRadius: "12px",
                    p: 0.5,
                  }}
                >
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    sx={{
                      bgcolor: viewMode === "grid" ? "white" : "transparent",
                      color: viewMode === "grid" ? "#D32F2F" : "#8E8EA9",
                      borderRadius: "8px",
                      boxShadow:
                        viewMode === "grid"
                          ? "0 2px 8px rgba(0,0,0,0.1)"
                          : "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor:
                          viewMode === "grid"
                            ? "white"
                            : "rgba(255,255,255,0.5)",
                      },
                    }}
                  >
                    <GridViewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode("list")}
                    sx={{
                      bgcolor: viewMode === "list" ? "white" : "transparent",
                      color: viewMode === "list" ? "#D32F2F" : "#8E8EA9",
                      borderRadius: "8px",
                      boxShadow:
                        viewMode === "list"
                          ? "0 2px 8px rgba(0,0,0,0.1)"
                          : "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor:
                          viewMode === "list"
                            ? "white"
                            : "rgba(255,255,255,0.5)",
                      },
                    }}
                  >
                    <ListViewIcon />
                  </IconButton>
                </Box>

                {/* Sort Dropdown - CORRECT VALUES FROM ORIGINAL FILE */}
                <FormControl size="small">
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    startAdornment={
                      <SortIcon
                        sx={{ color: "#8E8EA9", fontSize: 20, mr: 0.5 }}
                      />
                    }
                    sx={{
                      borderRadius: "12px",
                      bgcolor: "#F0F0F5",
                      border: "none",
                      minWidth: 180,
                      fontWeight: 500,
                      fontSize: "0.9375rem",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&:hover": {
                        bgcolor: "#E8E8ED",
                      },
                      "& .MuiSelect-select": {
                        py: 1.25,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      },
                    }}
                  >
                    <MenuItem
                      value="newest"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: 18, color: "#4CAF50" }} />
                      Mới nhất
                    </MenuItem>
                    <MenuItem
                      value="oldest"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <DateRangeIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                      Cũ nhất
                    </MenuItem>
                    <MenuItem
                      value="mostViewed"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 18, color: "#2196F3" }} />
                      Xem nhiều nhất
                    </MenuItem>
                    <MenuItem
                      value="mostDownloaded"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <DownloadIcon sx={{ fontSize: 18, color: "#FF7043" }} />
                      Tải nhiều nhất
                    </MenuItem>
                    <MenuItem
                      value="highestRated"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <StarIcon sx={{ fontSize: 18, color: "#FFC107" }} />
                      Đánh giá cao nhất
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: "12px",
                  fontSize: "0.9375rem",
                  "& .MuiAlert-icon": {
                    fontSize: 24,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {loading ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Grid item xs={12} sm={6} lg={4} key={n}>
                    <Box
                      sx={{
                        bgcolor: "white",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        height={200}
                        animation="wave"
                        sx={{ bgcolor: "#F0F0F5" }}
                      />
                      <Box sx={{ p: 2 }}>
                        <Skeleton width="30%" height={22} sx={{ mb: 1 }} />
                        <Skeleton width="90%" height={30} sx={{ mb: 1 }} />
                        <Skeleton width="60%" height={22} />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : documents.length > 0 ? (
              <>
                {/* Grid View */}
                {viewMode === "grid" ? (
                  <Grid container spacing={3}>
                    {documents.map((doc, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        lg={4}
                        key={doc.id || doc._id}
                        sx={{
                          animation: "fadeInUp 0.4s ease forwards",
                          animationDelay: `${index * 0.05}s`,
                          opacity: 0,
                          "@keyframes fadeInUp": {
                            from: {
                              opacity: 0,
                              transform: "translateY(20px)",
                            },
                            to: {
                              opacity: 1,
                              transform: "translateY(0)",
                            },
                          },
                        }}
                      >
                        <DocumentCard document={doc} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  /* List View */
                  <Stack spacing={2}>
                    {documents.map((doc, index) => (
                      <Box
                        key={doc.id || doc._id}
                        sx={{
                          animation: "fadeInUp 0.4s ease forwards",
                          animationDelay: `${index * 0.05}s`,
                          opacity: 0,
                          "@keyframes fadeInUp": {
                            from: {
                              opacity: 0,
                              transform: "translateY(20px)",
                            },
                            to: {
                              opacity: 1,
                              transform: "translateY(0)",
                            },
                          },
                        }}
                      >
                        <DocumentListItem document={doc} />
                      </Box>
                    ))}
                  </Stack>
                )}

                {/* ========== PAGINATION ========== */}
                {pagination.totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 5,
                      pt: 4,
                      borderTop: "1px solid #F0F0F5",
                    }}
                  >
                    <Pagination
                      count={pagination.totalPages}
                      page={pagination.page}
                      onChange={handlePageChange}
                      size={isMobile ? "medium" : "large"}
                      showFirstButton
                      showLastButton
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: "10px",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          mx: 0.5,
                          "&.Mui-selected": {
                            bgcolor: "#D32F2F",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                            "&:hover": {
                              bgcolor: "#B71C1C",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              /* ========== EMPTY STATE ========== */
              <Box
                sx={{
                  textAlign: "center",
                  py: 10,
                  px: 3,
                  bgcolor: "white",
                  borderRadius: "24px",
                  boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 3,
                    borderRadius: "50%",
                    bgcolor: "#FFF5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SearchIcon sx={{ fontSize: 48, color: "#D32F2F" }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#1A1A2E",
                    mb: 1.5,
                    fontSize: "1.375rem",
                  }}
                >
                  Không tìm thấy kết quả
                </Typography>
                <Typography
                  sx={{
                    color: "#8E8EA9",
                    mb: 4,
                    maxWidth: 400,
                    mx: "auto",
                    fontSize: "1rem",
                  }}
                >
                  Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc để
                  tìm tài liệu phù hợp
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setSearchKeyword("");
                    setSearchParams(new URLSearchParams());
                  }}
                  sx={{
                    bgcolor: "#D32F2F",
                    borderRadius: "12px",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                    "&:hover": {
                      bgcolor: "#B71C1C",
                    },
                  }}
                >
                  Xóa bộ lọc & tìm lại
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* ========== MOBILE FILTER DRAWER ========== */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "85vh",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Drawer Handle */}
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: "#E0E0E0",
              borderRadius: 2,
              mx: "auto",
              mb: 2,
            }}
          />

          {/* Drawer Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "1.125rem" }}
            >
              Bộ lọc tìm kiếm
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Sidebar Content */}
          <SearchSidebar
            categories={categories}
            onFilter={handleFilter}
            initialFilters={getInitialFilters()}
            loading={categoriesLoading}
          />
        </Box>
      </Drawer>

      {/* ========== SCROLL TO TOP BUTTON ========== */}
      <Zoom in={showScrollTop}>
        <Fab
          onClick={handleScrollTop}
          sx={{
            position: "fixed",
            bottom: { xs: 20, md: 32 },
            right: { xs: 20, md: 32 },
            bgcolor: "#D32F2F",
            color: "white",
            boxShadow: "0 4px 14px rgba(211,47,47,0.4)",
            "&:hover": {
              bgcolor: "#B71C1C",
            },
          }}
        >
          <ScrollTopIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default SearchPage;
