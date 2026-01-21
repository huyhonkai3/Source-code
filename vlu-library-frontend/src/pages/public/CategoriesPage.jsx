/**
 * CategoriesPage - VLU Design System v2.0.1
 * PUBLIC PAGE - Trang danh mục cho tất cả người dùng
 * GenZ Style: Tươi sáng, colorful, gradient cards, playful animations
 *
 * Đường dẫn: src/pages/public/CategoriesPage.jsx
 * Route: /categories
 */

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  alpha,
  Fade,
  Skeleton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Category as CategoryIcon,
  MenuBook as BookIcon,
  TrendingUp as TrendingIcon,
  AutoAwesome as SparkleIcon,
  Folder as FolderIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import categoriesAPI from "../../api/categories.api";

/**
 * Gradient colors cho các category cards - GenZ vibrant palette
 */
const CARD_GRADIENTS = [
  { from: "#FF6B6B", to: "#FF8E8E", shadow: "rgba(255, 107, 107, 0.35)" },
  { from: "#4ECDC4", to: "#6EE7DE", shadow: "rgba(78, 205, 196, 0.35)" },
  { from: "#A78BFA", to: "#C4B5FD", shadow: "rgba(167, 139, 250, 0.35)" },
  { from: "#FBBF24", to: "#FCD34D", shadow: "rgba(251, 191, 36, 0.35)" },
  { from: "#F472B6", to: "#F9A8D4", shadow: "rgba(244, 114, 182, 0.35)" },
  { from: "#60A5FA", to: "#93C5FD", shadow: "rgba(96, 165, 250, 0.35)" },
  { from: "#34D399", to: "#6EE7B7", shadow: "rgba(52, 211, 153, 0.35)" },
  { from: "#FB923C", to: "#FDBA74", shadow: "rgba(251, 146, 60, 0.35)" },
  { from: "#E879F9", to: "#F0ABFC", shadow: "rgba(232, 121, 249, 0.35)" },
  { from: "#38BDF8", to: "#7DD3FC", shadow: "rgba(56, 189, 248, 0.35)" },
];

/**
 * Category Card Component - GenZ Style
 */
