import { Paper, Box, Typography, alpha } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

/**
 * ActionCard Component - VLU Design System v2.0.1
 * Modern & Bold quick action card for admin dashboard
 * UPDATED: Tăng font sizes để UX tốt hơn
 *
 * @param {string} title - Action title
 * @param {string} subtitle - Action description
 * @param {ReactNode} icon - Icon component
 * @param {string} color - Theme color (primary, success, warning, error)
 * @param {function} onClick - Click handler
 * @param {string|number} badge - Optional badge value (e.g., pending count)
 */
const ActionCard = ({
  title,
  subtitle,
  icon,
  color = "primary",
  onClick,
  badge = null,
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
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: "16px",
        height: "100%",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
        border: "1px solid #F0F0F5",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(26,26,46,0.12)",
          borderColor: colors.main,
          "& .action-arrow": {
            transform: "translateX(4px)",
            color: colors.main,
          },
          "& .icon-box": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Icon Box with Gradient */}
        <Box
          className="icon-box"
          sx={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            background: colors.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
            boxShadow: `0 4px 14px ${alpha(colors.main, 0.3)}`,
            transition: "transform 0.2s ease",
          }}
        >
          {icon}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1A1A2E",
                fontSize: "1rem", // UPDATED: 16px (was 14px subtitle1)
              }}
            >
              {title}
            </Typography>

            {/* Badge */}
            {badge !== null && badge > 0 && (
              <Box
                sx={{
                  minWidth: 24,
                  height: 24,
                  borderRadius: "8px",
                  background: colors.gradient,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 1,
                  boxShadow: `0 2px 8px ${alpha(colors.main, 0.3)}`,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem", // UPDATED: 12px (was 11px)
                  }}
                >
                  {badge > 99 ? "99+" : badge}
                </Typography>
              </Box>
            )}
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "#8E8EA9",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {/* Arrow Icon */}
        <Box
          className="action-arrow"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#C4C4D4",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowForwardIcon fontSize="small" />
        </Box>
      </Box>
    </Paper>
  );
};

export default ActionCard;
