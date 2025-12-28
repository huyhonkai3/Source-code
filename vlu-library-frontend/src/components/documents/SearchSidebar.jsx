import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  TextField,
  Divider,
  IconButton,
  Collapse,
  Skeleton,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

/**
 * SearchSidebar Component
 * Sidebar with filters for document search
 *
 * @param {Array} categories - List of categories from API
 * @param {Function} onFilter - Callback when filter applied
 * @param {Object} initialFilters - Initial filter values from URL
 * @param {boolean} loading - Loading state
 */
const SearchSidebar = ({
  categories = [],
  onFilter,
  initialFilters = {},
  loading = false,
}) => {
  // State for filter values
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [documentType, setDocumentType] = useState("all");

  // State for collapsible sections
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [yearExpanded, setYearExpanded] = useState(true);
  const [typeExpanded, setTypeExpanded] = useState(true);

  /**
   * Sync state với initialFilters từ URL
   * Chạy mỗi khi initialFilters thay đổi (do URL thay đổi)
   */
  useEffect(() => {
    console.log("[SearchSidebar] Syncing with initialFilters:", initialFilters);

    // Sync categories
    if (initialFilters.category) {
      const cats = Array.isArray(initialFilters.category)
        ? initialFilters.category
        : [initialFilters.category];
      setSelectedCategories(cats);
    } else {
      setSelectedCategories([]);
    }

    // Sync year range
    setYearFrom(initialFilters.yearFrom || "");
    setYearTo(initialFilters.yearTo || "");

    // Sync document type
    setDocumentType(initialFilters.type || "all");
  }, [initialFilters]);

  /**
   * Handle category checkbox change
   */
  const handleCategoryChange = useCallback((categoryId) => {
    console.log("[SearchSidebar] Category changed:", categoryId);

    setSelectedCategories((prev) => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      console.log("[SearchSidebar] New selection:", newSelection);
      return newSelection;
    });
  }, []);

  /**
   * Handle apply filters
   * Gửi tất cả filter values lên parent component
   */
  const handleApplyFilters = useCallback(() => {
    const filters = {};

    // Chỉ gửi categories nếu có selection
    if (selectedCategories.length > 0) {
      filters.category = selectedCategories;
    }

    // Gửi year range nếu có
    if (yearFrom) {
      filters.yearFrom = yearFrom;
    }
    if (yearTo) {
      filters.yearTo = yearTo;
    }

    // Gửi document type nếu không phải "all"
    if (documentType !== "all") {
      filters.type = documentType;
    }

    console.log("[SearchSidebar] Applying filters:", filters);
    onFilter(filters);
  }, [selectedCategories, yearFrom, yearTo, documentType, onFilter]);

  /**
   * Handle clear all filters
   * Reset tất cả state về default và gọi onFilter với object rỗng
   */
  const handleClearFilters = useCallback(() => {
    console.log("[SearchSidebar] Clearing all filters");

    setSelectedCategories([]);
    setYearFrom("");
    setYearTo("");
    setDocumentType("all");

    // Gọi onFilter với object rỗng để xóa tất cả filter trong URL
    onFilter({});
  }, [onFilter]);

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = () => {
    return (
      selectedCategories.length > 0 ||
      yearFrom ||
      yearTo ||
      documentType !== "all"
    );
  };

  // Current year for validation
  const currentYear = new Date().getFullYear();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        position: "sticky",
        top: 80,
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bộ lọc tìm kiếm
          </Typography>
        </Box>
        {hasActiveFilters() && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{ textTransform: "none" }}
          >
            Xóa tất cả
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Categories Section */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
            cursor: "pointer",
          }}
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            DANH MỤC
          </Typography>
          <IconButton size="small">
            {categoriesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={categoriesExpanded}>
          <FormGroup>
            {loading ? (
              <>
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} height={32} sx={{ mb: 0.5 }} />
                ))}
              </>
            ) : categories.length > 0 ? (
              categories.map((category) => {
                // Lấy ID của category (hỗ trợ cả id và _id)
                const categoryId = category.id || category._id;

                return (
                  <FormControlLabel
                    key={categoryId}
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(categoryId)}
                        onChange={() => handleCategoryChange(categoryId)}
                        size="small"
                      />
                    }
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          minWidth: 150,
                        }}
                      >
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({category.documentCount || 0})
                        </Typography>
                      </Box>
                    }
                    sx={{
                      mb: 0.5,
                      mr: 0,
                      width: "100%",
                    }}
                  />
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không có danh mục
              </Typography>
            )}
          </FormGroup>
        </Collapse>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Year Range Section */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
            cursor: "pointer",
          }}
          onClick={() => setYearExpanded(!yearExpanded)}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            NĂM XUẤT BẢN
          </Typography>
          <IconButton size="small">
            {yearExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={yearExpanded}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              label="Từ năm"
              type="number"
              size="small"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              inputProps={{
                min: 1900,
                max: currentYear,
              }}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
            <TextField
              label="Đến năm"
              type="number"
              size="small"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              inputProps={{
                min: yearFrom || 1900,
                max: currentYear,
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Document Type Section */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
            cursor: "pointer",
          }}
          onClick={() => setTypeExpanded(!typeExpanded)}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            LOẠI TÀI LIỆU
          </Typography>
          <IconButton size="small">
            {typeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={typeExpanded}>
          <RadioGroup
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <FormControlLabel
              value="all"
              control={<Radio size="small" />}
              label="Tất cả"
            />
            <FormControlLabel
              value="textbook"
              control={<Radio size="small" />}
              label="Giáo trình"
            />
            <FormControlLabel
              value="thesis"
              control={<Radio size="small" />}
              label="Luận văn"
            />
            <FormControlLabel
              value="research"
              control={<Radio size="small" />}
              label="Nghiên cứu"
            />
            <FormControlLabel
              value="reference"
              control={<Radio size="small" />}
              label="Tài liệu tham khảo"
            />
          </RadioGroup>
        </Collapse>
      </Box>

      {/* Apply Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleApplyFilters}
        sx={{
          py: 1.5,
          fontWeight: 600,
        }}
      >
        Áp dụng bộ lọc
      </Button>
    </Paper>
  );
};

export default SearchSidebar;
