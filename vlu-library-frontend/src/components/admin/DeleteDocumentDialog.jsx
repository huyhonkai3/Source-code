import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

/**
 * DeleteDocumentDialog Component - VLU Design System v2.0.1
 * Modern & Bold confirmation dialog for permanently deleting documents
 * UPDATED: Tăng font sizes để UX tốt hơn
 *
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {Function} onConfirm - Confirm handler (receives notifyAuthor boolean)
 * @param {Object} document - Document to delete
 * @param {boolean} loading - Loading state during deletion
 */
const DeleteDocumentDialog = ({
  open,
  onClose,
  onConfirm,
  document,
  loading = false,
}) => {
  const [notifyAuthor, setNotifyAuthor] = useState(true);

  /**
   * Handle confirm delete
   */
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(notifyAuthor);
    }
  };

  /**
   * Handle dialog close (reset state)
   */
  const handleClose = () => {
    if (!loading && onClose) {
      setNotifyAuthor(true);
      onClose();
    }
  };

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
          overflow: "hidden",
        },
      }}
    >
      {/* ========== HEADER WITH GRADIENT ========== */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)",
          p: 3,
          position: "relative",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "rgba(255,255,255,0.8)",
            "&:hover": {
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Warning Icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            mb: 2,
            borderRadius: "16px",
            bgcolor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningIcon sx={{ fontSize: 36, color: "white" }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            fontSize: "1.25rem", // UPDATED: 20px (was 18px h6)
          }}
        >
          Xóa tài liệu vĩnh viễn?
        </Typography>
      </Box>

      {/* ========== CONTENT ========== */}
      <DialogContent sx={{ p: 3 }}>
        {/* Document Info Card */}
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: "#FAFAFC",
            border: "1px solid #F0F0F5",
            mb: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#8E8EA9",
              mb: 1,
              fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
            }}
          >
            Tài liệu sẽ bị xóa:
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1A1A2E",
              mb: 0.5,
              wordBreak: "break-word",
              fontSize: "1rem", // UPDATED: 16px (was 14px subtitle1)
            }}
          >
            "{document?.title || "N/A"}"
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#8E8EA9",
              fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
            }}
          >
            Tác giả:{" "}
            <Box component="span" sx={{ color: "#4A4A68", fontWeight: 600 }}>
              {document?.uploadedBy?.name || "N/A"}
            </Box>
          </Typography>
        </Box>

        {/* Warning Box */}
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: alpha("#D32F2F", 0.08),
            border: "1px solid",
            borderColor: alpha("#D32F2F", 0.2),
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <WarningIcon sx={{ fontSize: 20, color: "#D32F2F", mt: 0.25 }} />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#D32F2F",
                  mb: 0.5,
                  fontSize: "0.9375rem", // UPDATED: 15px (was 14px subtitle2)
                }}
              >
                Cảnh báo
              </Typography>
              <Typography
                sx={{
                  color: "#4A4A68",
                  lineHeight: 1.6,
                  fontSize: "0.8125rem", // UPDATED: 13px (was 12px caption)
                }}
              >
                Hành động này sẽ xóa hoàn toàn tệp tin khỏi cơ sở dữ liệu và hệ
                thống lưu trữ. <strong>Không thể khôi phục lại.</strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Notify Author Checkbox */}
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: notifyAuthor ? alpha("#2196F3", 0.08) : "#FAFAFC",
            border: "1px solid",
            borderColor: notifyAuthor ? alpha("#2196F3", 0.2) : "#F0F0F5",
            mb: 3,
            transition: "all 0.2s ease",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={notifyAuthor}
                onChange={(e) => setNotifyAuthor(e.target.checked)}
                disabled={loading}
                sx={{
                  color: "#8E8EA9",
                  "&.Mui-checked": {
                    color: "#2196F3",
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon
                  sx={{
                    fontSize: 18,
                    color: notifyAuthor ? "#2196F3" : "#8E8EA9",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4A4A68",
                    fontSize: "0.875rem", // UPDATED: 14px (was 12px body2)
                  }}
                >
                  Gửi thông báo cho Tác giả về việc xóa này
                </Typography>
              </Box>
            }
            sx={{
              m: 0,
              width: "100%",
              ".MuiFormControlLabel-label": {
                flex: 1,
              },
            }}
          />
        </Box>

        {/* ========== ACTION BUTTONS ========== */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
            sx={{
              borderColor: "#E0E0E0",
              color: "#4A4A68",
              borderRadius: "12px",
              py: 1.25,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.9375rem", // UPDATED: 15px (was 14px)
              "&:hover": {
                borderColor: "#C4C4D4",
                bgcolor: "#FAFAFC",
              },
            }}
          >
            Hủy bỏ
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleConfirm}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{
              bgcolor: "#D32F2F",
              color: "white",
              borderRadius: "12px",
              py: 1.25,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.9375rem", // UPDATED: 15px (was 14px)
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
            {loading ? "Đang xóa..." : "Xác nhận Xóa"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDocumentDialog;
