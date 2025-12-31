import { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Chip,
  Rating,
  Button,
  IconButton,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  MenuBook as ReadIcon,
  FileDownload as FileDownloadIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Language as LanguageIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useDownload from "../../hooks/useDownload";

/**
 * DocumentListItem Component - VLU Design System v2.0.1
 * Modern & Bold horizontal card design
 * UPDATED: Tăng font sizes để UX tốt hơn (min +2px)
 *
 * @param {Object} document - Document object
 */
const DocumentListItem = ({ document }) => {
  const navigate = useNavigate();
  const { handleDownload: triggerDownload, DownloadUI } = useDownload();
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const placeholderImage =
    "https://placehold.co/400x600/1A1A2E/FFFFFF?text=VLU";

  /**
   * Get file type và styles
   */
  const getFileType = () => {
    if (!document.fileName) return "PDF";
    const ext = document.fileName.split(".").pop().toUpperCase();
    return ext;
  };

  const getFileTypeStyles = () => {
    const type = getFileType();
    switch (type) {
      case "PDF":
        return { bgcolor: "#FFEBEE", color: "#D32F2F" };
      case "DOCX":
      case "DOC":
        return { bgcolor: "#E3F2FD", color: "#1976D2" };
      case "XLSX":
      case "XLS":
        return { bgcolor: "#E8F5E9", color: "#388E3C" };
      case "EPUB":
        return { bgcolor: "#F3E5F5", color: "#7B1FA2" };
      default:
        return { bgcolor: "#F5F5F5", color: "#757575" };
    }
  };

  /**
   * Get category color
   */
  const getCategoryColor = () => {
    const categoryName =
      document.category?.name || document.categoryId?.name || "";
    const colors = {
      "Công nghệ": "#2196F3",
      "Kinh tế": "#FF7043",
      "Nghệ thuật": "#7C4DFF",
      "Khoa học": "#00BCD4",
      "Văn học": "#EC407A",
    };

    for (const [key, value] of Object.entries(colors)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return "#8E8EA9";
  };

  /**
   * Format number
   */
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const handleReadOnline = (e) => {
    e.stopPropagation();
    navigate(`/documents/${document.id || document._id}/read`);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    triggerDownload(document);
  };

  const handleCardClick = () => {
    navigate(`/documents/${document.id || document._id}`);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const avgRating = document.avgRating || document.rating || 0;
  const fileTypeStyles = getFileTypeStyles();
  const categoryColor = getCategoryColor();

  return (
    <>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "white",
          cursor: "pointer",
          boxShadow: isHovered
            ? "0 12px 40px rgba(26, 26, 46, 0.12)"
            : "0 2px 8px rgba(26, 26, 46, 0.04)",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "4px",
            background: `linear-gradient(180deg, ${categoryColor}, ${alpha(categoryColor, 0.3)})`,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          },
        }}
        onClick={handleCardClick}
      >
        {/* ========== LEFT - THUMBNAIL ========== */}
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", sm: 180 },
            minWidth: { sm: 180 },
            height: { xs: 200, sm: "auto" },
            minHeight: { sm: 220 },
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={document.coverImage || placeholderImage}
            alt={document.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: "#F0F0F5",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />

          {/* File Type Badge */}
          <Chip
            label={getFileType()}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              fontWeight: 700,
              fontSize: "0.75rem", // UPDATED: 12px (was 11px)
              height: 26,
              borderRadius: "6px",
              ...fileTypeStyles,
            }}
          />

          {/* Bookmark Button - Mobile */}
          <IconButton
            onClick={handleBookmark}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: isBookmarked ? "#D32F2F" : "rgba(255,255,255,0.95)",
              color: isBookmarked ? "white" : "#8E8EA9",
              width: 36,
              height: 36,
              display: { xs: "flex", sm: "none" },
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "&:hover": {
                bgcolor: isBookmarked ? "#B71C1C" : "white",
              },
            }}
          >
            {isBookmarked ? (
              <BookmarkIcon sx={{ fontSize: 18 }} />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>

        {/* ========== CENTER - CONTENT ========== */}
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: { xs: 2.5, sm: 3 },
            minWidth: 0,
          }}
        >
          {/* Top Row - Category & Bookmark */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1.5,
            }}
          >
            <Chip
              label={
                document.category?.name ||
                document.categoryId?.name ||
                "Chưa phân loại"
              }
              size="small"
              sx={{
                bgcolor: alpha(categoryColor, 0.1),
                color: categoryColor,
                fontWeight: 700,
                fontSize: "0.75rem", // UPDATED: 12px (was 11px)
                height: 28,
                borderRadius: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            />

            {/* Bookmark - Desktop */}
            <IconButton
              onClick={handleBookmark}
              sx={{
                display: { xs: "none", sm: "flex" },
                color: isBookmarked ? "#D32F2F" : "#C4C4D4",
                opacity: isHovered || isBookmarked ? 1 : 0,
                transform:
                  isHovered || isBookmarked
                    ? "translateX(0)"
                    : "translateX(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  color: "#D32F2F",
                  bgcolor: alpha("#D32F2F", 0.1),
                },
              }}
            >
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              mb: 0.75,
              fontSize: { xs: "1.0625rem", sm: "1.1875rem" }, // UPDATED: 17px/19px (was 16px/18px)
              lineHeight: 1.35,
              color: "#1A1A2E",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {document.title}
          </Typography>

          {/* Author */}
          <Typography
            variant="body2"
            sx={{
              color: "#4A4A68",
              mb: 1.5,
              fontSize: "0.9375rem", // UPDATED: 15px (was 14px)
            }}
          >
            <Box component="span" sx={{ color: "#8E8EA9" }}>
              Tác giả:
            </Box>{" "}
            <Box component="span" sx={{ fontWeight: 500 }}>
              {document.author || "Chưa xác định"}
            </Box>
          </Typography>

          {/* Description */}
          {document.description && (
            <Typography
              variant="body2"
              sx={{
                color: "#8E8EA9",
                mb: 2,
                fontSize: "0.875rem", // UPDATED: 14px (was 13px)
                lineHeight: 1.6,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {document.description}
            </Typography>
          )}

          {/* Metadata Row */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 3 },
              mt: "auto",
              pt: 2,
              borderTop: "1px solid #F0F0F5",
            }}
          >
            {/* Views */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <VisibilityIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
              <Typography
                sx={{
                  color: "#4A4A68",
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                }} // UPDATED: 13px (was 12px)
              >
                {formatNumber(document.views || 0)}
              </Typography>
            </Box>

            {/* Downloads */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <DownloadIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
              <Typography
                sx={{
                  color: "#4A4A68",
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                }} // UPDATED: 13px (was 12px)
              >
                {formatNumber(document.downloads || 0)}
              </Typography>
            </Box>

            {/* Rating */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating
                value={avgRating}
                precision={0.5}
                size="small"
                readOnly
                sx={{
                  fontSize: "1.125rem", // UPDATED: 18px (was 16px)
                  "& .MuiRating-iconFilled": { color: "#FFC107" },
                }}
              />
              <Typography
                sx={{ color: "#4A4A68", fontWeight: 600, fontSize: "0.875rem" }} // UPDATED: 14px (was 12px)
              >
                {avgRating.toFixed(1)}
              </Typography>
            </Box>

            {/* Year */}
            {document.publishYear && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <EventIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                <Typography
                  sx={{
                    color: "#4A4A68",
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                  }} // UPDATED: 13px (was 12px)
                >
                  {document.publishYear}
                </Typography>
              </Box>
            )}

            {/* Publisher */}
            {document.publisher && (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <BusinessIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                <Typography
                  sx={{
                    color: "#4A4A68",
                    fontWeight: 500,
                    fontSize: "0.8125rem", // UPDATED: 13px (was 12px)
                    maxWidth: 150,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {document.publisher}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        {/* ========== RIGHT - ACTIONS ========== */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            justifyContent: { xs: "stretch", sm: "center" },
            alignItems: "stretch",
            gap: 1.5,
            p: { xs: 2, sm: 3 },
            borderLeft: { xs: "none", sm: "1px solid #F0F0F5" },
            borderTop: { xs: "1px solid #F0F0F5", sm: "none" },
            minWidth: { sm: 180 },
            bgcolor: {
              xs: "transparent",
              sm: isHovered ? "#FAFAFC" : "transparent",
            },
            transition: "background-color 0.3s ease",
          }}
        >
          {/* Read Online Button */}
          <Button
            variant="contained"
            startIcon={<ReadIcon />}
            onClick={handleReadOnline}
            fullWidth
            sx={{
              bgcolor: "#D32F2F",
              color: "white",
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.9375rem", // UPDATED: 15px (was 14px)
              textTransform: "none",
              boxShadow: isHovered ? "0 4px 14px rgba(211,47,47,0.3)" : "none",
              "&:hover": {
                bgcolor: "#B71C1C",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Đọc Online
          </Button>

          {/* Download Button */}
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleDownload}
            fullWidth
            sx={{
              borderColor: "#E0E0E0",
              color: "#4A4A68",
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.9375rem", // UPDATED: 15px (was 14px)
              textTransform: "none",
              bgcolor: "white",
              "&:hover": {
                borderColor: "#D32F2F",
                color: "#D32F2F",
                bgcolor: alpha("#D32F2F", 0.04),
              },
              transition: "all 0.2s ease",
            }}
          >
            Tải xuống
          </Button>

          {/* View Details - Desktop only */}
          <Button
            endIcon={<ArrowIcon />}
            onClick={handleCardClick}
            sx={{
              display: { xs: "none", sm: "flex" },
              color: "#8E8EA9",
              fontWeight: 500,
              fontSize: "0.875rem", // UPDATED: 14px (was 13px)
              textTransform: "none",
              justifyContent: "center",
              mt: 0.5,
              "&:hover": {
                color: "#D32F2F",
                bgcolor: "transparent",
                "& .MuiButton-endIcon": {
                  transform: "translateX(4px)",
                },
              },
              "& .MuiButton-endIcon": {
                transition: "transform 0.2s ease",
              },
            }}
          >
            Chi tiết
          </Button>
        </Box>
      </Card>

      {/* Download Dialogs */}
      {DownloadUI}
    </>
  );
};

export default DocumentListItem;
