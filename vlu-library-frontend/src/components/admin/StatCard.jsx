import { Paper, Box, Typography } from "@mui/material";
import { TrendingUp as TrendingUpIcon } from "@mui/icons-material";

/**
 * StatCard Component
 * Reusable statistics card for admin dashboard
 *
 * @param {string} title - Card title/label
 * @param {string|number} value - Main value to display
 * @param {ReactNode} icon - Icon component
 * @param {string} color - Theme color (primary, success, warning, error, info)
 * @param {Object} trend - Optional trend data { value: '+5%', direction: 'up' }
 * @param {function} onClick - Optional click handler
 * @param {boolean} clickable - Whether card is clickable
 * @param {string} subtitle - Optional subtitle text
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
}) => {
  // Color mapping
  const colorMap = {
    primary: {
      main: "primary.main",
      light: "primary.lighter",
      bg: "#E3F2FD",
    },
    success: {
      main: "success.main",
      light: "success.lighter",
      bg: "#E8F5E9",
    },
    warning: {
      main: "warning.main",
      light: "warning.lighter",
      bg: "#FFF3E0",
    },
    error: {
      main: "error.main",
      light: "error.lighter",
      bg: "#FFEBEE",
    },
    info: {
      main: "info.main",
      light: "info.lighter",
      bg: "#E1F5FE",
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper
      elevation={0}
      onClick={clickable ? onClick : undefined}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": clickable
          ? {
              transform: "translateY(-2px)",
              boxShadow: 2,
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
        {/* Icon Box */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            backgroundColor: colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.main,
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
              color: trend.direction === "up" ? "success.main" : "error.main",
              backgroundColor:
                trend.direction === "up" ? "success.lighter" : "error.lighter",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <TrendingUpIcon
              fontSize="small"
              sx={{
                transform:
                  trend.direction === "down" ? "rotate(180deg)" : "none",
              }}
            />
            <Typography variant="caption" fontWeight={600}>
              {trend.value}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Value and Title */}
      <Box>
        <Typography
          variant="h3"
          fontWeight="bold"
          color={colors.main}
          sx={{
            mb: 0.5,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.disabled"
            display="block"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default StatCard;
