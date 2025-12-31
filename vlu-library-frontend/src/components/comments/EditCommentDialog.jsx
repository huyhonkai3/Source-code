import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Keyboard as KeyboardIcon,
} from "@mui/icons-material";

/**
 * EditCommentDialog Component - VLU Design System v2.0
 * Modern & Bold dialog để chỉnh sửa bình luận
 *
 * @param {boolean} open - Dialog open state
 * @param {Object} comment - Comment object to edit
 * @param {Function} onClose - Callback khi close
 * @param {Function} onSave - Callback khi save (commentId, content)
 * @param {boolean} loading - Loading state
 */
const EditCommentDialog = ({
  open,
  comment,
  onClose,
  onSave,
  loading = false,
}) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  /**
   * Initialize form when comment changes
   */
  useEffect(() => {
    if (comment) {
      setContent(comment.content || "");
      setError("");
    }
  }, [comment]);

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
    if (content.trim().length === 0) {
      setError("Nội dung bình luận không được để trống");
      return;
    }

    if (content.length > 500) {
      setError("Nội dung không được vượt quá 500 ký tự");
      return;
    }

    onSave(comment._id, content.trim());
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

  /**
   * Handle Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey && !loading && content.trim()) {
      handleSave();
    }
  };

  /**
   * Get character count color
   */
  const getCharCountColor = () => {
    if (content.length > 500) return "#D32F2F";
    if (content.length > 450) return "#FF9800";
    return "#8E8EA9";
  };

  if (!comment) return null;

  const isOverLimit = content.length > 500;

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
                bgcolor: alpha("#7C4DFF", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditIcon sx={{ fontSize: 24, color: "#7C4DFF" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1A1A2E" }}
              >
                Chỉnh sửa bình luận
              </Typography>
              <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
                Cập nhật nội dung bình luận của bạn
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
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Nhập nội dung bình luận..."
          value={content}
          onChange={handleContentChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
          error={!!error || isOverLimit}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              bgcolor: "#FAFAFC",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C4C4D4",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#7C4DFF",
                borderWidth: "2px",
              },
              "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D32F2F",
              },
            },
          }}
        />

        {/* Footer Info */}
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Error or Character Count */}
          <Typography
            variant="caption"
            sx={{
              color: error ? "#D32F2F" : getCharCountColor(),
              fontWeight: error || isOverLimit ? 500 : 400,
            }}
          >
            {error || `${content.length}/500 ký tự`}
          </Typography>

          {/* Keyboard Hint */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <KeyboardIcon sx={{ fontSize: 14, color: "#C4C4D4" }} />
            <Typography variant="caption" sx={{ color: "#C4C4D4" }}>
              Ctrl + Enter để lưu nhanh
            </Typography>
          </Box>
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
          disabled={loading || !content.trim() || isOverLimit}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            bgcolor: "#7C4DFF",
            color: "white",
            borderRadius: "12px",
            px: 3,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(124,77,255,0.3)",
            "&:hover": {
              bgcolor: "#651FFF",
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

export default EditCommentDialog;
