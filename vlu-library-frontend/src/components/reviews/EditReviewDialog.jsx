import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, Star as StarIcon } from "@mui/icons-material";

/**
 * EditReviewDialog Component
 * Dialog để chỉnh sửa đánh giá
 *
 * @param {boolean} open - Dialog open state
 * @param {Object} review - Review object to edit
 * @param {Function} onClose - Callback khi close
 * @param {Function} onSave - Callback khi save (reviewId, rating, content)
 * @param {boolean} loading - Loading state
 */
const EditReviewDialog = ({
  open,
  review,
  onClose,
  onSave,
  loading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  /**
   * Initialize form when review changes
   */
  useEffect(() => {
    if (review) {
      setRating(review.rating || 0);
      setContent(review.content || "");
      setError("");
    }
  }, [review]);

  /**
   * Handle rating change
   */
  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
    if (error) setError("");
  };

  /**
   * Handle content change
   */
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (error) setError("");
  };

  /**
   * Handle save
   */
  const handleSave = () => {
    // Validation
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (content.trim().length > 1000) {
      setError("Nội dung không được vượt quá 1000 ký tự");
      return;
    }

    // Call save callback
    onSave(review._id, { rating, content: content.trim() });
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    if (!loading) {
      setError("");
      onClose();
    }
  };

  if (!review) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Chỉnh sửa đánh giá
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        {/* Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: "text.secondary",
            }}
          >
            Đánh giá của bạn {rating > 0 && `(${rating} sao)`}
          </Typography>

          <Rating
            name="edit-rating"
            value={rating}
            onChange={handleRatingChange}
            precision={1}
            size="large"
            disabled={loading}
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={
              <StarIcon fontSize="inherit" sx={{ color: "grey.300" }} />
            }
            sx={{
              "& .MuiRating-iconFilled": {
                color: "#FFA500",
              },
              "& .MuiRating-iconHover": {
                color: "#FFB733",
              },
            }}
          />

          {/* Rating text */}
          {rating > 0 && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.5,
                color: "text.secondary",
              }}
            >
              {rating === 5 && "5/5 - Tuyệt vời"}
              {rating === 4 && "4/5 - Tốt"}
              {rating === 3 && "3/5 - Trung bình"}
              {rating === 2 && "2/5 - Kém"}
              {rating === 1 && "1/5 - Rất kém"}
            </Typography>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: "text.secondary",
            }}
          >
            Nhận xét của bạn
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Chia sẻ cảm nhận của bạn..."
            value={content}
            onChange={handleContentChange}
            disabled={loading}
            error={!!error}
            helperText={error || `${content.length}/1000 ký tự`}
          />
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || rating === 0}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditReviewDialog;
