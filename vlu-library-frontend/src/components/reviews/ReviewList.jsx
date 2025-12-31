import {
  Box,
  Typography,
  Avatar,
  Rating,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FormatQuote as QuoteIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * ReviewList Component - VLU Design System v2.0
 * Modern & Bold review list với cards
 *
 * @param {Array} reviews - Danh sách reviews
 * @param {boolean} loading - Loading state
 * @param {string} currentUserId - ID của user hiện tại
 * @param {string} currentUserRole - Role của user hiện tại
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
   * Get rating color
   */
  const getRatingColor = (rating) => {
    if (rating >= 4) return "#4CAF50";
    if (rating >= 3) return "#FFC107";
    return "#FF9800";
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
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#1A1A2E", mb: 3 }}
        >
          Đánh giá gần đây
        </Typography>
        {[1, 2, 3].map((n) => (
          <Paper
            key={n}
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: "16px",
              bgcolor: "white",
              border: "1px solid #F0F0F5",
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton
                  variant="text"
                  width="100%"
                  height={60}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: "20px",
          bgcolor: "white",
          boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
          border: "1px solid #F0F0F5",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            bgcolor: "#FFF8E1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StarIcon sx={{ fontSize: 40, color: "#FFC107" }} />
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
        >
          Chưa có đánh giá nào
        </Typography>
        <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
          Hãy là người đầu tiên đánh giá tài liệu này!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Section Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1A1A2E",
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <QuoteIcon sx={{ fontSize: 24, color: "#D32F2F" }} />
        Đánh giá gần đây
        <Box
          component="span"
          sx={{
            ml: 1,
            px: 1.5,
            py: 0.25,
            borderRadius: "8px",
            bgcolor: alpha("#D32F2F", 0.1),
            color: "#D32F2F",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {reviews.length}
        </Box>
      </Typography>

      {/* Reviews List */}
      {reviews.map((review, index) => {
        const isOwner = currentUserId && review.userId?.id === currentUserId;
        const isAdmin = currentUserRole === "Admin";
        const canEdit = isOwner;
        const canDelete = isOwner || isAdmin;
        const showMenu = canEdit || canDelete;

        return (
          <Paper
            key={review._id}
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: "16px",
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
              border: "1px solid #F0F0F5",
              transition: "all 0.2s ease",
              animation: "fadeInUp 0.4s ease forwards",
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
              "@keyframes fadeInUp": {
                from: {
                  opacity: 0,
                  transform: "translateY(10px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
              "&:hover": {
                boxShadow: "0 4px 16px rgba(26,26,46,0.08)",
                borderColor: "#E0E0E0",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              {/* Avatar */}
              <Avatar
                src={review.userId?.avatarUrl}
                alt={review.userId?.name}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#D32F2F",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {getInitials(review.userId?.name)}
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
                  <Box>
                    {/* Name */}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#1A1A2E",
                        lineHeight: 1.3,
                      }}
                    >
                      {review.userId?.name || "Người dùng"}
                    </Typography>

                    {/* Date */}
                    <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Rating Badge */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "8px",
                        bgcolor: alpha(getRatingColor(review.rating), 0.1),
                      }}
                    >
                      <StarIcon
                        sx={{
                          fontSize: 16,
                          color: getRatingColor(review.rating),
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: getRatingColor(review.rating),
                        }}
                      >
                        {review.rating}
                      </Typography>
                    </Box>

                    {/* Menu Button */}
                    {showMenu && (
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          handleMenuOpen(e, review, { canEdit, canDelete })
                        }
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
                </Box>

                {/* Review Content */}
                {review.content && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4A4A68",
                      lineHeight: 1.7,
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
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(26,26,46,0.12)",
            minWidth: 150,
          },
        }}
      >
        {menuPermissions.canEdit && (
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
        {menuPermissions.canDelete && (
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
    </Box>
  );
};

export default ReviewList;
