import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * CommentItem Component
 * Hiển thị một bình luận
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
   * Get role badge config
   */
  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return {
          label: "Quản trị viên",
          color: "error",
          variant: "filled",
        };
      case "Moderator":
        return {
          label: "Kiểm duyệt viên",
          color: "warning",
          variant: "filled",
        };
      case "Author":
        return {
          label: "Tác giả",
          color: "primary",
          variant: "outlined",
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

  // Check permissions
  const isOwner = currentUserId && comment.user?.id === currentUserId;
  const isAdmin = currentUserRole === "Admin";
  const canEdit = isOwner; // Only owner can edit
  const canDelete = isOwner || isAdmin; // Owner or Admin can delete
  const showMenu = canEdit || canDelete;

  const roleBadge = getRoleBadge(comment.user?.role);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        "&:hover": {
          boxShadow: 1,
        },
        transition: "box-shadow 0.2s",
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Avatar */}
        <Avatar
          src={comment.user?.avatarUrl}
          alt={comment.user?.name}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: "primary.main",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {getInitials(comment.user?.name)}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          {/* Header: Name, Role, Time, Menu */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {comment.user?.name || "Người dùng"}
              </Typography>

              {/* Role Badge */}
              {roleBadge && (
                <Chip
                  label={roleBadge.label}
                  color={roleBadge.color}
                  variant={roleBadge.variant}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                  }}
                />
              )}

              <Typography variant="caption" color="text.secondary">
                •
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>

            {/* Menu Button (Only if has permissions) */}
            {showMenu && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: "action.hover",
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
              color: "text.secondary",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {comment.content}
          </Typography>

          {/* Actions (Like - Optional for future) */}
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <ThumbUpIcon fontSize="small" sx={{ fontSize: 16 }} />
              <Typography variant="caption">Thích</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <Typography variant="caption">Trả lời</Typography>
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
      >
        {/* Edit - Only for owner */}
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Chỉnh sửa
          </MenuItem>
        )}

        {/* Delete - For owner or Admin */}
        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Xóa
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default CommentItem;
