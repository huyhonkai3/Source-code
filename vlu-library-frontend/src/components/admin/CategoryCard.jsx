import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * CategoryCard Component
 * Display category information with edit/delete actions
 *
 * @param {Object} category - Category data
 * @param {Function} onEdit - Edit handler
 * @param {Function} onDelete - Delete handler
 */
const CategoryCard = ({ category, onEdit, onDelete }) => {
  // Category icon colors (can be randomized or based on category)
  const iconColors = [
    "#1976d2", // Blue
    "#2e7d32", // Green
    "#9c27b0", // Purple
    "#ed6c02", // Orange
  ];

  // Get color based on category name
  const getIconColor = (name) => {
    const index = name.charCodeAt(0) % iconColors.length;
    return iconColors[index];
  };

  // Get category icon (can be customized based on category type)
  const getCategoryIcon = (name) => {
    const firstChar = name.charAt(0).toUpperCase();
    return firstChar;
  };

  // Format last updated time
  const getLastUpdated = (date) => {
    if (!date) return "N/A";

    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Action Buttons - Top Right */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 0.5,
          zIndex: 1,
        }}
      >
        <Tooltip title="Chỉnh sửa">
          <IconButton
            size="small"
            onClick={() => onEdit(category)}
            sx={{
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: "primary.lighter",
                color: "primary.main",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Xóa">
          <IconButton
            size="small"
            onClick={() => onDelete(category)}
            sx={{
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: "error.lighter",
                color: "error.main",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Card Content */}
      <CardContent sx={{ flex: 1, pt: 3 }}>
        {/* Category Icon */}
        <Avatar
          sx={{
            width: 48,
            height: 48,
            backgroundColor: getIconColor(category.name),
            mb: 2,
            fontSize: "1.25rem",
            fontWeight: "bold",
          }}
        >
          {getCategoryIcon(category.name)}
        </Avatar>

        {/* Category Name */}
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "3.6em",
          }}
        >
          {category.name}
        </Typography>

        {/* Description */}
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
            minHeight: "2.8em",
          }}
        >
          {category.description || "Chưa có mô tả"}
        </Typography>

        {/* Footer Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          {/* Document Count */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="h6" color="error.main" fontWeight="bold">
              {category.documentCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tài liệu
            </Typography>
            <ArrowIcon
              sx={{
                fontSize: 16,
                color: "error.main",
                ml: 0.5,
              }}
            />
          </Box>

          {/* Last Updated */}
          <Typography variant="caption" color="text.secondary">
            Cập nhật: {getLastUpdated(category.updatedAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
