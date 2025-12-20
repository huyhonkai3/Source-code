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
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

/**
 * EditCommentDialog Component
 * Dialog để chỉnh sửa bình luận
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
    // Validation
    if (content.trim().length === 0) {
      setError("Nội dung bình luận không được để trống");
      return;
    }

    if (content.length > 500) {
      setError("Nội dung không được vượt quá 500 ký tự");
      return;
    }

    // Call save callback
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
          Chỉnh sửa bình luận
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
        <Box sx={{ mb: 2 }}>
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
            helperText={
              error || isOverLimit ? (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: "error.main" }}
                >
                  {error || "🔴 Nội dung không được vượt quá 500 ký tự"}
                </Typography>
              ) : (
                `${content.length}/500 ký tự`
              )
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>

        {/* Hint */}
        <Typography variant="caption" color="text.secondary">
          Nhấn Ctrl + Enter để lưu nhanh
        </Typography>
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
          disabled={loading || !content.trim() || isOverLimit}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "error.main",
            "&:hover": {
              bgcolor: "error.dark",
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