const CategoryCard = ({ category, index, onClick }) => {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Fade in timeout={300 + index * 100}>
      <Paper
        elevation={0}
        onClick={() => onClick(category)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          p: 3,
          borderRadius: "24px",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          border: "1px solid",
          borderColor: alpha(gradient.from, 0.2),
          background: `linear-gradient(135deg, ${alpha(gradient.from, 0.08)} 0%, ${alpha(gradient.to, 0.04)} 100%)`,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered
            ? "translateY(-8px) scale(1.02)"
            : "translateY(0) scale(1)",
          boxShadow: isHovered
            ? `0 20px 40px ${gradient.shadow}`
            : "0 4px 20px rgba(0,0,0,0.05)",
          "&:hover": {
            borderColor: alpha(gradient.from, 0.5),
          },
        }}
      >
        {/* Decorative blob */}
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${alpha(gradient.from, 0.15)} 0%, ${alpha(gradient.to, 0.1)} 100%)`,
            transition: "all 0.4s ease",
            transform: isHovered ? "scale(1.5)" : "scale(1)",
          }}
        />

        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            boxShadow: `0 8px 24px ${gradient.shadow}`,
            transition: "all 0.3s ease",
            transform: isHovered
              ? "rotate(-5deg) scale(1.1)"
              : "rotate(0) scale(1)",
          }}
        >
          <FolderIcon sx={{ color: "white", fontSize: 28 }} />
        </Box>

        {/* Content */}
        <Typography
          sx={{
            fontWeight: 700,
            color: "#1A1A2E",
            fontSize: "1.125rem",
            mb: 1,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            lineHeight: 1.3,
          }}
        >
          {category.name}
        </Typography>

        <Typography
          sx={{
            color: "#6B7280",
            fontSize: "0.875rem",
            mb: 2,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 42,
          }}
        >
          {category.description || "Khám phá các tài liệu trong danh mục này"}
        </Typography>

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Chip
            icon={<BookIcon sx={{ fontSize: "16px !important" }} />}
            label={`${category.documentCount || 0} tài liệu`}
            size="small"
            sx={{
              bgcolor: alpha(gradient.from, 0.12),
              color: gradient.from,
              fontWeight: 600,
              fontSize: "0.8125rem",
              borderRadius: "10px",
              "& .MuiChip-icon": { color: gradient.from },
            }}
          />

          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: isHovered ? gradient.from : alpha(gradient.from, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
          >
            <ArrowIcon
              sx={{
                fontSize: 18,
                color: isHovered ? "white" : gradient.from,
                transition: "all 0.3s ease",
                transform: isHovered ? "translateX(2px)" : "translateX(0)",
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

/**
 * Skeleton Card for loading state
 */
const SkeletonCard = ({ index }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: "24px",
      border: "1px solid #F0F0F5",
      animation: `fadeIn 0.3s ease ${index * 0.1}s both`,
      "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
    }}
  >
    <Skeleton
      variant="rounded"
      width={56}
      height={56}
      sx={{ borderRadius: "16px", mb: 2.5 }}
    />
    <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="100%" height={20} />
    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Skeleton
        variant="rounded"
        width={100}
        height={28}
        sx={{ borderRadius: "10px" }}
      />
      <Skeleton variant="circular" width={36} height={36} />
    </Box>
  </Paper>
);

/**
 * Stats Card Component
 */
const StatsCard = ({ icon: Icon, label, value, color, delay }) => (
  <Fade in timeout={500 + delay}>
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "20px",
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 100%)`,
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 16px ${alpha(color, 0.4)}`,
        }}
      >
        <Icon sx={{ color: "white", fontSize: 24 }} />
      </Box>
      <Box>
        <Typography
          sx={{ color: "#6B7280", fontSize: "0.8125rem", fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            color: "#1A1A2E",
            fontSize: "1.5rem",
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  </Fade>
);

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoriesAPI.getAll();
        if (response.status === "success") {
          setCategories(response.data.categories || []);
          setFilteredCategories(response.data.categories || []);
        }
      } catch (err) {
        console.error("Fetch categories error:", err);
        setError("Không thể tải danh mục. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories by search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          (cat.description && cat.description.toLowerCase().includes(query)),
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  // Handle category click - navigate to documents with category filter
  const handleCategoryClick = (category) => {
    navigate(`/documents?category=${category.id}`);
  };

  // Calculate stats
  const totalDocuments = categories.reduce(
    (sum, cat) => sum + (cat.documentCount || 0),
    0,
  );
  const topCategory = [...categories].sort(
    (a, b) => (b.documentCount || 0) - (a.documentCount || 0),
  )[0];

  return (
    <>
      <Header />

      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC", pt: 4, pb: 8 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box
            sx={{
              textAlign: "center",
              mb: 5,
              position: "relative",
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: "absolute",
                top: -20,
                left: "10%",
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
                opacity: 0.2,
                filter: "blur(20px)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 40,
                right: "15%",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%)",
                opacity: 0.2,
                filter: "blur(25px)",
              }}
            />

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2.5,
                py: 1,
                borderRadius: "100px",
                bgcolor: alpha("#A78BFA", 0.1),
                mb: 3,
              }}
            >
              {/* <SparkleIcon sx={{ fontSize: 18, color: "#A78BFA" }} />*/}
              <Typography
                sx={{ color: "#A78BFA", fontWeight: 600, fontSize: "0.875rem" }}
              >
                Khám phá tri thức
              </Typography>
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#1A1A2E",
                mb: 2,
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.2,
              }}
            >
              Danh mục{" "}
              <Box
                component="span"
                sx={{
                  background:
                    "linear-gradient(135deg, #FF6B6B 0%, #A78BFA 50%, #4ECDC4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Tài liệu
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "#6B7280",
                fontSize: "1.0625rem",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.7,
              }}
            >
              Khám phá kho tàng tri thức được phân loại khoa học. Tìm kiếm tài
              liệu theo chủ đề bạn quan tâm.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <StatsCard
                icon={CategoryIcon}
                label="Tổng danh mục"
                value={categories.length}
                color="#A78BFA"
                delay={0}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard
                icon={BookIcon}
                label="Tổng tài liệu"
                value={totalDocuments.toLocaleString()}
                color="#4ECDC4"
                delay={100}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard
                icon={TrendingIcon}
                label="Phổ biến nhất"
                value={topCategory?.name || "—"}
                color="#FF6B6B"
                delay={200}
              />
            </Grid>
          </Grid>

          {/* Search Box */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: "20px",
              border: "1px solid #E5E7EB",
              bgcolor: "white",
              mb: 4,
              display: "flex",
              alignItems: "center",
              transition: "all 0.3s ease",
              "&:focus-within": {
                borderColor: "#A78BFA",
                boxShadow: `0 0 0 4px ${alpha("#A78BFA", 0.1)}`,
              },
            }}
          >
            <TextField
              fullWidth
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF", ml: 2 }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: "1rem",
                  py: 1,
                  "& input": {
                    "&::placeholder": { color: "#9CA3AF", opacity: 1 },
                  },
                },
              }}
            />
            {searchQuery && (
              <Chip
                label={`${filteredCategories.length} kết quả`}
                size="small"
                sx={{
                  mr: 2,
                  bgcolor: alpha("#A78BFA", 0.1),
                  color: "#A78BFA",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                }}
              />
            )}
          </Paper>

          {/* Categories Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(8)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <SkeletonCard index={index} />
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: "24px",
                border: "1px solid #FEE2E2",
                bgcolor: alpha("#EF4444", 0.05),
              }}
            >
              <Typography
                sx={{
                  color: "#EF4444",
                  fontWeight: 600,
                  fontSize: "1.125rem",
                  mb: 1,
                }}
              >
                Đã xảy ra lỗi
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.9375rem" }}>
                {error}
              </Typography>
            </Paper>
          ) : filteredCategories.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: "24px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "24px",
                  bgcolor: "#F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <CategoryIcon sx={{ fontSize: 40, color: "#9CA3AF" }} />
              </Box>
              <Typography
                sx={{
                  color: "#1A1A2E",
                  fontWeight: 600,
                  fontSize: "1.125rem",
                  mb: 1,
                }}
              >
                {searchQuery
                  ? "Không tìm thấy danh mục"
                  : "Chưa có danh mục nào"}
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.9375rem" }}>
                {searchQuery
                  ? `Không có danh mục nào phù hợp với "${searchQuery}"`
                  : "Các danh mục sẽ xuất hiện ở đây khi được thêm vào hệ thống."}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredCategories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                  <CategoryCard
                    category={category}
                    index={index}
                    onClick={handleCategoryClick}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Bottom CTA */}
          {!loading && filteredCategories.length > 0 && (
            <Box sx={{ textAlign: "center", mt: 6 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.9375rem" }}>
                Bạn đang tìm kiếm điều gì đó cụ thể?
              </Typography>
              <Typography
                component="span"
                onClick={() => navigate("/documents")}
                sx={{
                  color: "#A78BFA",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Tìm kiếm tất cả tài liệu →
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default CategoriesPage;
