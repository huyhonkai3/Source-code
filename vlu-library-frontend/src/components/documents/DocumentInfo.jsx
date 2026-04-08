import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Card,
  CardMedia,
  Stack,
  alpha,
  Alert,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  AutoStories as ReadIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Business as PublisherIcon,
  Login as LoginIcon,
  TrendingUp as TrendingIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * DocumentInfo Component - VLU Design System v2.0
 *
 * UPDATED: Phân quyền tải xuống theo copyrightType
 * - PUBLIC_DOMAIN       → Hiển thị nút Download bình thường
 * - OWN_CREATION        → Ẩn nút Download, hiển thị Alert "Closed Access"
 * - THIRD_PARTY_AUTHORIZED → Ẩn nút Download, hiển thị Alert "Closed Access"
 *
 * Logic này đồng bộ với backend guard trong downloadDocument controller.
 * Mục đích ẩn nút ở frontend là để UX rõ ràng — backend vẫn chặn độc lập
 * với mọi request thẳng qua API.
 */
const DocumentInfo = ({
  document,
  onRead,
  onDownload,
  onCategoryClick,
  isAuthenticated = false,
}) => {
  const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='533' viewBox='0 0 400 533'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231A1A2E;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%234A4A68;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='533' fill='url(%23grad)'/%3E%3Ctext x='200' y='266' font-family='Arial' font-size='48' fill='%238E8EA9' text-anchor='middle' dominant-baseline='middle'%3EVLU%3C/text%3E%3C/svg%3E`;

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

  /**
   * Kiểm tra tài liệu có được phép tải xuống không.
   * Chỉ PUBLIC_DOMAIN mới cho tải — đồng bộ với backend guard.
   * Khi isAuthenticated = false, nút sẽ redirect login trước nên
   * chưa cần kiểm tra copyright ở đây (backend sẽ chặn sau khi login).
   */
  const canDownload = document?.copyrightType === "PUBLIC_DOMAIN";

  const stats = [
    {
      icon: VisibilityIcon,
      value: formatNumber(document.views),
      label: "Lượt xem",
      color: "#2196F3",
    },
    {
      icon: DownloadIcon,
      value: formatNumber(document.downloads),
      label: "Lượt tải",
      color: "#4CAF50",
    },
    {
      icon: StarIcon,
      value: document.rating?.toFixed(1) || "0.0",
      label: "Đánh giá",
      color: "#FFC107",
    },
    {
      icon: CalendarIcon,
      value: formatDate(document.createdAt),
      label: "Ngày đăng",
      color: "#7C4DFF",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: "24px",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
        border: "1px solid #F0F0F5",
      }}
    >
      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* ── COVER IMAGE ──────────────────────────────────────────────── */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 32px rgba(26,26,46,0.12)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 16px 48px rgba(26,26,46,0.18)",
              },
            }}
          >
            <CardMedia
              component="img"
              image={document.coverImage || placeholderImage}
              alt={document.title}
              sx={{
                width: "100%",
                height: "auto",
                aspectRatio: "3/4",
                objectFit: "cover",
                backgroundColor: "#1A1A2E",
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
                fontSize: "0.75rem",
                bgcolor: getFileType() === "EPUB" ? "#FF7043" : "#D32F2F",
                color: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />

            {/* Trending Badge */}
            {document.views > 1000 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "rgba(255,255,255,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <TrendingIcon sx={{ fontSize: 18, color: "#4CAF50" }} />
              </Box>
            )}
          </Card>
        </Grid>

        {/* ── INFO ─────────────────────────────────────────────────────── */}
        <Grid item xs={12} md={9}>
          {/* Category Chip */}
          {document.category && (
            <Chip
              label={document.category.name}
              clickable
              onClick={() =>
                onCategoryClick && onCategoryClick(document.category.id)
              }
              sx={{
                mb: 2,
                fontWeight: 600,
                fontSize: "0.8125rem",
                bgcolor: alpha("#D32F2F", 0.08),
                color: "#D32F2F",
                border: "1px solid",
                borderColor: alpha("#D32F2F", 0.2),
                "&:hover": { bgcolor: alpha("#D32F2F", 0.15) },
              }}
            />
          )}

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#1A1A2E",
              mb: 2,
              fontSize: { xs: "1.5rem", md: "2rem" },
              lineHeight: 1.3,
            }}
          >
            {document.title}
          </Typography>

          {/* Meta Info Row */}
          <Stack
            direction="row"
            spacing={{ xs: 2, md: 3 }}
            sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
          >
            {document.author && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <PersonIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                <Typography variant="body2" sx={{ color: "#4A4A68" }}>
                  <Box component="span" sx={{ color: "#8E8EA9" }}>
                    Tác giả:
                  </Box>{" "}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {document.author}
                  </Box>
                </Typography>
              </Box>
            )}
            {document.publisher && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <PublisherIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                <Typography variant="body2" sx={{ color: "#4A4A68" }}>
                  <Box component="span" sx={{ color: "#8E8EA9" }}>
                    NXB:
                  </Box>{" "}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {document.publisher}
                  </Box>
                </Typography>
              </Box>
            )}
            {document.publishYear && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CalendarIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
                <Typography variant="body2" sx={{ color: "#4A4A68" }}>
                  <Box component="span" sx={{ color: "#8E8EA9" }}>
                    Năm:
                  </Box>{" "}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {document.publishYear}
                  </Box>
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Stats Bar */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, md: 3 },
              mb: 3,
              p: 2.5,
              bgcolor: "#FAFAFC",
              borderRadius: "14px",
              border: "1px solid #F0F0F5",
              flexWrap: "wrap",
            }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flex: { xs: "1 1 40%", sm: "0 0 auto" },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: alpha(stat.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ fontSize: 20, color: stat.color }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A2E",
                        fontSize: "1.125rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#8E8EA9", fontWeight: 500 }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Description */}
          {document.description && (
            <Typography
              variant="body1"
              sx={{
                color: "#4A4A68",
                mb: 3,
                lineHeight: 1.7,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {document.description}
            </Typography>
          )}

          {/* ── ACTION BUTTONS ─────────────────────────────────────────── */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: "wrap", gap: 1.5 }}
          >
            {/* Nút Đọc — luôn hiển thị */}
            <Button
              variant="contained"
              size="large"
              startIcon={isAuthenticated ? <ReadIcon /> : <LoginIcon />}
              onClick={onRead}
              sx={{
                bgcolor: "#D32F2F",
                color: "white",
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                "&:hover": {
                  bgcolor: "#B71C1C",
                  boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
                },
              }}
            >
              {isAuthenticated ? "Đọc trực tuyến" : "Đăng nhập để đọc"}
            </Button>

            {/*
             * Nút Tải xuống — chỉ hiển thị khi:
             *   1. Chưa đăng nhập (redirect login trước, backend guard sau)
             *   2. Đã đăng nhập VÀ tài liệu là PUBLIC_DOMAIN
             *
             * Với tài liệu có bản quyền (OWN_CREATION / THIRD_PARTY_AUTHORIZED):
             *   Ẩn nút + hiển thị Alert giải thích bên dưới.
             */}
            {(!isAuthenticated || canDownload) && (
              <Button
                variant="outlined"
                size="large"
                startIcon={isAuthenticated ? <DownloadIcon /> : <LoginIcon />}
                onClick={onDownload}
                sx={{
                  borderColor: "#E0E0E0",
                  color: "#4A4A68",
                  borderRadius: "12px",
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  borderWidth: 2,
                  "&:hover": {
                    borderColor: "#D32F2F",
                    borderWidth: 2,
                    color: "#D32F2F",
                    bgcolor: alpha("#D32F2F", 0.04),
                  },
                }}
              >
                {isAuthenticated ? "Tải xuống" : "Đăng nhập để tải"}
              </Button>
            )}
          </Stack>

          {/* Login Note (chưa đăng nhập) */}
          {!isAuthenticated && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 2,
                color: "#8E8EA9",
                fontStyle: "italic",
              }}
            >
              * Bạn cần đăng nhập để đọc và tải tài liệu
            </Typography>
          )}

          {/*
           * Closed Access Alert — chỉ hiển thị khi đã đăng nhập
           * VÀ tài liệu không phải PUBLIC_DOMAIN.
           *
           * Khi chưa đăng nhập: ẩn alert này vì user có thể chưa biết
           * họ có quyền gì, tránh gây hiểu nhầm trước khi họ login.
           */}
          {isAuthenticated && !canDownload && (
            <Alert
              severity="info"
              icon={<LockIcon sx={{ fontSize: 20 }} />}
              sx={{
                mt: 2,
                borderRadius: "12px",
                bgcolor: alpha("#2196F3", 0.06),
                border: "1px solid",
                borderColor: alpha("#2196F3", 0.2),
                "& .MuiAlert-icon": { color: "#2196F3" },
                "& .MuiAlert-message": { color: "#1A1A2E" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                Tài liệu thuộc dạng Closed Access
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#4A4A68", lineHeight: 1.5 }}
              >
                Tài liệu này có bản quyền và không hỗ trợ tải xuống. Bạn vẫn có
                thể đọc trực tuyến qua hệ thống.
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentInfo;
