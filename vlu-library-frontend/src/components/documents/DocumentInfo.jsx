import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Card,
  CardMedia,
  Stack,
  Divider,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  MenuBook as ReadIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Business as PublisherIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * DocumentInfo Component
 * Hero section hiển thị thông tin chính của tài liệu
 */
const DocumentInfo = ({
  document,
  onRead,
  onDownload,
  onCategoryClick,
  isAuthenticated = false,
}) => {
  const placeholderImage = "https://placehold.co/600x400";

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return "";
    }
  };

  const getFileType = () => {
    if (!document.fileName) return "PDF";
    return document.fileName.split(".").pop().toUpperCase();
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={4}>
        {/* Left - Cover Image */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <CardMedia
              component="img"
              image={document.coverImage || placeholderImage}
              alt={document.title}
              sx={{
                width: "100%",
                height: "auto",
                aspectRatio: "3/4",
                objectFit: "cover",
                backgroundColor: "grey.100",
              }}
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
            <Chip
              label={getFileType()}
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                fontWeight: "bold",
              }}
            />
          </Card>
        </Grid>

        {/* Right - Info */}
        <Grid item xs={12} md={9}>
          {document.category && (
            <Chip
              label={document.category.name}
              clickable
              onClick={() =>
                onCategoryClick && onCategoryClick(document.category.id)
              }
              sx={{ mb: 2, fontWeight: 600 }}
            />
          )}

          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            {document.title}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
            {document.author && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Tác giả:</strong> {document.author}
                </Typography>
              </Box>
            )}
            {document.publisher && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <PublisherIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>NXB:</strong> {document.publisher}
                </Typography>
              </Box>
            )}
            {document.publishYear && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Năm:</strong> {document.publishYear}
                </Typography>
              </Box>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={3}
            sx={{ mb: 3, py: 2, px: 2.5, bgcolor: "grey.50", borderRadius: 1 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <VisibilityIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {formatNumber(document.views)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lượt xem
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <DownloadIcon color="success" />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {formatNumber(document.downloads)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lượt tải
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <StarIcon sx={{ color: "warning.main" }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {document.rating?.toFixed(1) || "0.0"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Đánh giá
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon color="info" />
              <Box>
                <Typography variant="body2" fontWeight="600">
                  {formatDate(document.createdAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ngày đăng
                </Typography>
              </Box>
            </Box>
          </Stack>

          {document.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {document.description}
            </Typography>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ReadIcon />}
              onClick={onRead}
              sx={{ bgcolor: "error.main", px: 4 }}
            >
              {isAuthenticated ? "Đọc trực tuyến" : "Đăng nhập để đọc"}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
              sx={{ px: 4, borderWidth: 2 }}
            >
              {isAuthenticated ? "Tải xuống" : "Đăng nhập để tải"}
            </Button>
          </Stack>

          {!isAuthenticated && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1, fontStyle: "italic" }}
            >
              * Bạn cần đăng nhập để đọc và tải tài liệu
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentInfo;
