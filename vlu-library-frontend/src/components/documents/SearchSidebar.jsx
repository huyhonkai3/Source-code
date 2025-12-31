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
  alpha,
  Chip,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  CalendarMonth as CalendarIcon,
  Description as DocIcon,
  Tune as TuneIcon,
  LibraryBooks as AllBooksIcon,
  MenuBook as TextbookIcon,
  School as ThesisIcon,
  Science as ResearchIcon,
  Article as ReferenceIcon,
} from "@mui/icons-material";

/**
 * SearchSidebar Component - VLU Design System v2.0
 * Modern & Bold filter sidebar với smooth animations
 * UPDATED: Tăng font sizes để UX tốt hơn (min +2px)
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
   */
  useEffect(() => {
    console.log("[SearchSidebar] Syncing with initialFilters:", initialFilters);

    if (initialFilters.category) {
      const cats = Array.isArray(initialFilters.category)
        ? initialFilters.category
        : [initialFilters.category];
      setSelectedCategories(cats);
    } else {
      setSelectedCategories([]);
    }

    setYearFrom(initialFilters.yearFrom || "");
    setYearTo(initialFilters.yearTo || "");
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
   */
  const handleApplyFilters = useCallback(() => {
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

    console.log("[SearchSidebar] Applying filters:", filters);
    onFilter(filters);
  }, [selectedCategories, yearFrom, yearTo, documentType, onFilter]);

  /**
   * Handle clear all filters
   */
  const handleClearFilters = useCallback(() => {
    console.log("[SearchSidebar] Clearing all filters");

    setSelectedCategories([]);
    setYearFrom("");
    setYearTo("");
    setDocumentType("all");

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

  /**
   * Count active filters
   */
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (yearFrom) count++;
    if (yearTo) count++;
    if (documentType !== "all") count++;
    return count;
  };

  const currentYear = new Date().getFullYear();

  // Document types với Material Icons
  const documentTypes = [
    { value: "all", label: "Tất cả", icon: AllBooksIcon, color: "#8E8EA9" },
    {
      value: "textbook",
      label: "Giáo trình",
      icon: TextbookIcon,
      color: "#2196F3",
    },
    { value: "thesis", label: "Luận văn", icon: ThesisIcon, color: "#7C4DFF" },
    {
      value: "research",
      label: "Nghiên cứu",
      icon: ResearchIcon,
      color: "#4CAF50",
    },
    {
      value: "reference",
      label: "Tham khảo",
      icon: ReferenceIcon,
      color: "#FF7043",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        position: "sticky",
        top: 90,
        maxHeight: "calc(100vh - 110px)",
        overflowY: "auto",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26, 26, 46, 0.06)",
        border: "1px solid #F0F0F5",

        /* Custom scrollbar */
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          bgcolor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "#E0E0E0",
          borderRadius: "3px",
          "&:hover": {
            bgcolor: "#C4C4D4",
          },
        },
      }}
    >
      {/* ========== HEADER ========== */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2.5,
          borderBottom: "1px solid #F0F0F5",
          bgcolor: "#FAFAFC",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: alpha("#D32F2F", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TuneIcon sx={{ color: "#D32F2F", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#1A1A2E" }} // UPDATED: 18px thay vì 16px
            >
              Bộ lọc
            </Typography>
            {hasActiveFilters() && (
              <Typography sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}>
                {" "}
                {/* UPDATED: 13px thay vì 12px */}
                {getActiveFilterCount()} đang áp dụng
              </Typography>
            )}
          </Box>
        </Box>

        {hasActiveFilters() && (
          <Button
            size="small"
            onClick={handleClearFilters}
            sx={{
              color: "#D32F2F",
              fontWeight: 600,
              fontSize: "0.875rem", // UPDATED: 14px thay vì 13px
              textTransform: "none",
              "&:hover": {
                bgcolor: alpha("#D32F2F", 0.08),
              },
            }}
          >
            Xóa tất cả
          </Button>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        {/* ========== CATEGORIES SECTION ========== */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              px: 1,
              mx: -1,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: "#FAFAFC",
              },
            }}
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CategoryIcon sx={{ fontSize: 22, color: "#2196F3" }} />{" "}
              {/* UPDATED: 22px thay vì 20px */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  fontSize: "0.9375rem",
                }} // UPDATED: 15px thay vì 14px
              >
                Danh mục
              </Typography>
              {selectedCategories.length > 0 && (
                <Chip
                  label={selectedCategories.length}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.8125rem", // UPDATED: 13px thay vì 11px
                    fontWeight: 700,
                    bgcolor: "#2196F3",
                    color: "white",
                  }}
                />
              )}
            </Box>
            <IconButton size="small" sx={{ color: "#8E8EA9" }}>
              {categoriesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={categoriesExpanded}>
            <FormGroup sx={{ pl: 1, pt: 1 }}>
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((n) => (
                    <Skeleton
                      key={n}
                      height={40}
                      sx={{ mb: 0.5, borderRadius: "8px" }}
                    />
                  ))}
                </>
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const categoryId = category.id || category._id;
                  const isSelected = selectedCategories.includes(categoryId);

                  return (
                    <FormControlLabel
                      key={categoryId}
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleCategoryChange(categoryId)}
                          size="small"
                          sx={{
                            color: "#C4C4D4",
                            "&.Mui-checked": {
                              color: "#D32F2F",
                            },
                          }}
                        />
                      }
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            minWidth: 140,
                          }}
                        >
                          <Typography
                            sx={{
                              color: isSelected ? "#1A1A2E" : "#4A4A68",
                              fontWeight: isSelected ? 600 : 400,
                              fontSize: "0.9375rem", // UPDATED: 15px thay vì 14px
                            }}
                          >
                            {category.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#8E8EA9",
                              bgcolor: "#F0F0F5",
                              px: 1,
                              py: 0.25,
                              borderRadius: "4px",
                              fontSize: "0.8125rem", // UPDATED: 13px thay vì 11px
                              fontWeight: 500,
                            }}
                          >
                            {category.documentCount || 0}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        mb: 0.5,
                        mr: 0,
                        ml: 0,
                        width: "100%",
                        py: 0.75, // UPDATED: tăng padding
                        px: 1,
                        borderRadius: "8px",
                        bgcolor: isSelected
                          ? alpha("#D32F2F", 0.04)
                          : "transparent",
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          bgcolor: isSelected
                            ? alpha("#D32F2F", 0.08)
                            : "#FAFAFC",
                        },
                      }}
                    />
                  );
                })
              ) : (
                <Typography
                  sx={{
                    py: 2,
                    textAlign: "center",
                    color: "#8E8EA9",
                    fontSize: "0.9375rem",
                  }}
                >
                  Không có danh mục
                </Typography>
              )}
            </FormGroup>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#F0F0F5" }} />

        {/* ========== YEAR RANGE SECTION ========== */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              px: 1,
              mx: -1,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: "#FAFAFC",
              },
            }}
            onClick={() => setYearExpanded(!yearExpanded)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CalendarIcon sx={{ fontSize: 22, color: "#4CAF50" }} />{" "}
              {/* UPDATED: 22px */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  fontSize: "0.9375rem",
                }} // UPDATED: 15px
              >
                Năm xuất bản
              </Typography>
              {(yearFrom || yearTo) && (
                <Chip
                  label={`${yearFrom || "..."} - ${yearTo || "..."}`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.75rem", // UPDATED: 12px thay vì 10px
                    fontWeight: 600,
                    bgcolor: "#4CAF50",
                    color: "white",
                  }}
                />
              )}
            </Box>
            <IconButton size="small" sx={{ color: "#8E8EA9" }}>
              {yearExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={yearExpanded}>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                pt: 1.5,
                pl: 1,
              }}
            >
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
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: "#FAFAFC",
                    fontSize: "0.9375rem", // UPDATED: 15px
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#C4C4D4",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D32F2F",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem", // UPDATED: 14px
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#D32F2F",
                  },
                }}
              />
              <Typography
                sx={{
                  color: "#8E8EA9",
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                }}
              >
                —
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
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: "#FAFAFC",
                    fontSize: "0.9375rem", // UPDATED: 15px
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#C4C4D4",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D32F2F",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem", // UPDATED: 14px
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#D32F2F",
                  },
                }}
              />
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#F0F0F5" }} />

        {/* ========== DOCUMENT TYPE SECTION ========== */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              px: 1,
              mx: -1,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: "#FAFAFC",
              },
            }}
            onClick={() => setTypeExpanded(!typeExpanded)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <DocIcon sx={{ fontSize: 22, color: "#FF7043" }} />{" "}
              {/* UPDATED: 22px */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  fontSize: "0.9375rem",
                }} // UPDATED: 15px
              >
                Loại tài liệu
              </Typography>
              {documentType !== "all" && (
                <Chip
                  label={
                    documentTypes.find((t) => t.value === documentType)?.label
                  }
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.75rem", // UPDATED: 12px
                    fontWeight: 600,
                    bgcolor: "#FF7043",
                    color: "white",
                  }}
                />
              )}
            </Box>
            <IconButton size="small" sx={{ color: "#8E8EA9" }}>
              {typeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={typeExpanded}>
            <RadioGroup
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              sx={{ pl: 1, pt: 1 }}
            >
              {documentTypes.map((type) => {
                const isSelected = documentType === type.value;

                return (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "#C4C4D4",
                          "&.Mui-checked": {
                            color: "#D32F2F",
                          },
                        }}
                      />
                    }
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <type.icon sx={{ fontSize: 20, color: type.color }} />
                        <Typography
                          sx={{
                            color: isSelected ? "#1A1A2E" : "#4A4A68",
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: "0.9375rem", // UPDATED: 15px thay vì 14px
                          }}
                        >
                          {type.label}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      mb: 0.5,
                      mr: 0,
                      ml: 0,
                      width: "100%",
                      py: 0.75, // UPDATED: tăng padding
                      px: 1,
                      borderRadius: "8px",
                      bgcolor: isSelected
                        ? alpha("#D32F2F", 0.04)
                        : "transparent",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        bgcolor: isSelected
                          ? alpha("#D32F2F", 0.08)
                          : "#FAFAFC",
                      },
                    }}
                  />
                );
              })}
            </RadioGroup>
          </Collapse>
        </Box>
      </Box>

      {/* ========== APPLY BUTTON ========== */}
      <Box
        sx={{
          p: 2,
          pt: 1,
          borderTop: "1px solid #F0F0F5",
          bgcolor: "#FAFAFC",
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={handleApplyFilters}
          sx={{
            bgcolor: "#D32F2F",
            color: "white",
            py: 1.75,
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "1rem", // UPDATED: 16px thay vì 15px
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(211, 47, 47, 0.25)",
            "&:hover": {
              bgcolor: "#B71C1C",
              boxShadow: "0 6px 20px rgba(211, 47, 47, 0.35)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Áp dụng bộ lọc
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchSidebar;
