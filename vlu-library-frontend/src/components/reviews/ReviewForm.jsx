import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Alert,
  alpha,
} from "@mui/material";
import {
  Send as SendIcon,
  Star as StarIcon,
  Login as LoginIcon,
  RateReview as ReviewIcon,
} from "@mui/icons-material";

/**
 * ReviewForm Component - VLU Design System v2.0
 * Modern & Bold form để user gửi đánh giá
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
  const [hoverRating, setHoverRating] = useState(-1);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

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
   * Handle submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (content.trim().length > 1000) {
      setError("Nội dung không được vượt quá 1000 ký tự");
      return;
    }

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

  // Display value for label
  const displayValue = hoverRating !== -1 ? hoverRating : rating;

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
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
          Đăng nhập để đánh giá
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#8E8EA9", mb: 3, maxWidth: 300, mx: "auto" }}
        >
          Chia sẻ đánh giá của bạn để giúp cộng đồng VLU tìm được tài liệu chất
          lượng
        </Typography>

        <Button
          variant="contained"
          onClick={onLoginClick}
          startIcon={<LoginIcon />}
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
    );
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
        border: "1px solid #F0F0F5",
      }}
    >
      {/* ========== HEADER ========== */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #F0F0F5",
          display: "flex",
          alignItems: "center",
          gap: 2,
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
          <ReviewIcon sx={{ fontSize: 22, color: "#F9A825" }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
            Đánh giá của bạn
          </Typography>
          <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
            Chia sẻ trải nghiệm về tài liệu này
          </Typography>
        </Box>
      </Box>

      {/* ========== FORM CONTENT ========== */}
      <Box sx={{ p: 3 }}>
        {/* ========== STAR RATING ========== */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              color: "#1A1A2E",
            }}
          >
            Bạn đánh giá tài liệu này như thế nào?
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
              name="document-rating"
              value={rating}
              onChange={handleRatingChange}
              onChangeActive={(event, newHover) => {
                setHoverRating(newHover);
              }}
              precision={1}
              size="large"
              disabled={loading}
              icon={<StarIcon sx={{ fontSize: 36 }} />}
              emptyIcon={<StarIcon sx={{ fontSize: 36, color: "#E0E0E0" }} />}
              sx={{
                "& .MuiRating-iconFilled": {
                  color: "#FFC107",
                },
                "& .MuiRating-iconHover": {
                  color: "#FFD54F",
                },
              }}
            />

            {/* Rating Label */}
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

        {/* ========== COMMENT TEXTAREA ========== */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              color: "#1A1A2E",
            }}
          >
            Nhận xét của bạn{" "}
            <Box component="span" sx={{ color: "#8E8EA9", fontWeight: 400 }}>
              (không bắt buộc)
            </Box>
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
                borderRadius: "14px",
                bgcolor: "#FAFAFC",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#C4C4D4",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FFC107",
                  borderWidth: "2px",
                },
              },
            }}
          />

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: content.length > 900 ? "#FF9800" : "#8E8EA9",
              textAlign: "right",
            }}
          >
            {content.length}/1000 ký tự
          </Typography>
        </Box>

        {/* ========== ERROR ALERT ========== */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}

        {/* ========== SUBMIT BUTTON ========== */}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || rating === 0}
          startIcon={<SendIcon />}
          fullWidth
          sx={{
            bgcolor: "#D32F2F",
            color: "white",
            borderRadius: "12px",
            py: 1.5,
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
            "&:hover": {
              bgcolor: "#B71C1C",
              boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
            },
            "&.Mui-disabled": {
              bgcolor: "#E0E0E0",
              color: "#8E8EA9",
            },
          }}
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ReviewForm;
