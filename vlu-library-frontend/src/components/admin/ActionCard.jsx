import { Paper, Box, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

/**
 * ActionCard Component
 * Quick action card for admin dashboard
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
  // Color mapping
  const colorMap = {
    primary: {
      main: "primary.main",
      bg: "#E3F2FD",
    },
    success: {
      main: "success.main",
      bg: "#E8F5E9",
    },
    warning: {
      main: "warning.main",
      bg: "#FFF3E0",
    },
    error: {
      main: "error.main",
      bg: "#FFEBEE",
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        height: "100%",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 2,
          borderColor: colors.main,
          "& .action-arrow": {
            transform: "translateX(4px)",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        {/* Icon Box */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            backgroundColor: colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.main,
            flexShrink: 0,
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
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              {title}
            </Typography>

            {/* Badge */}
            {badge !== null && (
              <Box
                sx={{
                  minWidth: 24,
                  height: 24,
                  borderRadius: "12px",
                  backgroundColor: colors.main,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 1,
                }}
              >
                <Typography variant="caption" fontWeight={700}>
                  {badge}
                </Typography>
              </Box>
            )}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
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
            color: "action.active",
            transition: "transform 0.2s ease-in-out",
          }}
        >
          <ArrowForwardIcon fontSize="small" />
        </Box>
      </Box>
    </Paper>
  );
};

export default ActionCard;
