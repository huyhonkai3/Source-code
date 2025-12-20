import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Snackbar,
  Paper,
} from "@mui/material";
import {
  ChatBubbleOutline as ChatIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import commentsAPI from "../../api/comments.api";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import EditCommentDialog from "./EditCommentDialog";
import DeleteCommentDialog from "./DeleteCommentDialog";

/**
 * CommentSection Component
 * Container chính quản lý toàn bộ comment system
 *
 * @param {string} docId - ID của tài liệu
 */
const CommentSection = ({ docId }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, comment: null });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    comment: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Fetch comments
   */
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await commentsAPI.getByDocId(docId, {
        page: 1,
        limit: 20,
      });

      if (response.status === "success") {
        setComments(response.data.comments);
        setTotalCount(response.data.pagination.totalComments);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải bình luận",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [docId]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /**
   * Handle submit comment
   */
  const handleSubmitComment = async (content) => {
    setSubmitLoading(true);

    try {
      const response = await commentsAPI.add({
        docId,
        content,
      });

      if (response.status === "success") {
        // Add new comment to top of list (optimistic update)
        setComments([response.data.comment, ...comments]);
        setTotalCount(totalCount + 1);

        // Show success message
        setSnackbar({
          open: true,
          message: "Bình luận của bạn đã được đăng",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Submit comment error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Không thể gửi bình luận. Vui lòng thử lại.";

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Handle edit comment
   */
  const handleEditComment = (comment) => {
    setEditDialog({ open: true, comment });
  };

  /**
   * Handle save edited comment
   */
  const handleSaveEdit = async (commentId, content) => {
    setEditLoading(true);

    try {
      const response = await commentsAPI.update(commentId, { content });

      if (response.status === "success") {
        // Update comment in list (optimistic update)
        setComments(
          comments.map((c) => (c._id === commentId ? { ...c, content } : c)),
        );

        // Close dialog
        setEditDialog({ open: false, comment: null });

        // Show success message
        setSnackbar({
          open: true,
          message: "Đã cập nhật bình luận",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Update comment error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Không thể cập nhật bình luận. Vui lòng thử lại.";

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Handle delete comment
   */
  const handleDeleteComment = (comment) => {
    setDeleteDialog({ open: true, comment });
  };

  /**
   * Handle confirm delete
   */
  const handleConfirmDelete = async (commentId) => {
    setDeleteLoading(true);

    try {
      const response = await commentsAPI.delete(commentId);

      if (response.status === "success") {
        // Remove comment from list (optimistic update)
        setComments(comments.filter((c) => c._id !== commentId));
        setTotalCount(totalCount - 1);

        // Close dialog
        setDeleteDialog({ open: false, comment: null });

        // Show success message
        setSnackbar({
          open: true,
          message: "Đã xóa bình luận",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Delete comment error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Không thể xóa bình luận. Vui lòng thử lại.";

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle login click
   */
  const handleLoginClick = () => {
    localStorage.setItem("redirectPath", window.location.pathname);
    navigate("/login");
  };

  /**
   * Handle close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
        }}
      >
        <ChatIcon sx={{ color: "primary.main" }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
          }}
        >
          Bình luận ({totalCount})
        </Typography>
      </Box>

      {/* Comment Form or Login Prompt */}
      {isAuthenticated ? (
        <CommentForm
          onSubmit={handleSubmitComment}
          loading={submitLoading}
          user={user}
        />
      ) : (
        <Alert
          severity="info"
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<LoginIcon />}
              onClick={handleLoginClick}
              sx={{
                bgcolor: "error.main",
                "&:hover": {
                  bgcolor: "error.dark",
                },
              }}
            >
              Đăng nhập
            </Button>
          }
          sx={{ mb: 3 }}
        >
          Đăng nhập để viết bình luận
        </Alert>
      )}

      {/* Comments List */}
      <Box sx={{ mt: 4 }}>
        {loading ? (
          // Loading state
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          // Empty state
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <ChatIcon
              sx={{
                fontSize: 64,
                color: "text.disabled",
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Chưa có bình luận nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hãy là người đầu tiên bình luận về tài liệu này
            </Typography>
          </Paper>
        ) : (
          // Comments list
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUserId={user?.id}
                currentUserRole={user?.role}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
              />
            ))}

            {/* Load More Button - Optional */}
            {totalCount > comments.length && (
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={fetchComments}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Xem thêm bình luận cũ hơn
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Edit Comment Dialog */}
      <EditCommentDialog
        open={editDialog.open}
        comment={editDialog.comment}
        onClose={() => setEditDialog({ open: false, comment: null })}
        onSave={handleSaveEdit}
        loading={editLoading}
      />

      {/* Delete Comment Dialog */}
      <DeleteCommentDialog
        open={deleteDialog.open}
        comment={deleteDialog.comment}
        onClose={() => setDeleteDialog({ open: false, comment: null })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentSection;
