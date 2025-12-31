import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Chip,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * CategoryCard Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const CategoryCard = ({ category, onEdit, onDelete, viewMode = "grid" }) => {
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = [
    { from: "#7C4DFF", to: "#448AFF" },
    { from: "#2196F3", to: "#00BCD4" },
    { from: "#10B981", to: "#34D399" },
    { from: "#F59E0B", to: "#FBBF24" },
    { from: "#EC4899", to: "#F472B6" },
    { from: "#EF4444", to: "#F87171" },
  ];

  const getGradient = (name) => {
    const index = name.charCodeAt(0) % gradientColors.length;
    return gradientColors[index];
  };

  const getCategoryInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

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

  const gradient = getGradient(category.name);
  const hasDocuments = category.documentCount > 0;

  // List View Layout
  if (viewMode === "list") {
    return (
      <Card
        elevation={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: isHovered ? alpha(gradient.from, 0.3) : "#E0E0E0",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          bgcolor: "white",
          "&:hover": {
            transform: "translateX(8px)",
            boxShadow: `0 8px 24px ${alpha(gradient.from, 0.15)}`,
          },
        }}
      >
        <Avatar
          sx={{
            width: 56,
            height: 56,
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            fontSize: "1.5rem",
            fontWeight: 700,
            boxShadow: `0 4px 14px ${alpha(gradient.from, 0.4)}`,
            mr: 2.5,
          }}
        >
          {getCategoryInitial(category.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1A1A2E",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "1.125rem",
            }}
          >
            {category.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#8E8EA9",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.9375rem",
            }}
          >
            {category.description || "Chưa có mô tả"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mx: 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: hasDocuments ? gradient.from : "#8E8EA9",
                fontSize: "1.5rem",
              }}
            >
              {category.documentCount || 0}
            </Typography>
            <Typography sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}>
              Tài liệu
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}>
              Cập nhật
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#4A4A68", fontWeight: 500, fontSize: "0.875rem" }}
            >
              {getLastUpdated(category.updatedAt)}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateX(0)" : "translateX(10px)",
            transition: "all 0.2s ease",
          }}
        >
          <Tooltip title="Chỉnh sửa" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              sx={{
                bgcolor: alpha("#2196F3", 0.1),
                color: "#2196F3",
                "&:hover": { bgcolor: alpha("#2196F3", 0.2) },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
              sx={{
                bgcolor: alpha("#EF4444", 0.1),
                color: "#EF4444",
                "&:hover": { bgcolor: alpha("#EF4444", 0.2) },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
    );
  }

  // Grid View Layout
  return (
    <Card
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: "20px",
        border: "1px solid",
        borderColor: isHovered ? alpha(gradient.from, 0.3) : "#E0E0E0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        overflow: "visible",
        bgcolor: "white",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 16px 48px ${alpha(gradient.from, 0.2)}`,
        },
      }}
    >
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          borderRadius: "20px 20px 0 0",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 0.5,
          zIndex: 10,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(-10px)",
          transition: "all 0.2s ease",
        }}
      >
        <Tooltip title="Chỉnh sửa" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            sx={{
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              color: "#4A4A68",
              "&:hover": { bgcolor: alpha("#2196F3", 0.1), color: "#2196F3" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category);
            }}
            sx={{
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              color: "#4A4A68",
              "&:hover": { bgcolor: alpha("#EF4444", 0.1), color: "#EF4444" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <CardContent sx={{ flex: 1, p: 3, pt: 2.5 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            mb: 2.5,
            fontSize: "1.5rem",
            fontWeight: 700,
            boxShadow: `0 4px 14px ${alpha(gradient.from, 0.4)}`,
            transition: "transform 0.3s ease",
            transform: isHovered ? "scale(1.05) rotate(-3deg)" : "scale(1)",
          }}
        >
          {getCategoryInitial(category.name)}
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1A1A2E",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "3.2em",
            lineHeight: 1.3,
            fontSize: "1.125rem",
          }}
        >
          {category.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#8E8EA9",
            mb: 2.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.6em",
            lineHeight: 1.3,
            fontSize: "0.9375rem",
          }}
        >
          {category.description || "Chưa có mô tả"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "#F0F0F5",
          }}
        >
          <Chip
            icon={<DocumentIcon sx={{ fontSize: "16px !important" }} />}
            label={`${category.documentCount || 0} tài liệu`}
            size="small"
            sx={{
              bgcolor: hasDocuments ? alpha(gradient.from, 0.1) : "#F0F0F5",
              color: hasDocuments ? gradient.from : "#8E8EA9",
              fontWeight: 600,
              borderRadius: "8px",
              fontSize: "0.8125rem",
              "& .MuiChip-icon": {
                color: hasDocuments ? gradient.from : "#8E8EA9",
              },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: 14, color: "#C4C4D4" }} />
            <Typography sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}>
              {getLastUpdated(category.updatedAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Box
        sx={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 32,
          height: 32,
          borderRadius: "8px",
          bgcolor: alpha(gradient.from, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateX(0)" : "translateX(-10px)",
          transition: "all 0.2s ease",
        }}
      >
        <ArrowIcon sx={{ fontSize: 18, color: gradient.from }} />
      </Box>
    </Card>
  );
};

export default CategoryCard;
