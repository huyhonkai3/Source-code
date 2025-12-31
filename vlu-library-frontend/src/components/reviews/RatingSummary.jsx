import { Box, Typography, LinearProgress, Paper, alpha } from "@mui/material";
import {
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";

/**
 * RatingSummary Component - VLU Design System v2.0
 * Modern & Bold rating summary với visual bars
 *
 * @param {Object} statistics - Thống kê đánh giá từ API
 */
const RatingSummary = ({ statistics }) => {
  const {
    averageRating = 0,
    totalReviews = 0,
    distribution = {},
  } = statistics || {};

  /**
   * Calculate percentage for each star level
   */
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  /**
   * Get rating label
   */
  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Xuất sắc";
    if (rating >= 4) return "Rất tốt";
    if (rating >= 3) return "Tốt";
    if (rating >= 2) return "Trung bình";
    return "Cần cải thiện";
  };

  /**
   * Get rating color
   */
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#4CAF50";
    if (rating >= 4) return "#8BC34A";
    if (rating >= 3) return "#FFC107";
    if (rating >= 2) return "#FF9800";
    return "#F44336";
  };

  const starLevels = [5, 4, 3, 2, 1];
  const starColors = {
    5: "#4CAF50",
    4: "#8BC34A",
    3: "#FFC107",
    2: "#FF9800",
    1: "#F44336",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
        border: "1px solid #F0F0F5",
      }}
    >
      {/* ========== HEADER WITH AVERAGE ========== */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
          borderBottom: "1px solid #FFE082",
          textAlign: "center",
        }}
      >
        {/* Trophy Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            mx: "auto",
            mb: 2,
            borderRadius: "14px",
            bgcolor: "rgba(255,193,7,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrophyIcon sx={{ fontSize: 28, color: "#F9A825" }} />
        </Box>

        {/* Average Score */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: getRatingColor(averageRating),
            fontSize: "3.5rem",
            lineHeight: 1,
            mb: 1,
          }}
        >
          {averageRating ? averageRating.toFixed(1) : "0.0"}
        </Typography>

        {/* Star Icons */}
        <Box
          sx={{ display: "flex", gap: 0.5, justifyContent: "center", mb: 1.5 }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              sx={{
                fontSize: 24,
                color:
                  star <= Math.round(averageRating) ? "#FFC107" : "#E0E0E0",
                transition: "color 0.2s ease",
              }}
            />
          ))}
        </Box>

        {/* Rating Label */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: getRatingColor(averageRating),
            mb: 0.5,
          }}
        >
          {getRatingLabel(averageRating)}
        </Typography>

        {/* Total Reviews */}
        <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
          Dựa trên {totalReviews} đánh giá
        </Typography>
      </Box>

      {/* ========== DISTRIBUTION BARS ========== */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#8E8EA9",
            display: "block",
            mb: 2,
          }}
        >
          Phân bố đánh giá
        </Typography>

        {starLevels.map((level) => {
          const count = distribution[level] || 0;
          const percentage = getPercentage(count);
          const color = starColors[level];

          return (
            <Box
              key={level}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
                "&:last-child": { mb: 0 },
              }}
            >
              {/* Star Level Label */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: 50,
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "#1A1A2E",
                    width: 12,
                  }}
                >
                  {level}
                </Typography>
                <StarIcon sx={{ fontSize: 16, color: "#FFC107" }} />
              </Box>

              {/* Progress Bar */}
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "#F0F0F5",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: color,
                      borderRadius: 5,
                      transition: "transform 0.4s ease",
                    },
                  }}
                />
              </Box>

              {/* Count & Percentage */}
              <Box sx={{ minWidth: 60, textAlign: "right" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: count > 0 ? "#1A1A2E" : "#C4C4D4",
                  }}
                >
                  {count}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#8E8EA9",
                    ml: 0.5,
                  }}
                >
                  ({percentage}%)
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default RatingSummary;
