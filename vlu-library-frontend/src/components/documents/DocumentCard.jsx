import { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Rating,
  IconButton,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/**
 * DocumentCard Component - VLU Design System v2.0.1
 * Modern & Bold design với hover effects, visual-first approach
 * UPDATED: Tăng font sizes để UX tốt hơn (min +2px)
 *
 * @param {Object} document - Document object
 */
const DocumentCard = ({ document }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Placeholder image với gradient
  const placeholderImage =
    "https://placehold.co/400x600/1A1A2E/FFFFFF?text=VLU";

  /**
   * Get file type label based on fileName extension
   */
  const getFileType = () => {
    if (!document.fileName) return "PDF";
    const ext = document.fileName.split(".").pop().toUpperCase();
    return ext;
  };

  /**
   * Get file type color và background
   */
  const getFileTypeStyles = () => {
    const type = getFileType();
    switch (type) {
      case "PDF":
        return {
          bgcolor: "#FFEBEE",
          color: "#D32F2F",
        };
      case "DOCX":
      case "DOC":
        return {
          bgcolor: "#E3F2FD",
          color: "#1976D2",
        };
      case "XLSX":
      case "XLS":
        return {
          bgcolor: "#E8F5E9",
          color: "#388E3C",
        };
      case "EPUB":
        return {
          bgcolor: "#F3E5F5",
          color: "#7B1FA2",
        };
      default:
        return {
          bgcolor: "#F5F5F5",
          color: "#757575",
        };
    }
  };

  /**
   * Get category color based on name
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
   * Format number to K/M format
   */
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString() || "0";
  };

  /**
   * Handle card click - navigate to document detail
   */
  const handleClick = () => {
    navigate(`/documents/${document.id || document._id}`);
  };

  /**
   * Handle bookmark toggle
   */
  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  /**
   * Handle quick read
   */
  const handleQuickRead = (e) => {
    e.stopPropagation();
    navigate(`/documents/${document.id || document._id}/read`);
  };

  const avgRating = document.rating || document.avgRating || 0;
  const fileTypeStyles = getFileTypeStyles();
  const categoryColor = getCategoryColor();

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: isHovered
          ? "0 16px 48px rgba(26, 26, 46, 0.15)"
          : "0 2px 8px rgba(26, 26, 46, 0.06)",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${categoryColor}, ${alpha(categoryColor, 0.5)})`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        },
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* ========== IMAGE CONTAINER ========== */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "3/4",
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
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />

          {/* Gradient Overlay on Hover */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: isHovered
                ? "linear-gradient(0deg, rgba(26,26,46,0.8) 0%, rgba(26,26,46,0) 60%)"
                : "linear-gradient(0deg, rgba(26,26,46,0.4) 0%, rgba(26,26,46,0) 40%)",
              transition: "all 0.3s ease",
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
              letterSpacing: "0.02em",
              height: 26,
              borderRadius: "6px",
              ...fileTypeStyles,
            }}
          />

          {/* Bookmark Button */}
          <IconButton
            component="span"
            onClick={handleBookmark}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: isBookmarked ? "#D32F2F" : "rgba(255,255,255,0.9)",
              color: isBookmarked ? "white" : "#8E8EA9",
              width: 36,
              height: 36,
              opacity: isHovered || isBookmarked ? 1 : 0,
              transform:
                isHovered || isBookmarked
                  ? "translateY(0)"
                  : "translateY(-10px)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "&:hover": {
                bgcolor: isBookmarked ? "#B71C1C" : "white",
                transform: "scale(1.1)",
              },
            }}
          >
            {isBookmarked ? (
              <BookmarkIcon sx={{ fontSize: 20 }} />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>

          {/* Quick Read Button - Center */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: isHovered
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0.8)",
              opacity: isHovered ? 1 : 0,
              transition: "all 0.3s ease",
            }}
          >
            <IconButton
              component="span"
              onClick={handleQuickRead}
              sx={{
                bgcolor: "white",
                color: "#D32F2F",
                width: 56,
                height: 56,
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                "&:hover": {
                  bgcolor: "#D32F2F",
                  color: "white",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <PlayIcon sx={{ fontSize: 28, ml: 0.5 }} />
            </IconButton>
          </Box>

          {/* Stats Overlay - Bottom */}
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              display: "flex",
              gap: 1.5,
              opacity: isHovered ? 1 : 0.8,
              transition: "opacity 0.3s ease",
            }}
          >
            {/* Views */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "white",
                fontSize: "0.8125rem", // UPDATED: 13px (was 12px)
                fontWeight: 500,
              }}
            >
              <VisibilityIcon sx={{ fontSize: 16 }} />
              {formatNumber(document.views || 0)}
            </Box>

            {/* Downloads */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "white",
                fontSize: "0.8125rem", // UPDATED: 13px (was 12px)
                fontWeight: 500,
              }}
            >
              <DownloadIcon sx={{ fontSize: 16 }} />
              {formatNumber(document.downloads || 0)}
            </Box>
          </Box>
        </Box>

        {/* ========== CONTENT ========== */}
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
            pt: 2.5,
          }}
        >
          {/* Category */}
          <Typography
            variant="overline"
            sx={{
              color: categoryColor,
              fontWeight: 700,
              fontSize: "0.75rem", // UPDATED: 12px (was 10px)
              letterSpacing: "0.08em",
              mb: 0.75,
              lineHeight: 1,
            }}
          >
            {document.category?.name ||
              document.categoryId?.name ||
              "Chưa phân loại"}
          </Typography>

          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              mb: 0.75,
              fontSize: "1.0625rem", // UPDATED: 17px (was 16px)
              lineHeight: 1.35,
              color: "#1A1A2E",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.7em",
            }}
          >
            {document.title}
          </Typography>

          {/* Author */}
          <Typography
            variant="body2"
            sx={{
              color: "#4A4A68",
              fontSize: "0.875rem", // UPDATED: 14px (was 13px)
              mb: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {document.author || "Tác giả chưa xác định"}
          </Typography>

          {/* Bottom Row - Rating & Year */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: "auto",
              pt: 1.5,
              borderTop: "1px solid #F0F0F5",
            }}
          >
            {/* Rating */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Rating
                value={avgRating}
                precision={0.5}
                size="small"
                readOnly
                sx={{
                  fontSize: "1.125rem", // UPDATED: 18px (was 16px)
                  "& .MuiRating-iconFilled": {
                    color: "#FFC107",
                  },
                  "& .MuiRating-iconEmpty": {
                    color: "#E0E0E0",
                  },
                }}
              />
              <Typography
                sx={{
                  color: "#4A4A68",
                  fontWeight: 600,
                  fontSize: "0.875rem", // UPDATED: 14px (was 13px)
                }}
              >
                {avgRating.toFixed(1)}
              </Typography>
            </Box>

            {/* Year */}
            {document.publishYear && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "#8E8EA9",
                }}
              >
                <CalendarIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontWeight: 500, fontSize: "0.8125rem" }}>
                  {" "}
                  {/* UPDATED: 13px (was 12px) */}
                  {document.publishYear}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DocumentCard;
