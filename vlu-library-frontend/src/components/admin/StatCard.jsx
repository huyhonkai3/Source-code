import { Paper, Box, Typography, alpha, Skeleton } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";

/**
 * StatCard Component - VLU Design System v2.0.1
 * Modern & Bold statistics card for admin dashboard
 * UPDATED: Tăng font sizes để UX tốt hơn
 *
 * @param {string} title - Card title/label
 * @param {string|number} value - Main value to display
 * @param {ReactNode} icon - Icon component
 * @param {string} color - Theme color (primary, success, warning, error, info)
 * @param {Object} trend - Optional trend data { value: '+5%', direction: 'up' }
 * @param {function} onClick - Optional click handler
 * @param {boolean} clickable - Whether card is clickable
 * @param {string} subtitle - Optional subtitle text
 * @param {boolean} loading - Loading state
 */
const StatCard = ({
  title,
  value,
  icon,
  color = "primary",
  trend = null,
  onClick,
  clickable = false,
  subtitle = null,
  loading = false,
}) => {
  // Color mapping - Design System v2.0
  const colorMap = {
    primary: {
      main: "#2196F3",
      gradient: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)",
    },
    success: {
      main: "#4CAF50",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
    },
    warning: {
      main: "#FF9800",
      gradient: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)",
    },
    error: {
      main: "#D32F2F",
      gradient: "linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)",
    },
    info: {
      main: "#7C4DFF",
      gradient: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)",
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper
      elevation={0}
      onClick={clickable ? onClick : undefined}
      sx={{
        p: 3,
        borderRadius: "16px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
        border: "1px solid #F0F0F5",
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": clickable
          ? {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 24px rgba(26,26,46,0.12)",
              borderColor: colors.main,
            }
          : {},
      }}
    >
      {/* Header with icon and trend */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Icon Box with Gradient */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "14px",
            background: colors.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: `0 4px 14px ${alpha(colors.main, 0.3)}`,
          }}
        >
          {icon}
        </Box>

        {/* Trend Badge */}
        {trend && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: "8px",
              bgcolor:
                trend.direction === "up"
                  ? alpha("#4CAF50", 0.1)
                  : alpha("#D32F2F", 0.1),
              color: trend.direction === "up" ? "#4CAF50" : "#D32F2F",
            }}
          >
            {trend.direction === "up" ? (
              <TrendingUpIcon sx={{ fontSize: 16 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16 }} />
            )}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
              }}
            >
              {trend.value}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Value and Title */}
      <Box>
        {loading ? (
          <>
            <Skeleton variant="text" width={80} height={48} />
            <Skeleton variant="text" width={120} height={20} />
          </>
        ) : (
          <>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#1A1A2E",
                mb: 0.5,
                fontSize: { xs: "1.875rem", sm: "2.125rem", md: "2.375rem" }, // UPDATED: 30px/34px/38px (was 28px/32px/36px)
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#8E8EA9",
                fontWeight: 500,
                fontSize: "0.9375rem", // UPDATED: 15px (was 14px body2)
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  color: "#C4C4D4",
                  display: "block",
                  mt: 0.5,
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default StatCard;
