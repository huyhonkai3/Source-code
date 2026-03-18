import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/**
 * HeroSection Component - VLU Design System v2.0
 * FIXED responsive:
 * - Đổi minHeight từ vh cứng → "auto" với paddingTop/Bottom đủ lớn
 *   để không bị cắt nội dung khi viewport nhỏ hoặc zoom browser.
 * - Font sizes co lại mượt hơn ở breakpoint xs→sm→md.
 * - Search row wrap đúng trên mobile, button full-width khi xs.
 * - Stats row wrap sang 1 cột khi quá hẹp (flexWrap).
 */
const HeroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const popularTags = [
    { label: "Machine Learning", color: "#7C4DFF" },
    { label: "Kinh tế số", color: "#FF7043" },
    { label: "Luận văn 2024", color: "#2196F3" },
    { label: "ReactJS", color: "#00BCD4" },
    { label: "Python", color: "#4CAF50" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/documents?q=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate("/documents");
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/documents?q=${encodeURIComponent(tag)}`);
  };

  return (
    <Box
      sx={{
        position: "relative",
        // FIX: dùng padding thay vì minHeight vh để không bị cắt khi zoom/thu nhỏ
        pt: { xs: 8, sm: 10, md: 12 },
        pb: { xs: 10, sm: 12, md: 14 },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
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
      {/* Animated background blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "float 8s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
            "50%": { transform: "translateY(-30px) rotate(180deg)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,193,7,0.15) 0%, transparent 70%)",
          filter: "blur(30px)",
          animation: "float 6s ease-in-out infinite reverse",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", maxWidth: 900, mx: "auto" }}>
          {/* Badge */}
          <Chip
            icon={<SparkleIcon sx={{ fontSize: 18 }} />}
            label="Thư viện số hàng đầu Việt Nam"
            sx={{
              mb: 3,
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              fontWeight: 600,
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              height: 36,
              borderRadius: "18px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              "& .MuiChip-icon": { color: "#FFC107" },
            }}
          />

          {/* Main Title */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              // FIX: thêm breakpoint sm để font không nhảy quá lớn
              fontSize: {
                xs: "2rem",
                sm: "2.75rem",
                md: "3.5rem",
                lg: "4.5rem",
              },
              lineHeight: 1.15,
              color: "white",
              mb: 2,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            Thư viện số
            <Box
              component="span"
              sx={{
                display: "block",
                background: "linear-gradient(90deg, #FFC107, #FF9800)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Đại học Văn Lang
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 400,
              mb: { xs: 4, md: 5 },
              // FIX: giảm font nhỏ hơn ở xs để không wrap xấu
              fontSize: { xs: "1rem", sm: "1.125rem", md: "1.375rem" },
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Kho tàng tri thức số - Kết nối tương lai học thuật. Truy cập hàng
            nghìn tài liệu PDF, EPUB miễn phí.
          </Typography>

          {/* Search Form */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ maxWidth: 700, mx: "auto", mb: 4 }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                // FIX: column trên xs, row từ sm trở lên
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                placeholder="Tìm kiếm tài liệu, sách, luận văn..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{
                          color: searchFocused ? "#D32F2F" : "#8E8EA9",
                          transition: "color 0.3s",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "white",
                    borderRadius: "16px",
                    fontSize: { xs: "1rem", md: "1.125rem" },
                    height: { xs: 52, md: 60 },
                    boxShadow: searchFocused
                      ? "0 8px 32px rgba(0,0,0,0.2)"
                      : "0 4px 20px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    "& fieldset": { border: "none" },
                    "&:hover": { boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
                  },
                  "& input": {
                    fontWeight: 500,
                    "&::placeholder": { color: "#8E8EA9", opacity: 1 },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#1A1A2E",
                  color: "white",
                  borderRadius: "16px",
                  px: { xs: 3, sm: 5 },
                  height: { xs: 52, md: 60 },
                  // FIX: full-width chỉ khi column (xs), auto khi row (sm+)
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 140 },
                  fontSize: { xs: "1rem", md: "1.0625rem" },
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 4px 20px rgba(26,26,46,0.4)",
                  "&:hover": {
                    bgcolor: "#2D2D44",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 30px rgba(26,26,46,0.5)",
                  },
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                Tìm kiếm
              </Button>
            </Box>
          </Box>

          {/* Popular Tags */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <TrendingIcon
                sx={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }}
              />
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                }}
              >
                Xu hướng tìm kiếm:
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              {popularTags.map((tag) => (
                <Chip
                  key={tag.label}
                  label={tag.label}
                  onClick={() => handleTagClick(tag.label)}
                  sx={{
                    bgcolor: alpha(tag.color, 0.2),
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    height: 36,
                    borderRadius: "18px",
                    border: `1px solid ${alpha(tag.color, 0.4)}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(tag.color, 0.35),
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 15px ${alpha(tag.color, 0.4)}`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Quick Stats */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              // FIX: gap nhỏ hơn trên xs, wrap nếu cần
              gap: { xs: 2, sm: 4, md: 6 },
              flexWrap: "wrap",
              mt: { xs: 5, md: 6 },
              pt: { xs: 3, md: 4 },
              borderTop: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {[
              { value: "10,000+", label: "Tài liệu" },
              { value: "5,000+", label: "Thành viên" },
              { value: "50,000+", label: "Lượt tải" },
            ].map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  textAlign: "center",
                  // FIX: minWidth để không bị squeeze quá hẹp
                  minWidth: { xs: 80, sm: "auto" },
                }}
              >
                <Typography
                  sx={{
                    // FIX: font nhỏ hơn ở xs để 3 stats vừa 1 hàng
                    fontSize: { xs: "1.25rem", sm: "1.625rem", md: "2rem" },
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: { xs: "0.8125rem", sm: "0.9375rem" },
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Bottom Wave */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: { xs: 50, md: 80 },
          background: "#FAFAFA",
          clipPath: "ellipse(75% 100% at 50% 100%)",
        }}
      />
    </Box>
  );
};

export default HeroSection;
