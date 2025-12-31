import { useState, useEffect, useCallback } from "react";
import { Box, Grid, Snackbar, Alert, Typography, alpha } from "@mui/material";
import {
  Star as StarIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import reviewsAPI from "../../api/reviews.api";
import RatingSummary from "./RatingSummary";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import EditReviewDialog from "./EditReviewDialog";
import DeleteReviewDialog from "./DeleteReviewDialog";

/**
 * ReviewSection Component - VLU Design System v2.0
 * Container component quản lý toàn bộ review system
 *
 * @param {string} docId - ID của tài liệu
 */
const ReviewSection = ({ docId }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit/Delete dialogs state
  const [editDialog, setEditDialog] = useState({ open: false, review: null });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    review: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /**
   * Fetch reviews
   */
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewsAPI.getByDocId(docId, {
        page: 1,
        limit: 10,
      });

      if (response.status === "success") {
        setReviews(response.data.reviews);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải đánh giá",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [docId]);

  /**
   * Check if user has reviewed
   */
  const checkUserReview = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await reviewsAPI.checkUserReview(docId);
      if (response.status === "success") {
        setHasReviewed(response.data.hasReviewed);
      }
    } catch (error) {
      console.error("Check user review error:", error);
    }
  }, [docId, isAuthenticated]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchReviews();
    checkUserReview();
  }, [fetchReviews, checkUserReview]);

  /**
   * Handle submit review
   */
  const handleSubmitReview = async ({ rating, content }) => {
    setSubmitLoading(true);

    try {
      const response = await reviewsAPI.add({
        docId,
        rating,
        content,
      });

      if (response.status === "success") {
        setSnackbar({
          open: true,
          message: "Cảm ơn! Đánh giá của bạn đã được lưu.",
          severity: "success",
        });

        setHasReviewed(true);
        await fetchReviews();
      }
    } catch (error) {
      console.error("Submit review error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại.";

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
   * Handle edit review
   */
  const handleEditReview = (review) => {
    setEditDialog({ open: true, review });
  };

  /**
   * Handle save edited review
   */
  const handleSaveEdit = async (reviewId, data) => {
    setEditLoading(true);

    try {
      const response = await reviewsAPI.update(reviewId, data);

      if (response.status === "success") {
        setSnackbar({
          open: true,
          message: "Đánh giá đã được cập nhật",
          severity: "success",
        });

        setEditDialog({ open: false, review: null });
        await fetchReviews();
      }
    } catch (error) {
      console.error("Update review error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể cập nhật đánh giá",
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Handle delete review
   */
  const handleDeleteReview = (review) => {
    setDeleteDialog({ open: true, review });
  };

  /**
   * Handle confirm delete
   */
  const handleConfirmDelete = async (reviewId) => {
    setDeleteLoading(true);

    try {
      const response = await reviewsAPI.delete(reviewId);

      if (response.status === "success") {
        setSnackbar({
          open: true,
          message: "Đánh giá đã được xóa",
          severity: "success",
        });

        setDeleteDialog({ open: false, review: null });
        setHasReviewed(false);
        await fetchReviews();
      }
    } catch (error) {
      console.error("Delete review error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Không thể xóa đánh giá",
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
          gap: 1.5,
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: alpha("#FFC107", 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StarIcon sx={{ fontSize: 24, color: "#F9A825" }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
            Đánh giá tài liệu
          </Typography>
          <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
            Xem và chia sẻ đánh giá về tài liệu này
          </Typography>
        </Box>
      </Box>

      {/* ========== MAIN CONTENT ========== */}
      <Grid container spacing={3}>
        {/* Left Column: Rating Summary */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: "sticky", top: 100 }}>
            <RatingSummary statistics={statistics} />
          </Box>
        </Grid>

        {/* Right Column: Review Form + Review List */}
        <Grid item xs={12} md={8}>
          {/* Review Form - Show only if not reviewed */}
          {!hasReviewed && (
            <Box sx={{ mb: 3 }}>
              <ReviewForm
                onSubmit={handleSubmitReview}
                loading={submitLoading}
                isAuthenticated={isAuthenticated}
                onLoginClick={handleLoginClick}
              />
            </Box>
          )}

          {/* User already reviewed message */}
          {hasReviewed && (
            <Box
              sx={{
                mb: 3,
                p: 2.5,
                borderRadius: "14px",
                bgcolor: alpha("#4CAF50", 0.08),
                border: "1px solid",
                borderColor: alpha("#4CAF50", 0.2),
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: alpha("#4CAF50", 0.15),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon sx={{ fontSize: 22, color: "#4CAF50" }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#2E7D32" }}
                >
                  Bạn đã đánh giá tài liệu này
                </Typography>
                <Typography variant="body2" sx={{ color: "#4A4A68" }}>
                  Cảm ơn bạn đã đóng góp ý kiến!
                </Typography>
              </Box>
            </Box>
          )}

          {/* Review List */}
          <ReviewList
            reviews={reviews}
            loading={loading}
            currentUserId={user?.id}
            currentUserRole={user?.role}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        </Grid>
      </Grid>

      {/* ========== DIALOGS ========== */}
      <EditReviewDialog
        open={editDialog.open}
        review={editDialog.review}
        onClose={() => setEditDialog({ open: false, review: null })}
        onSave={handleSaveEdit}
        loading={editLoading}
      />

      <DeleteReviewDialog
        open={deleteDialog.open}
        review={deleteDialog.review}
        onClose={() => setDeleteDialog({ open: false, review: null })}
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

export default ReviewSection;
