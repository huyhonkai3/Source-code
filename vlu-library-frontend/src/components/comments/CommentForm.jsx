import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  alpha,
} from "@mui/material";
import {
  Send as SendIcon,
  ChatBubbleOutline as CommentIcon,
  Keyboard as KeyboardIcon,
} from "@mui/icons-material";

/**
 * CommentForm Component - VLU Design System v2.0
 * Modern & Bold form nhập bình luận
 *
 * @param {Function} onSubmit - Callback khi submit (content)
 * @param {boolean} loading - Loading state
 * @param {Object} user - Current user info
 */
const CommentForm = ({ onSubmit, loading = false, user }) => {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isOverLimit = content.length > 500;
  const isDisabled = !content.trim() || isOverLimit || loading;

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    if (isDisabled) return;

    onSubmit(content.trim());
    setContent("");
  };

  /**
   * Handle Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey && !isDisabled) {
      handleSubmit();
    }
  };

  /**
   * Get initials from name
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
   * Get character count color
   */
  const getCharCountColor = () => {
    if (isOverLimit) return "#D32F2F";
    if (content.length > 450) return "#FF9800";
    return "#8E8EA9";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
        border: "1px solid",
        borderColor: isFocused ? alpha("#D32F2F", 0.3) : "#F0F0F5",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* ========== HEADER ========== */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #F0F0F5",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            bgcolor: alpha("#7C4DFF", 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CommentIcon sx={{ fontSize: 20, color: "#7C4DFF" }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#1A1A2E" }}
          >
            Viết bình luận
          </Typography>
          <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
            Chia sẻ suy nghĩ của bạn về tài liệu này
          </Typography>
        </Box>
      </Box>

      {/* ========== FORM CONTENT ========== */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Avatar */}
          <Avatar
            src={user?.avatarUrl}
            alt={user?.name}
            sx={{
              width: 44,
              height: 44,
              bgcolor: "#D32F2F",
              fontWeight: 600,
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            {getInitials(user?.name)}
          </Avatar>

          {/* Input Area */}
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Chia sẻ suy nghĩ của bạn về tài liệu này..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={loading}
              error={isOverLimit}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: "#FAFAFC",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#C4C4D4",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D32F2F",
                    borderWidth: "2px",
                  },
                  "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D32F2F",
                  },
                },
              }}
            />

            {/* Footer Row */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Character Count */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: getCharCountColor(),
                    fontWeight: isOverLimit ? 600 : 400,
                  }}
                >
                  {content.length}/500 ký tự
                </Typography>

                {isOverLimit && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#D32F2F", fontWeight: 500 }}
                  >
                    (Vượt quá giới hạn)
                  </Typography>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={isDisabled}
                sx={{
                  bgcolor: "#D32F2F",
                  color: "white",
                  borderRadius: "12px",
                  px: 3,
                  py: 1,
                  fontWeight: 600,
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
                {loading ? "Đang gửi..." : "Gửi bình luận"}
              </Button>
            </Box>

            {/* Keyboard Hint */}
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <KeyboardIcon sx={{ fontSize: 14, color: "#C4C4D4" }} />
              <Typography variant="caption" sx={{ color: "#C4C4D4" }}>
                Nhấn Ctrl + Enter để gửi nhanh
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentForm;
