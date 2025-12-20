import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Alert,
} from "@mui/material";
import { Send as SendIcon, Star as StarIcon } from "@mui/icons-material";

/**
 * ReviewForm Component
 * Form để user gửi đánh giá
 *
 * @param {Function} onSubmit - Callback khi submit (rating, content)
 * @param {boolean} loading - Loading state
 * @param {boolean} isAuthenticated - User đã login chưa
 * @param {Function} onLoginClick - Callback khi click nút đăng nhập
 */
const ReviewForm = ({
  onSubmit,
  loading = false,
  isAuthenticated = false,
  onLoginClick,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  /**
   * Handle submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (content.trim().length > 1000) {
      setError("Nội dung không được vượt quá 1000 ký tự");
      return;
    }

    // Clear error and submit
    setError("");
    onSubmit({ rating, content: content.trim() });
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

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
          Đăng nhập để đánh giá tài liệu này
        </Typography>
        <Button
          variant="contained"
          onClick={onLoginClick}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Đăng nhập ngay
        </Button>
      </Paper>
    );
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2,
        }}
      >
        Đánh giá của bạn
      </Typography>

      {/* Rating Label */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "text.secondary",
          }}
        >
          Bạn đang đánh giá tài liệu này {rating > 0 && `${rating} sao`}
        </Typography>

        {/* Star Rating */}
        <Rating
          name="document-rating"
          value={rating}
          onChange={handleRatingChange}
          precision={1}
          size="large"
          disabled={loading}
          icon={<StarIcon fontSize="inherit" />}
          emptyIcon={<StarIcon fontSize="inherit" sx={{ color: "grey.300" }} />}
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

      {/* Content TextField */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "text.secondary",
          }}
        >
          Nhận xét của bạn (không bắt buộc)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Chia sẻ cảm nhận của bạn để giúp cộng đồng VLU có thêm thông tin..."
          value={content}
          onChange={handleContentChange}
          disabled={loading}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            color: "text.secondary",
            textAlign: "right",
          }}
        >
          {content.length}/1000 ký tự
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        disabled={loading || rating === 0}
        startIcon={<SendIcon />}
        fullWidth
        sx={{
          textTransform: "none",
          fontWeight: 600,
          py: 1.5,
        }}
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </Paper>
  );
};

export default ReviewForm;
