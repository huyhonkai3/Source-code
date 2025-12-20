import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

/**
 * RequestAuthorDialog Component
 * Dialog để user gửi yêu cầu nâng cấp lên Author
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSubmit - Submit handler
 * @param {boolean} loading - Loading state
 */
const RequestAuthorDialog = ({ open, onClose, onSubmit, loading = false }) => {
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Validation: Disable submit nếu chưa nhập lý do hoặc chưa check cam kết
  const isValid = reason.trim().length >= 10 && agreed;

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ reason: reason.trim() });
  };

  /**
   * Handle close - reset form
   */
  const handleClose = () => {
    if (loading) return; // Không cho đóng khi đang submit
    setReason("");
    setAgreed(false);
    onClose();
  };

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
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "error.lighter",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SecurityIcon sx={{ color: "error.main", fontSize: 28 }} />
          </Box>

          {/* Title */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Đăng ký trở thành tác giả
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Quyền lợi và Trách nhiệm
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton onClick={handleClose} disabled={loading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        {/* Intro Text */}
        <Typography variant="body2" color="text.secondary" paragraph>
          Để đảm bảo chất lượng và tính hợp pháp của tài liệu trên Thư viện số
          Đại học Văn Lang, vui lòng đọc kỹ và đồng ý với các điều khoản dưới
          đây trước khi gửi yêu cầu nâng cấp tài khoản.
        </Typography>

        {/* Benefits & Responsibilities */}
        <Box
          sx={{
            bgcolor: "grey.50",
            p: 2,
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            ĐIỀU KHOẢN VÀ CAM KẾT
          </Typography>

          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
            <strong>1. Bản quyền nội dung:</strong> Bạn cam kết rằng tất cả tài
            liệu bạn tải lên đều thuộc quyền sở hữu trí tuệ của bạn hoặc bạn có
            quyền hợp pháp để phân phối chúng. Nghiêm cấm tải lên các tài liệu
            vi phạm bản quyền của bên thứ ba.
          </Typography>

          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
            <strong>2. Chất lượng tài liệu:</strong> Tài liệu phải đảm bảo tính
            chính xác, khoa học và phù hợp với môi trường giáo dục đại học.
            Không chứa nội dung đồi trụy, phản động hoặc vi phạm pháp luật Việt
            Nam.
          </Typography>

          <Typography variant="body2" component="div">
            <strong>3. Trách nhiệm pháp lý:</strong> Bạn hoàn toàn chịu trách
            nhiệm trước pháp luật về nội dung tài liệu mà mình đăng tải. Nhà
            trường có quyền gỡ bỏ tài liệu và khóa tài khoản nếu phát hiện vi
            phạm mà không cần báo trước.
          </Typography>
        </Box>

        {/* Reason Input */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Lý do / Giới thiệu (Tùy chọn)"
          placeholder="Ví dụ: Tôi muốn chia sẻ các giảng và tài liệu tham khảo cho môn Lập trình Web..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          helperText={`${reason.length}/1000 ký tự (tối thiểu 10 ký tự)`}
          error={reason.length > 0 && reason.length < 10}
        />

        {/* Checkbox Agreement */}
        <FormControlLabel
          control={
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loading}
            />
          }
          label={
            <Typography variant="body2">
              Tôi đã đọc và đồng ý với các <strong>Điều khoản & Cam kết</strong>{" "}
              nếu trên
            </Typography>
          }
        />

        {/* Error Message */}
        {reason.length > 0 && reason.length < 10 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Lý do phải có ít nhất 10 ký tự
          </Alert>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ color: "text.secondary", borderColor: "grey.300" }}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          variant="contained"
          color="error"
          startIcon={loading ? null : <SecurityIcon />}
        >
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestAuthorDialog;
