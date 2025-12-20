import { useState, useEffect } from "react";
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
 * @param {Array} categories - List of categories
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
   * Initialize filters from URL params
   */
  useEffect(() => {
    if (initialFilters.category) {
      const cats = Array.isArray(initialFilters.category)
        ? initialFilters.category
        : [initialFilters.category];
      setSelectedCategories(cats);
    }
    if (initialFilters.yearFrom) {
      setYearFrom(initialFilters.yearFrom);
    }
    if (initialFilters.yearTo) {
      setYearTo(initialFilters.yearTo);
    }
    if (initialFilters.type) {
      setDocumentType(initialFilters.type);
    }
  }, [initialFilters]);

  /**
   * Handle category checkbox change
   */
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  /**
   * Handle apply filters
   */
  const handleApplyFilters = () => {
    const filters = {};

    if (selectedCategories.length > 0) {
      filters.category = selectedCategories;
    }
    if (yearFrom) {
      filters.yearFrom = yearFrom;
    }
    if (yearTo) {
      filters.yearTo = yearTo;
    }
    if (documentType !== "all") {
      filters.type = documentType;
    }

    onFilter(filters);
  };

  /**
   * Handle clear all filters
   */
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setYearFrom("");
    setYearTo("");
    setDocumentType("all");
    onFilter({});
  };

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
              categories.map((category) => (
                <FormControlLabel
                  key={category.id}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      size="small"
                    />
                  }
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography variant="body2">{category.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({category.documentCount || 0})
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 0.5 }}
                />
              ))
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
