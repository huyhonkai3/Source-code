import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import { Send as SendIcon, Edit as EditIcon } from "@mui/icons-material";

/**
 * CommentForm Component
 * Form nhập bình luận với validation
 *
 * @param {Function} onSubmit - Callback khi submit (content)
 * @param {boolean} loading - Loading state
 * @param {Object} user - Current user info
 */
const CommentForm = ({ onSubmit, loading = false, user }) => {
  const [content, setContent] = useState("");

  const isOverLimit = content.length > 500;
  const isDisabled = !content.trim() || isOverLimit || loading;

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    if (isDisabled) return;

    onSubmit(content.trim());
    setContent(""); // Clear after submit
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

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <EditIcon fontSize="small" sx={{ color: "text.secondary" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Viết bình luận
        </Typography>
      </Box>

      {/* Form */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Avatar */}
        <Avatar
          src={user?.avatarUrl}
          alt={user?.name}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: "primary.main",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {getInitials(user?.name)}
        </Avatar>

        {/* Input */}
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Chia sẻ suy nghĩ của bạn về tài liệu này..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            error={isOverLimit}
            helperText={
              isOverLimit ? (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: "error.main" }}
                >
                  🔴 Nội dung bình luận không được vượt quá 500 ký tự
                </Typography>
              ) : (
                `${content.length}/500`
              )
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
            }}
          />

          {/* Submit Button */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={isDisabled}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "error.main",
                "&:hover": {
                  bgcolor: "error.dark",
                },
              }}
            >
              {loading ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </Box>

          {/* Hint */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Nhấn Ctrl + Enter để gửi nhanh
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentForm;
