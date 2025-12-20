import { Box, Typography, LinearProgress, Paper } from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";

/**
 * RatingSummary Component
 * Hiển thị tổng quan đánh giá:
 * - Điểm trung bình (số to)
 * - Số sao hình ảnh
 * - 5 thanh progress bar cho từng mức sao
 *
 * @param {Object} statistics - Thống kê đánh giá từ API
 * @param {number} statistics.averageRating - Điểm trung bình
 * @param {number} statistics.totalReviews - Tổng số đánh giá
 * @param {Object} statistics.distribution - Phân bố {5: count, 4: count, ...}
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
   * Render star rating bars
   */
  const starLevels = [5, 4, 3, 2, 1];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "#FFF9F0",
      }}
    >
      {/* Average Rating Display */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
          pb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            mb: 1,
          }}
        >
          {averageRating ? averageRating.toFixed(1) : "0.0"}
        </Typography>

        {/* Star Icons */}
        <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              sx={{
                fontSize: 28,
                color:
                  star <= Math.round(averageRating) ? "#FFA500" : "grey.300",
              }}
            />
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary">
          trên 5.0
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Tổng cộng {totalReviews} đánh giá
        </Typography>
      </Box>

      {/* Rating Distribution Bars */}
      <Box>
        {starLevels.map((level) => {
          const count = distribution[level] || 0;
          const percentage = getPercentage(count);

          return (
            <Box
              key={level}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              {/* Star Level */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: 60,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mr: 0.5,
                  }}
                >
                  {level}
                </Typography>
                <StarIcon
                  sx={{
                    fontSize: 16,
                    color: "#FFA500",
                  }}
                />
              </Box>

              {/* Progress Bar */}
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#FFA500",
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              {/* Count */}
              <Typography
                variant="caption"
                sx={{
                  minWidth: 30,
                  textAlign: "right",
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                {count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default RatingSummary;
