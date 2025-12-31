import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Paper,
  Menu,
  MenuItem,
  alpha,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Reply as ReplyIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * CommentItem Component - VLU Design System v2.0
 * Modern & Bold comment card
 *
 * @param {Object} comment - Comment object
 * @param {string} currentUserId - ID của user hiện tại
 * @param {string} currentUserRole - Role của user hiện tại
 * @param {Function} onEdit - Callback khi click edit
 * @param {Function} onDelete - Callback khi click delete
 */
const CommentItem = ({
  comment,
  currentUserId = null,
  currentUserRole = null,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  /**
   * Get user initials for avatar
   */
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  /**
   * Format date to relative time
   */
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return "Vừa xong";
    }
  };

  /**
   * Get role badge config - Design System v2.0 colors
   */
  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return {
          label: "Quản trị viên",
          color: "#D32F2F",
          bgColor: alpha("#D32F2F", 0.1),
        };
      case "Moderator":
        return {
          label: "Kiểm duyệt viên",
          color: "#7C4DFF",
          bgColor: alpha("#7C4DFF", 0.1),
        };
      case "Author":
        return {
          label: "Tác giả",
          color: "#4CAF50",
          bgColor: alpha("#4CAF50", 0.1),
        };
      default:
        return null;
    }
  };

  /**
   * Handle menu open
   */
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle edit click
   */
  const handleEdit = () => {
    onEdit(comment);
    handleMenuClose();
  };

  /**
   * Handle delete click
   */
  const handleDelete = () => {
    onDelete(comment);
    handleMenuClose();
  };

  /**
   * Handle like toggle
   */
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  // Check permissions
  const isOwner = currentUserId && comment.user?.id === currentUserId;
  const isAdmin = currentUserRole === "Admin";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;
  const showMenu = canEdit || canDelete;

  const roleBadge = getRoleBadge(comment.user?.role);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: "16px",
        bgcolor: "white",
        boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
        border: "1px solid #F0F0F5",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(26,26,46,0.08)",
          borderColor: "#E0E0E0",
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Avatar */}
        <Avatar
          src={comment.user?.avatarUrl}
          alt={comment.user?.name}
          sx={{
            width: 44,
            height: 44,
            bgcolor: "#D32F2F",
            fontWeight: 600,
            fontSize: "1rem",
            flexShrink: 0,
          }}
        >
          {getInitials(comment.user?.name)}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {/* Name */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "#1A1A2E",
                }}
              >
                {comment.user?.name || "Người dùng"}
              </Typography>

              {/* Role Badge */}
              {roleBadge && (
                <Chip
                  label={roleBadge.label}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    bgcolor: roleBadge.bgColor,
                    color: roleBadge.color,
                    border: "none",
                  }}
                />
              )}

              {/* Separator */}
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: "#C4C4D4",
                }}
              />

              {/* Time */}
              <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>

            {/* Menu Button */}
            {showMenu && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  color: "#8E8EA9",
                  "&:hover": {
                    bgcolor: "#F0F0F5",
                    color: "#4A4A68",
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Comment Content */}
          <Typography
            variant="body2"
            sx={{
              color: "#4A4A68",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {comment.content}
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Like Button */}
            <Box
              onClick={handleLikeToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
                cursor: "pointer",
                bgcolor: isLiked ? alpha("#D32F2F", 0.08) : "transparent",
                color: isLiked ? "#D32F2F" : "#8E8EA9",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: isLiked ? alpha("#D32F2F", 0.12) : "#F0F0F5",
                },
              }}
            >
              {isLiked ? (
                <ThumbUpIcon sx={{ fontSize: 16 }} />
              ) : (
                <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
              )}
              <Typography
                variant="caption"
                sx={{ fontWeight: isLiked ? 600 : 500 }}
              >
                Thích
              </Typography>
            </Box>

            {/* Reply Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
                cursor: "pointer",
                color: "#8E8EA9",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#F0F0F5",
                  color: "#4A4A68",
                },
              }}
            >
              <ReplyIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Trả lời
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(26,26,46,0.12)",
            minWidth: 150,
          },
        }}
      >
        {canEdit && (
          <MenuItem
            onClick={handleEdit}
            sx={{
              py: 1.5,
              px: 2,
              "&:hover": {
                bgcolor: "#F0F0F5",
              },
            }}
          >
            <EditIcon sx={{ fontSize: 18, mr: 1.5, color: "#4A4A68" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Chỉnh sửa
            </Typography>
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem
            onClick={handleDelete}
            sx={{
              py: 1.5,
              px: 2,
              color: "#D32F2F",
              "&:hover": {
                bgcolor: alpha("#D32F2F", 0.08),
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Xóa
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default CommentItem;
