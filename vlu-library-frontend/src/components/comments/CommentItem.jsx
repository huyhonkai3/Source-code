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
  Collapse,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import commentsAPI from "../../api/comments.api";
import ReplyForm from "./ReplyForm";

/**
 * CommentItem Component - VLU Design System v2.0
 * Modern & Bold comment card with Like và Nested Reply support
 *
 * @param {Object} comment - Comment object (includes likes array, parentId)
 * @param {Array} replies - Mảng các replies của comment này (chỉ có ở root comment)
 * @param {string} currentUserId - ID của user hiện tại
 * @param {string} currentUserRole - Role của user hiện tại
 * @param {Object} currentUser - Current user object (for ReplyForm)
 * @param {Function} onEdit - Callback khi click edit
 * @param {Function} onDelete - Callback khi click delete
 * @param {Function} onReply - Callback khi submit reply (content, parentId)
 * @param {Function} onLoginRequired - Callback khi cần đăng nhập (optional)
 * @param {boolean} isChild - True nếu đây là reply (Level 2)
 */
const CommentItem = ({
  comment,
  replies = [],
  currentUserId = null,
  currentUserRole = null,
  currentUser = null,
  onEdit,
  onDelete,
  onReply,
  onLoginRequired,
  isChild = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Reply state
  const [isReplying, setIsReplying] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  // Replies collapse state (cho root comment)
  const [showReplies, setShowReplies] = useState(true);

  /**
   * Initialize like state từ comment props
   */
  useEffect(() => {
    if (comment) {
      const userLiked = comment.likes?.some(
        (likeUserId) =>
          likeUserId === currentUserId ||
          likeUserId?.toString() === currentUserId,
      );
      setIsLiked(!!userLiked);
      setLikeCount(comment.likes?.length || comment.likeCount || 0);
    }
  }, [comment, currentUserId]);

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

  // Menu handlers
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    onEdit(comment);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(comment);
    handleMenuClose();
  };

  /**
   * Handle like toggle - Optimistic Update
   */
  const handleLikeToggle = async () => {
    if (!currentUserId) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        alert("Vui lòng đăng nhập để thích bình luận");
      }
      return;
    }

    if (isLikeLoading) return;

    const prevIsLiked = isLiked;
    const prevLikeCount = likeCount;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    setIsLikeLoading(true);

    try {
      const commentId = comment._id || comment.id;
      await commentsAPI.toggleLike(commentId);
    } catch (error) {
      console.error("Toggle like error:", error);
      setIsLiked(prevIsLiked);
      setLikeCount(prevLikeCount);
    } finally {
      setIsLikeLoading(false);
    }
  };

  /**
   * Handle reply button click
   */
  const handleReplyClick = () => {
    if (!currentUserId) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        alert("Vui lòng đăng nhập để trả lời bình luận");
      }
      return;
    }
    setIsReplying(true);
  };

  /**
   * Handle submit reply
   */
  const handleSubmitReply = async (content) => {
    setReplyLoading(true);
    try {
      const commentId = comment._id || comment.id;
      await onReply(content, commentId);
      setIsReplying(false);
    } catch (error) {
      console.error("Submit reply error:", error);
    } finally {
      setReplyLoading(false);
    }
  };

  /**
   * Handle cancel reply
   */
  const handleCancelReply = () => {
    setIsReplying(false);
  };

  // Check permissions
  const isOwner =
    currentUserId &&
    (comment.user?.id === currentUserId || comment.user?._id === currentUserId);
  const isAdmin = currentUserRole === "Admin";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;
  const showMenu = canEdit || canDelete;

  const roleBadge = getRoleBadge(comment.user?.role);

  // Chỉ cho phép reply ở root comment (không phải child)
  const canReply = !isChild && currentUserId;

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: isChild ? 2 : 3,
          mb: isChild ? 1.5 : 2,
          borderRadius: isChild ? "12px" : "16px",
          bgcolor: isChild ? "#FAFAFC" : "white",
          boxShadow: isChild ? "none" : "0 2px 8px rgba(26,26,46,0.04)",
          border: "1px solid",
          borderColor: isChild ? "#E8E8ED" : "#F0F0F5",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: isChild ? "none" : "0 4px 16px rgba(26,26,46,0.08)",
            borderColor: isChild ? "#E0E0E0" : "#E0E0E0",
          },
        }}
      >
        <Box sx={{ display: "flex", gap: isChild ? 1.5 : 2 }}>
          {/* Avatar */}
          <Avatar
            src={comment.user?.avatarUrl}
            alt={comment.user?.name}
            sx={{
              width: isChild ? 32 : 44,
              height: isChild ? 32 : 44,
              bgcolor: "#D32F2F",
              fontWeight: 600,
              fontSize: isChild ? "0.75rem" : "1rem",
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
                mb: 0.5,
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
                  variant={isChild ? "body2" : "subtitle2"}
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
                      height: isChild ? 18 : 22,
                      fontSize: isChild ? "0.65rem" : "0.7rem",
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
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    bgcolor: "#C4C4D4",
                  }}
                />

                {/* Time */}
                <Typography
                  variant="caption"
                  sx={{
                    color: "#8E8EA9",
                    fontSize: isChild ? "0.7rem" : "0.75rem",
                  }}
                >
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
                    p: isChild ? 0.5 : 1,
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
                fontSize: isChild ? "0.8125rem" : "0.875rem",
              }}
            >
              {comment.content}
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
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
                  cursor: isLikeLoading ? "wait" : "pointer",
                  bgcolor: isLiked ? alpha("#D32F2F", 0.08) : "transparent",
                  color: isLiked ? "#D32F2F" : "#8E8EA9",
                  transition: "all 0.2s ease",
                  opacity: isLikeLoading ? 0.7 : 1,
                  "&:hover": {
                    bgcolor: isLiked ? alpha("#D32F2F", 0.12) : "#F0F0F5",
                  },
                  pointerEvents: isLikeLoading ? "none" : "auto",
                }}
              >
                {isLiked ? (
                  <ThumbUpIcon sx={{ fontSize: isChild ? 14 : 16 }} />
                ) : (
                  <ThumbUpOutlinedIcon sx={{ fontSize: isChild ? 14 : 16 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isLiked ? 600 : 500,
                    fontSize: isChild ? "0.7rem" : "0.75rem",
                  }}
                >
                  {likeCount > 0 ? likeCount : ""} Thích
                </Typography>
              </Box>

              {/* Reply Button - Chỉ hiện ở root comment */}
              {canReply && (
                <Box
                  onClick={handleReplyClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: isReplying ? "#7C4DFF" : "#8E8EA9",
                    bgcolor: isReplying
                      ? alpha("#7C4DFF", 0.08)
                      : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha("#7C4DFF", 0.08),
                      color: "#7C4DFF",
                    },
                  }}
                >
                  <ReplyIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Trả lời
                  </Typography>
                </Box>
              )}

              {/* Replies Count Toggle - Chỉ hiện khi có replies */}
              {!isChild && replies.length > 0 && (
                <Box
                  onClick={() => setShowReplies(!showReplies)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#7C4DFF",
                    bgcolor: alpha("#7C4DFF", 0.05),
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha("#7C4DFF", 0.1),
                    },
                  }}
                >
                  {showReplies ? (
                    <ExpandLessIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 16 }} />
                  )}
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {replies.length} phản hồi
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Reply Form - Inline */}
            {isReplying && currentUser && (
              <ReplyForm
                user={currentUser}
                onSubmit={handleSubmitReply}
                onCancel={handleCancelReply}
                loading={replyLoading}
                replyToName={comment.user?.name}
              />
            )}
          </Box>
        </Box>

        {/* Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
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
                "&:hover": { bgcolor: "#F0F0F5" },
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
                "&:hover": { bgcolor: alpha("#D32F2F", 0.08) },
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

      {/* ========== REPLIES LIST (Level 2) ========== */}
      {!isChild && replies.length > 0 && (
        <Collapse in={showReplies}>
          <Box
            sx={{
              ml: 4,
              pl: 2,
              borderLeft: "2px solid",
              borderColor: alpha("#7C4DFF", 0.2),
            }}
          >
            {replies.map((reply) => (
              <CommentItem
                key={reply._id || reply.id}
                comment={reply}
                replies={[]} // Level 2 không có replies
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                currentUser={currentUser}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                onLoginRequired={onLoginRequired}
                isChild={true} // Đánh dấu là child comment
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default CommentItem;
