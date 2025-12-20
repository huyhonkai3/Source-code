import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
} from "@mui/material";
import {
  ReportProblem as WarningIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Block as BlockIcon,
} from "@mui/icons-material";

/**
 * RejectDialog Component
 * Dialog từ chối tài liệu với quick tags và text area
 *
 * @param {boolean} open - Trạng thái hiển thị dialog
 * @param {Function} onClose - Callback đóng dialog
 * @param {Function} onConfirm - Callback xác nhận từ chối (nhận reason)
 * @param {boolean} loading - Trạng thái đang xử lý
 */
const RejectDialog = ({ open, onClose, onConfirm, loading = false }) => {
  const [reason, setReason] = useState("");

  // Common rejection reasons
  const commonReasons = [
    "Vi phạm bản quyền",
    "Chất lượng thấp",
    "Sai danh mục",
    "Nội dung không phù hợp",
  ];

  /**
   * Handle tag click - Add tag to reason
   */
  const handleTagClick = (tag) => {
    if (reason.trim()) {
      // Already has content - add new line
      setReason((prev) => `${prev}\n- ${tag}`);
    } else {
      // Empty - start with bullet
      setReason(`- ${tag}`);
    }
  };

  /**
   * Handle confirm
   */
  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  /**
   * Handle close - Reset reason
   */
  const handleClose = () => {
    if (!loading) {
      setReason("");
      onClose();
    }
  };

  /**
   * Check if reason is valid
   */
  const isValid = reason.trim().length > 0;

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
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 2,
        }}
      >
        {/* Warning Icon */}
        <WarningIcon
          sx={{
            color: "error.main",
            fontSize: 28,
          }}
        />

        {/* Title Text */}
        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
          Từ chối tài liệu
        </Typography>

        {/* Close Button */}
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

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 0 }}>
        {/* Warning Alert */}
        <Alert
          severity="warning"
          icon={<InfoIcon />}
          sx={{
            mb: 3,
            backgroundColor: "#FFF3E0",
            color: "#E65100",
            "& .MuiAlert-icon": {
              color: "#F57C00",
            },
          }}
        >
          Vui lòng chọn lý do từ chối. Thông báo này sẽ được gửi trực tiếp đến
          tác giả.
        </Alert>

        {/* Common Reasons Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{
              display: "block",
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Lý do phổ biến
          </Typography>

          {/* Quick Tags */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {commonReasons.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagClick(tag)}
                disabled={loading}
                variant="outlined"
                sx={{
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "error.main",
                    backgroundColor: "rgba(211, 47, 47, 0.08)",
                  },
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Reason TextField */}
        <Box>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{
              display: "block",
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Chi tiết lý do
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập lý do chi tiết từ chối tại đây..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
            }}
          />

          {/* Character hint */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 0.5,
              textAlign: "right",
            }}
          >
            {reason.length} ký tự
          </Typography>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 1.5,
        }}
      >
        {/* Cancel Button */}
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{
            minWidth: 120,
            borderColor: "divider",
            color: "text.secondary",
            "&:hover": {
              borderColor: "text.secondary",
              backgroundColor: "action.hover",
            },
          }}
        >
          Hủy bỏ
        </Button>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirm}
          disabled={!isValid || loading}
          variant="contained"
          color="error"
          startIcon={<BlockIcon />}
          sx={{
            minWidth: 180,
            fontWeight: 600,
          }}
        >
          {loading ? "Đang xử lý..." : "Xác nhận Từ chối"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectDialog;
