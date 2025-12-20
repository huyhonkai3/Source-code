import {
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Rating,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/**
 * DocumentCard Component
 * Display document information in card format
 *
 * @param {Object} document - Document object
 */
const DocumentCard = ({ document }) => {
  const navigate = useNavigate();

  // Placeholder image if coverImage is null
  const placeholderImage = "https://placehold.co/600x400";

  /**
   * Get file type label based on fileName extension
   */
  const getFileType = () => {
    if (!document.fileName) return "PDF";
    const ext = document.fileName.split(".").pop().toUpperCase();
    return ext;
  };

  /**
   * Get file type color
   */
  const getFileTypeColor = () => {
    const type = getFileType();
    switch (type) {
      case "PDF":
        return "error"; // Red
      case "DOCX":
      case "DOC":
        return "primary"; // Blue
      case "XLSX":
      case "XLS":
        return "success"; // Green
      default:
        return "default"; // Grey
    }
  };

  /**
   * Format number to K/M format
   * @param {number} num
   */
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  /**
   * Handle card click - navigate to document detail
   */
  const handleClick = () => {
    navigate(`/documents/${document.id || document._id}`);
  };

  // Calculate average rating (mock for now)
  const avgRating = document.avgRating || 4.5;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
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
        {/* Image Container */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <CardMedia
            component="img"
            height="200"
            image={document.coverImage || placeholderImage}
            alt={document.title}
            sx={{
              objectFit: "cover",
              backgroundColor: "grey.100",
            }}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />

          {/* File Type Badge */}
          <Chip
            label={getFileType()}
            color={getFileTypeColor()}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          />
        </Box>

        {/* Content */}
        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
        >
          {/* Category */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              mb: 0.5,
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
              fontWeight: "bold",
              mb: 1,
              fontSize: "1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
              minHeight: "2.8em", // 2 lines
            }}
          >
            {document.title}
          </Typography>

          {/* Author */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {document.author || "Tác giả không xác định"}
          </Typography>

          {/* Stats Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              mt: "auto",
            }}
          >
            {/* Views & Downloads */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              {/* Views */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <VisibilityIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {formatNumber(document.views || 0)}
                </Typography>
              </Box>

              {/* Downloads */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <DownloadIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {formatNumber(document.downloads || 0)}
                </Typography>
              </Box>

              {/* Year */}
              {document.publishYear && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">
                    {document.publishYear}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Rating */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating
                value={avgRating}
                precision={0.5}
                size="small"
                readOnly
                sx={{ fontSize: "1rem" }}
              />
              <Typography variant="caption" color="text.secondary">
                {avgRating.toFixed(1)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DocumentCard;
