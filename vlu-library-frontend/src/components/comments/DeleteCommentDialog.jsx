import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

/**
 * DeleteCommentDialog Component
 * Dialog xác nhận xóa bình luận
 *
 * @param {boolean} open - Dialog open state
 * @param {Object} comment - Comment object to delete
 * @param {Function} onClose - Callback khi close
 * @param {Function} onConfirm - Callback khi confirm delete (commentId)
 * @param {boolean} loading - Loading state
 */
const DeleteCommentDialog = ({
  open,
  comment,
  onClose,
  onConfirm,
  loading = false,
}) => {
  /**
   * Handle confirm
   */
  const handleConfirm = () => {
    if (comment) {
      onConfirm(comment._id);
    }
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!comment) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: (theme) => `${theme.palette.error.main}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningIcon sx={{ color: "error.main", fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Xóa bình luận?
          </Typography>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Bạn có chắc chắn muốn xóa bình luận này không?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Hành động này không thể hoàn tác.
        </Typography>

        {/* Show comment preview */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "grey.50",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            "{comment.content}"
          </Typography>
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
          Hủy bỏ
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Đang xóa..." : "Xóa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCommentDialog;
