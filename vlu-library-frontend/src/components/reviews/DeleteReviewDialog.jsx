import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

/**
 * DeleteReviewDialog Component
 * Dialog xác nhận xóa đánh giá
 *
 * @param {boolean} open - Dialog open state
 * @param {Object} review - Review object to delete
 * @param {Function} onClose - Callback khi close
 * @param {Function} onConfirm - Callback khi confirm delete (reviewId)
 * @param {boolean} loading - Loading state
 */
const DeleteReviewDialog = ({
  open,
  review,
  onClose,
  onConfirm,
  loading = false,
}) => {
  /**
   * Handle confirm
   */
  const handleConfirm = () => {
    if (review) {
      onConfirm(review._id);
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

  if (!review) return null;

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
            Xóa đánh giá?
          </Typography>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Hành động này không thể hoàn tác!
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Bạn có chắc chắn muốn xóa đánh giá này không?
        </Typography>

        {/* Show rating and content */}
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
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            Đánh giá: {review.rating} sao
          </Typography>
          {review.content && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontStyle: "italic",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              "{review.content}"
            </Typography>
          )}
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
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Đang xóa..." : "Xóa đánh giá"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteReviewDialog;
