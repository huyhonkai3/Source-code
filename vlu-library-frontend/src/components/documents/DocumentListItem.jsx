import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Chip,
  Rating,
  Button,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useDownload from "../../hooks/useDownload";

/**
 * DocumentListItem Component
 * Display document information in horizontal list layout
 *
 * @param {Object} document - Document object
 */
const DocumentListItem = ({ document }) => {
  const navigate = useNavigate();
  const { handleDownload: triggerDownload, DownloadUI } = useDownload();

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
   * Handle read online button
   */
  const handleReadOnline = (e) => {
    e.stopPropagation();
    navigate(`/documents/${document.id || document._id}/read`);
  };

  /**
   * Handle download button
   */
  const handleDownload = (e) => {
    e.stopPropagation();
    triggerDownload(document);
  };

  /**
   * Handle card click - navigate to document detail
   */
  const handleCardClick = () => {
    navigate(`/documents/${document.id || document._id}`);
  };

  // Calculate average rating (mock for now)
  const avgRating = document.avgRating || 4.5;

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 4,
          },
        }}
        onClick={handleCardClick}
      >
        {/* Left - Thumbnail */}
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", sm: 160 },
            minWidth: { sm: 160 },
            height: { xs: 200, sm: "auto" },
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

        {/* Center - Content */}
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* Category Badge */}
          <Chip
            label={
              document.category?.name ||
              document.categoryId?.name ||
              "Chưa phân loại"
            }
            size="small"
            sx={{
              alignSelf: "flex-start",
              mb: 1,
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
            }}
          />

          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {document.title}
          </Typography>

          {/* Author */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Tác giả:</strong> {document.author || "Không xác định"}
          </Typography>

          {/* Description */}
          {document.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: "1.5",
              }}
            >
              {document.description}
            </Typography>
          )}

          {/* Metadata Footer */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mt: "auto",
              color: "text.secondary",
              fontSize: "0.875rem",
            }}
          >
            {/* Publisher */}
            {document.publisher && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BusinessIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{document.publisher}</Typography>
              </Box>
            )}

            {/* Year */}
            {document.publishYear && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EventIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {document.publishYear}
                </Typography>
              </Box>
            )}

            {/* Language */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LanguageIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">Tiếng việt</Typography>
            </Box>
          </Box>
        </CardContent>

        {/* Right - Stats & Action */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: { xs: 2, sm: 2.5 },
            minWidth: { sm: 200 },
            borderLeft: { xs: "none", sm: "1px solid" },
            borderTop: { xs: "1px solid", sm: "none" },
            borderColor: "divider",
          }}
        >
          {/* Stats */}
          <Box sx={{ mb: 2 }}>
            {/* Views & Downloads */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 1.5,
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              {/* Views */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <VisibilityIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {formatNumber(document.views || 0)}
                </Typography>
              </Box>

              {/* Downloads */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <DownloadIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
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
                  sx={{ fontSize: "1.125rem" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {avgRating.toFixed(1)}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Read Online Button */}
                <Button
                  variant="contained"
                  startIcon={<ReadIcon />}
                  onClick={handleReadOnline}
                  fullWidth
                  sx={{
                    py: 1,
                    fontWeight: 600,
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
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  Tải xuống
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Download Dialogs */}
      {DownloadUI}
    </>
  );
};

export default DocumentListItem;
