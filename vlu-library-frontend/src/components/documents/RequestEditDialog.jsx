/**
 * RequestEditDialog.jsx
 * Dialog để Author gửi yêu cầu chỉnh sửa tài liệu đã được duyệt
 *
 * Đường dẫn: src/components/documents/RequestEditDialog.jsx
 */

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  alpha,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Lock as LockIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import documentsAPI from "../../api/documents.api";

const RequestEditDialog = ({ open, onClose, document, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_CHARS = 500;
  const isValid = reason.trim().length >= 10;

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Lý do phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const docId = document?.id || document?._id;
      await documentsAPI.requestEdit(docId, reason.trim());
      setReason("");
      onSuccess?.();
      handleClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Không thể gửi yêu cầu. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          boxShadow: "0 24px 60px rgba(26,26,46,0.2)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            background: "linear-gradient(135deg, #2196F3 0%, #1565C0 100%)",
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}
              >
                Xin cấp quyền chỉnh sửa
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8125rem" }}
              >
                Tài liệu đã xuất bản
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Document info */}
        {document && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: "14px",
              bgcolor: alpha("#2196F3", 0.06),
              border: `1px solid ${alpha("#2196F3", 0.15)}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <LockIcon sx={{ color: "#2196F3", fontSize: 20 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#1A1A2E",
                  fontSize: "0.9375rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {document.title}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Chip
                  label="Đã xuất bản"
                  size="small"
                  sx={{
                    height: 20,
                    bgcolor: alpha("#4CAF50", 0.1),
                    color: "#4CAF50",
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Notice */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "12px",
            bgcolor: alpha("#FF9800", 0.06),
            border: `1px solid ${alpha("#FF9800", 0.2)}`,
            display: "flex",
            gap: 1.5,
          }}
        >
          <InfoIcon
            sx={{ color: "#FF9800", fontSize: 20, mt: 0.2, flexShrink: 0 }}
          />
          <Typography
            sx={{ color: "#6B4200", fontSize: "0.875rem", lineHeight: 1.6 }}
          >
            Tài liệu đã xuất bản không thể tự ý chỉnh sửa. Vui lòng mô tả{" "}
            <strong>lý do cần chỉnh sửa</strong> để Admin xem xét và cấp quyền.
            Sau khi được duyệt, tài liệu sẽ tạm thời chuyển về trạng thái "Chờ
            duyệt" để bạn chỉnh sửa.
          </Typography>
        </Box>

        {/* Reason input */}
        <Typography
          sx={{
            fontWeight: 600,
            color: "#1A1A2E",
            mb: 1,
            fontSize: "0.9375rem",
          }}
        >
          Lý do xin chỉnh sửa{" "}
          <Box component="span" sx={{ color: "#D32F2F" }}>
            *
          </Box>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="VD: Cần cập nhật thông tin tác giả và năm xuất bản. Bản hiện tại có sai sót trong phần mô tả..."
          value={reason}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setReason(e.target.value);
              setError("");
            }
          }}
          error={!!error}
          helperText={
            error || `${reason.length}/${MAX_CHARS} ký tự (tối thiểu 10)`
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              fontSize: "0.9375rem",
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#2196F3",
              },
            },
            "& .MuiFormHelperText-root": {
              fontSize: "0.8125rem",
              color: error ? "#D32F2F" : "#8E8EA9",
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<CloseIcon />}
          sx={{
            flex: 1,
            color: "#4A4A68",
            borderRadius: "14px",
            py: 1.25,
            fontWeight: 600,
            fontSize: "0.9375rem",
            textTransform: "none",
            border: "1px solid #E0E0E0",
            "&:hover": { bgcolor: "#F5F5F5" },
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          sx={{
            flex: 2,
            background: isValid
              ? "linear-gradient(135deg, #2196F3 0%, #1565C0 100%)"
              : undefined,
            borderRadius: "14px",
            py: 1.25,
            fontWeight: 600,
            fontSize: "0.9375rem",
            textTransform: "none",
            boxShadow: isValid ? "0 6px 20px rgba(33,150,243,0.4)" : undefined,
            "&:hover": {
              background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
            },
          }}
        >
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestEditDialog;
