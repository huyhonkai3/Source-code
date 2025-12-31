import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  Snackbar,
  Paper,
  Skeleton,
  alpha,
} from "@mui/material";
import {
  ChatBubbleOutline as ChatIcon,
  Login as LoginIcon,
  Forum as ForumIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import commentsAPI from "../../api/comments.api";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import EditCommentDialog from "./EditCommentDialog";
import DeleteCommentDialog from "./DeleteCommentDialog";

/**
 * CommentSection Component - VLU Design System v2.0
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
        setComments([response.data.comment, ...comments]);
        setTotalCount(totalCount + 1);

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
        setComments(
          comments.map((c) => (c._id === commentId ? { ...c, content } : c)),
        );

        setEditDialog({ open: false, comment: null });

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
        setComments(comments.filter((c) => c._id !== commentId));
        setTotalCount(totalCount - 1);

        setDeleteDialog({ open: false, comment: null });

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
    <Box>
      {/* ========== SECTION HEADER ========== */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: alpha("#7C4DFF", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ForumIcon sx={{ fontSize: 24, color: "#7C4DFF" }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
              Bình luận
            </Typography>
            <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
              Thảo luận và trao đổi về tài liệu
            </Typography>
          </Box>
        </Box>

        {/* Comment Count Badge */}
        <Box
          sx={{
            px: 2,
            py: 0.75,
            borderRadius: "10px",
            bgcolor: alpha("#7C4DFF", 0.1),
            color: "#7C4DFF",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {totalCount} bình luận
          </Typography>
        </Box>
      </Box>

      {/* ========== COMMENT FORM OR LOGIN PROMPT ========== */}
      {isAuthenticated ? (
        <Box sx={{ mb: 4 }}>
          <CommentForm
            onSubmit={handleSubmitComment}
            loading={submitLoading}
            user={user}
          />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: "20px",
            bgcolor: "white",
            boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
            border: "1px solid #F0F0F5",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              borderRadius: "16px",
              bgcolor: alpha("#D32F2F", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoginIcon sx={{ fontSize: 32, color: "#D32F2F" }} />
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
          >
            Đăng nhập để bình luận
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#8E8EA9", mb: 3, maxWidth: 300, mx: "auto" }}
          >
            Tham gia thảo luận và chia sẻ ý kiến của bạn về tài liệu này
          </Typography>

          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLoginClick}
            sx={{
              bgcolor: "#D32F2F",
              color: "white",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
              "&:hover": {
                bgcolor: "#B71C1C",
              },
            }}
          >
            Đăng nhập ngay
          </Button>
        </Paper>
      )}

      {/* ========== COMMENTS LIST ========== */}
      <Box>
        {loading ? (
          // Loading Skeleton
          <Box>
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
                  <Skeleton variant="circular" width={44} height={44} />
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
        ) : comments.length === 0 ? (
          // Empty State
          <Paper
            elevation={0}
            sx={{
              p: 6,
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
                bgcolor: alpha("#7C4DFF", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChatIcon sx={{ fontSize: 40, color: "#7C4DFF" }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
            >
              Chưa có bình luận nào
            </Typography>
            <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
              Hãy là người đầu tiên bình luận về tài liệu này!
            </Typography>
          </Paper>
        ) : (
          // Comments List
          <>
            {comments.map((comment, index) => (
              <Box
                key={comment._id}
                sx={{
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
                }}
              >
                <CommentItem
                  comment={comment}
                  currentUserId={user?.id}
                  currentUserRole={user?.role}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                />
              </Box>
            ))}

            {/* Load More Button */}
            {totalCount > comments.length && (
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={fetchComments}
                  sx={{
                    borderColor: "#E0E0E0",
                    color: "#4A4A68",
                    borderRadius: "12px",
                    px: 4,
                    py: 1.25,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#7C4DFF",
                      color: "#7C4DFF",
                      bgcolor: alpha("#7C4DFF", 0.04),
                    },
                  }}
                >
                  Xem thêm bình luận cũ hơn
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ========== DIALOGS ========== */}
      <EditCommentDialog
        open={editDialog.open}
        comment={editDialog.comment}
        onClose={() => setEditDialog({ open: false, comment: null })}
        onSave={handleSaveEdit}
        loading={editLoading}
      />

      <DeleteCommentDialog
        open={deleteDialog.open}
        comment={deleteDialog.comment}
        onClose={() => setDeleteDialog({ open: false, comment: null })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* ========== SNACKBAR ========== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentSection;
