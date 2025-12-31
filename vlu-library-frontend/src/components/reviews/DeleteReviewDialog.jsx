import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@mui/icons-material";

/**
 * DeleteReviewDialog Component - VLU Design System v2.0
 * Modern & Bold dialog xác nhận xóa đánh giá
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
            textAlign: "center",
          }}
        >
          {/* Warning Icon */}
          <Box
            sx={{
              width: 72,
              height: 72,
              mx: "auto",
              mb: 2,
              borderRadius: "50%",
              bgcolor: alpha("#D32F2F", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningIcon sx={{ fontSize: 36, color: "#D32F2F" }} />
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1A1A2E", mb: 0.5 }}
          >
            Xóa đánh giá?
          </Typography>
          <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
            Hành động này không thể hoàn tác
          </Typography>
        </Box>
      </DialogTitle>

      {/* ========== CONTENT ========== */}
      <DialogContent sx={{ px: 3, py: 0 }}>
        {/* Alert */}
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            mb: 2,
            borderRadius: "12px",
            bgcolor: "#FFF8E1",
            border: "1px solid #FFE082",
            "& .MuiAlert-icon": {
              color: "#F9A825",
            },
          }}
        >
          Bạn sắp xóa đánh giá này vĩnh viễn
        </Alert>

        {/* Review Preview */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: "14px",
            bgcolor: "#FAFAFC",
            border: "1px solid #F0F0F5",
          }}
        >
          {/* Rating */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#8E8EA9", fontWeight: 500 }}
            >
              Đánh giá:
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.25,
                borderRadius: "6px",
                bgcolor: alpha("#FFC107", 0.15),
              }}
            >
              <StarIcon sx={{ fontSize: 14, color: "#FFC107" }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "#F9A825" }}
              >
                {review.rating} sao
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          {review.content && (
            <Typography
              variant="body2"
              sx={{
                color: "#4A4A68",
                fontStyle: "italic",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.6,
                "&::before": {
                  content: '"\\201C"',
                  fontSize: "1.5rem",
                  color: "#C4C4D4",
                  mr: 0.5,
                },
              }}
            >
              {review.content}
            </Typography>
          )}
        </Box>
      </DialogContent>

      {/* ========== ACTIONS ========== */}
      <DialogActions
        sx={{
          p: 3,
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            flex: 1,
            color: "#4A4A68",
            borderRadius: "12px",
            py: 1.25,
            fontWeight: 600,
            textTransform: "none",
            border: "1px solid #E0E0E0",
            "&:hover": {
              bgcolor: "#FAFAFC",
              borderColor: "#C4C4D4",
            },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <DeleteIcon />
            )
          }
          sx={{
            flex: 1,
            bgcolor: "#D32F2F",
            color: "white",
            borderRadius: "12px",
            py: 1.25,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
            "&:hover": {
              bgcolor: "#B71C1C",
            },
            "&.Mui-disabled": {
              bgcolor: "#E0E0E0",
              color: "#8E8EA9",
            },
          }}
        >
          {loading ? "Đang xóa..." : "Xóa đánh giá"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteReviewDialog;
