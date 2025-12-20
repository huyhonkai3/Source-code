import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  ReportProblem as WarningIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

/**
 * DeleteDocumentDialog Component
 * Confirmation dialog for permanently deleting documents
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
  // State for notify author checkbox
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
      setNotifyAuthor(true); // Reset to default
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
          borderRadius: 2,
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        disabled={loading}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "grey.500",
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 4, pb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Warning Icon */}
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "error.lighter",
              color: "error.main",
              mb: 2,
            }}
          >
            <WarningIcon sx={{ fontSize: 36 }} />
          </Avatar>

          {/* Title */}
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Xóa tài liệu vĩnh viễn?
          </Typography>

          {/* Message */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bạn đang thực hiện xóa tài liệu{" "}
            <Typography
              component="span"
              variant="body2"
              fontWeight="bold"
              color="text.primary"
            >
              "{document?.title || "N/A"}"
            </Typography>{" "}
            của tác giả{" "}
            <Typography
              component="span"
              variant="body2"
              fontWeight="bold"
              color="text.primary"
            >
              {document?.uploadedBy?.name || "N/A"}
            </Typography>{" "}
            khỏi cơ sở dữ liệu và hệ thống lưu trữ.
          </Typography>

          {/* Warning Alert Box */}
          <Alert
            severity="error"
            sx={{
              width: "100%",
              bgcolor: "error.lighter",
              color: "error.dark",
              mb: 2,
              textAlign: "left",
              "& .MuiAlert-icon": {
                color: "error.main",
              },
            }}
          >
            <Typography variant="caption" component="div">
              <strong>Cảnh báo:</strong> Hành động này sẽ xóa hoàn toàn tệp tin
              khỏi cơ sở dữ liệu và hệ thống lưu trữ. Không thể khôi phục lại.
            </Typography>
          </Alert>

          {/* Notify Author Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={notifyAuthor}
                onChange={(e) => setNotifyAuthor(e.target.checked)}
                disabled={loading}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                Gửi thông báo cho Tác giả về việc xóa này
              </Typography>
            }
            sx={{
              width: "100%",
              mb: 2,
              ml: 0,
              ".MuiFormControlLabel-label": {
                flex: 1,
              },
            }}
          />

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{
                color: "text.secondary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "text.secondary",
                  bgcolor: "action.hover",
                },
              }}
            >
              Hủy bỏ
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={handleConfirm}
              disabled={loading}
              startIcon={loading ? null : <DeleteIcon />}
              sx={{
                fontWeight: 600,
              }}
            >
              {loading ? "Đang xóa..." : "Xác nhận Xóa"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDocumentDialog;
