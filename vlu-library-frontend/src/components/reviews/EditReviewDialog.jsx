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
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

/**
 * EditReviewDialog Component - VLU Design System v2.0
 * Modern & Bold dialog để chỉnh sửa đánh giá
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
  const [hoverRating, setHoverRating] = useState(-1);
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
   * Get rating label
   */
  const getRatingLabel = (value) => {
    const labels = {
      1: "Rất kém",
      2: "Kém",
      3: "Trung bình",
      4: "Tốt",
      5: "Tuyệt vời",
    };
    return labels[value] || "";
  };

  /**
   * Get rating color
   */
  const getRatingColor = (value) => {
    const colors = {
      1: "#F44336",
      2: "#FF9800",
      3: "#FFC107",
      4: "#8BC34A",
      5: "#4CAF50",
    };
    return colors[value] || "#FFC107";
  };

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
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (content.trim().length > 1000) {
      setError("Nội dung không được vượt quá 1000 ký tự");
      return;
    }

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

  const displayValue = hoverRating !== -1 ? hoverRating : rating;

  if (!review) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 24px 48px rgba(26,26,46,0.2)",
        },
      }}
    >
      {/* ========== HEADER ========== */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #F0F0F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: alpha("#2196F3", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditIcon sx={{ fontSize: 24, color: "#2196F3" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1A1A2E" }}
              >
                Chỉnh sửa đánh giá
              </Typography>
              <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
                Cập nhật đánh giá của bạn
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: "#8E8EA9",
              "&:hover": {
                bgcolor: "#F0F0F5",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ========== CONTENT ========== */}
      <DialogContent sx={{ p: 3 }}>
        {/* Rating Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              color: "#1A1A2E",
            }}
          >
            Đánh giá của bạn
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderRadius: "14px",
              bgcolor:
                displayValue > 0
                  ? alpha(getRatingColor(displayValue), 0.08)
                  : "#FAFAFC",
              border: "1px solid",
              borderColor:
                displayValue > 0
                  ? alpha(getRatingColor(displayValue), 0.2)
                  : "#F0F0F5",
              transition: "all 0.2s ease",
            }}
          >
            <Rating
              name="edit-rating"
              value={rating}
              onChange={handleRatingChange}
              onChangeActive={(event, newHover) => {
                setHoverRating(newHover);
              }}
              precision={1}
              size="large"
              disabled={loading}
              icon={<StarIcon sx={{ fontSize: 32 }} />}
              emptyIcon={<StarIcon sx={{ fontSize: 32, color: "#E0E0E0" }} />}
              sx={{
                "& .MuiRating-iconFilled": {
                  color: "#FFC107",
                },
                "& .MuiRating-iconHover": {
                  color: "#FFD54F",
                },
              }}
            />

            {displayValue > 0 && (
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: "8px",
                  bgcolor: getRatingColor(displayValue),
                  color: "white",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  {displayValue}/5 - {getRatingLabel(displayValue)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content Section */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              color: "#1A1A2E",
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                bgcolor: "#FAFAFC",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#C4C4D4",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2196F3",
                  borderWidth: "2px",
                },
              },
            }}
          />
        </Box>
      </DialogContent>

      {/* ========== ACTIONS ========== */}
      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: "#4A4A68",
            borderRadius: "12px",
            px: 3,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || rating === 0}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            bgcolor: "#2196F3",
            color: "white",
            borderRadius: "12px",
            px: 3,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(33,150,243,0.3)",
            "&:hover": {
              bgcolor: "#1976D2",
            },
            "&.Mui-disabled": {
              bgcolor: "#E0E0E0",
              color: "#8E8EA9",
            },
          }}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditReviewDialog;
