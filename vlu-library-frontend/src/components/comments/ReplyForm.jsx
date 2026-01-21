import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  alpha,
} from "@mui/material";
import { Send as SendIcon, Close as CloseIcon } from "@mui/icons-material";

/**
 * ReplyForm Component - VLU Design System v2.0
 * Form nhập reply nhỏ gọn, hiển thị inline dưới comment
 *
 * @param {Object} user - Current user info
 * @param {Function} onSubmit - Callback khi submit (content)
 * @param {Function} onCancel - Callback khi hủy
 * @param {boolean} loading - Loading state
 * @param {string} replyToName - Tên người đang reply (hiển thị placeholder)
 */
const ReplyForm = ({
  user,
  onSubmit,
  onCancel,
  loading = false,
  replyToName = "",
}) => {
  const [content, setContent] = useState("");
  const inputRef = useRef(null);

  const isOverLimit = content.length > 500;
  const isDisabled = !content.trim() || isOverLimit || loading;

  // Auto focus khi mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
   * Handle submit
   */
  const handleSubmit = () => {
    if (isDisabled) return;
    onSubmit(content.trim());
    setContent("");
  };

  /**
   * Handle Enter key (Ctrl+Enter to submit)
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey && !isDisabled) {
      e.preventDefault();
      handleSubmit();
    }
    // Escape to cancel
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        p: 2,
        mt: 1.5,
        borderRadius: "12px",
        bgcolor: "#FAFAFC",
        border: "1px solid #E8E8ED",
      }}
    >
      {/* Avatar */}
      <Avatar
        src={user?.avatarUrl}
        alt={user?.name}
        sx={{
          width: 32,
          height: 32,
          bgcolor: "#D32F2F",
          fontWeight: 600,
          fontSize: "0.75rem",
          flexShrink: 0,
        }}
      >
        {getInitials(user?.name)}
      </Avatar>

      {/* Input Area */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          rows={2}
          placeholder={
            replyToName
              ? `Trả lời ${replyToName}...`
              : "Viết phản hồi của bạn..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          error={isOverLimit}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "white",
              fontSize: "0.875rem",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C4C4D4",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#7C4DFF",
                borderWidth: "2px",
              },
            },
          }}
        />

        {/* Footer Row */}
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Character Count */}
          <Typography
            variant="caption"
            sx={{
              color: isOverLimit ? "#D32F2F" : "#8E8EA9",
              fontWeight: isOverLimit ? 600 : 400,
            }}
          >
            {content.length}/500
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              onClick={onCancel}
              disabled={loading}
              startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: "#8E8EA9",
                textTransform: "none",
                fontWeight: 500,
                px: 1.5,
                minWidth: "auto",
                "&:hover": {
                  bgcolor: alpha("#8E8EA9", 0.1),
                },
              }}
            >
              Hủy
            </Button>

            <Button
              size="small"
              variant="contained"
              onClick={handleSubmit}
              disabled={isDisabled}
              startIcon={
                loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                bgcolor: "#7C4DFF",
                color: "white",
                borderRadius: "8px",
                px: 2,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#6B3FE8",
                  boxShadow: "0 2px 8px rgba(124,77,255,0.3)",
                },
                "&.Mui-disabled": {
                  bgcolor: "#E0E0E0",
                  color: "#8E8EA9",
                },
              }}
            >
              {loading ? "Đang gửi..." : "Gửi"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReplyForm;
