import {
  Box,
  Typography,
  Avatar,
  Rating,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * ReviewList Component
 * Hiển thị danh sách đánh giá
 *
 * @param {Array} reviews - Danh sách reviews
 * @param {boolean} loading - Loading state
 * @param {string} currentUserId - ID của user hiện tại (để check ownership)
 * @param {string} currentUserRole - Role của user hiện tại (để check admin)
 * @param {Function} onEdit - Callback khi click edit
 * @param {Function} onDelete - Callback khi click delete
 */
const ReviewList = ({
  reviews = [],
  loading = false,
  currentUserId = null,
  currentUserRole = null,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [menuPermissions, setMenuPermissions] = useState({
    canEdit: false,
    canDelete: false,
  });

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
   * Handle menu open
   */
  const handleMenuOpen = (event, review, permissions) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
    setMenuPermissions(permissions);
  };

  /**
   * Handle menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
    setMenuPermissions({ canEdit: false, canDelete: false });
  };

  /**
   * Handle edit click
   */
  const handleEdit = () => {
    if (onEdit && selectedReview) {
      onEdit(selectedReview);
    }
    handleMenuClose();
  };

  /**
   * Handle delete click
   */
  const handleDelete = () => {
    if (onDelete && selectedReview) {
      onDelete(selectedReview);
    }
    handleMenuClose();
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Đang tải đánh giá...
        </Typography>
      </Box>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Chưa có đánh giá nào
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Hãy là người đầu tiên đánh giá tài liệu này
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2,
        }}
      >
        Đánh giá gần đây
      </Typography>

      {reviews.map((review) => {
        // Ownership check
        const isOwner = currentUserId && review.userId?.id === currentUserId;

        // Permission checks
        const isAdmin = currentUserRole === "Admin";
        const canEdit = isOwner; // Only owner can edit
        const canDelete = isOwner || isAdmin; // Owner or Admin can delete

        // Show menu if user has any permission
        const showMenu = canEdit || canDelete;

        return (
          <Paper
            key={review._id}
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
            {/* User Info */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              {/* Avatar */}
              <Avatar
                src={review.userId?.avatarUrl}
                alt={review.userId?.name}
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: "primary.main",
                  fontWeight: 600,
                }}
              >
                {getInitials(review.userId?.name)}
              </Avatar>

              {/* Content */}
              <Box sx={{ flex: 1 }}>
                {/* Name and Rating */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      {review.userId?.name || "Người dùng"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Star Rating */}
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      icon={<StarIcon fontSize="inherit" />}
                      emptyIcon={
                        <StarIcon
                          fontSize="inherit"
                          sx={{ color: "grey.300" }}
                        />
                      }
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#FFA500",
                        },
                      }}
                    />

                    {/* Menu Button (Only if has permissions) */}
                    {showMenu && (
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          handleMenuOpen(e, review, { canEdit, canDelete })
                        }
                        sx={{
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Review Content */}
                {review.content && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {review.content}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        );
      })}

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
        {menuPermissions.canEdit && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Chỉnh sửa
          </MenuItem>
        )}

        {/* Delete - For owner or Admin */}
        {menuPermissions.canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Xóa
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ReviewList;
