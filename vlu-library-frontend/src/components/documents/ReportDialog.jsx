import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  alpha,
  Fade,
} from "@mui/material";
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import reportsAPI from "../../api/reports.api";

// ==================== CONSTANTS ====================

const REPORT_REASONS = [
  {
    value: "COPYRIGHT_INFRINGEMENT",
    label: "Vi phạm bản quyền",
    description:
      "Tài liệu đăng tải trái phép, không có sự cho phép của chủ sở hữu bản quyền",
    color: "#D32F2F",
    warning:
      "⚠️ Báo cáo này sẽ tạm ẩn tài liệu ngay lập tức để chờ Admin xét duyệt.",
  },
  {
    value: "INAPPROPRIATE_CONTENT",
    label: "Nội dung không phù hợp",
    description:
      "Nội dung phản cảm, vi phạm thuần phong mỹ tục hoặc quy định của nền tảng",
    color: "#FF9800",
  },
  {
    value: "WRONG_CATEGORY",
    label: "Sai danh mục",
    description:
      "Tài liệu được phân loại sai danh mục, gây khó khăn cho việc tìm kiếm",
    color: "#2196F3",
  },
  {
    value: "SPAM",
    label: "Spam / Trùng lặp",
    description: "Tài liệu đã tồn tại hoặc là nội dung spam không có giá trị",
    color: "#9E9E9E",
  },
  {
    value: "OTHER",
    label: "Lý do khác",
    description: "Vui lòng mô tả chi tiết trong phần ghi chú bên dưới",
    color: "#607D8B",
  },
];

// ==================== COMPONENT ====================

/**
 * ReportDialog - Modal báo cáo vi phạm tài liệu (Notice & Takedown)
 *
 * @param {boolean} open - Trạng thái mở dialog
 * @param {Function} onClose - Callback đóng dialog
 * @param {string} documentId - ID tài liệu bị báo cáo
 * @param {string} documentTitle - Tiêu đề tài liệu (để hiển thị)
 */
const ReportDialog = ({ open, onClose, documentId, documentTitle }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedReasonConfig = REPORT_REASONS.find(
    (r) => r.value === selectedReason,
  );

  const handleClose = () => {
    if (loading) return;
    // Reset state khi đóng
    setSelectedReason("");
    setDescription("");
    setError("");
    setSuccess(false);
    setSuccessMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError("Vui lòng chọn lý do báo cáo.");
      return;
    }
    if (selectedReason === "OTHER" && !description.trim()) {
      setError("Vui lòng mô tả lý do báo cáo trong phần ghi chú.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await reportsAPI.createReport({
        documentId,
        reason: selectedReason,
        description: description.trim(),
      });

      setSuccessMessage(
        response.message || "Báo cáo đã được ghi nhận thành công.",
      );
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.";
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
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: alpha("#D32F2F", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlagIcon sx={{ fontSize: 22, color: "#D32F2F" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1A1A2E" }}
              >
                Báo cáo vi phạm
              </Typography>
              {documentTitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#8E8EA9",
                    display: "block",
                    maxWidth: 300,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {documentTitle}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{ color: "#8E8EA9", "&:hover": { bgcolor: "#F0F0F5" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* ========== SUCCESS VIEW ========== */}
        {success ? (
          <Fade in={success}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2.5,
                  borderRadius: "50%",
                  bgcolor: alpha("#4CAF50", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "scaleIn 0.3s ease",
                  "@keyframes scaleIn": {
                    from: { transform: "scale(0)" },
                    to: { transform: "scale(1)" },
                  },
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 44, color: "#4CAF50" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
              >
                Báo cáo đã được ghi nhận
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#4A4A68", lineHeight: 1.7 }}
              >
                {successMessage}
              </Typography>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  mt: 3,
                  bgcolor: "#D32F2F",
                  borderRadius: "12px",
                  px: 4,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(211,47,47,0.25)",
                  "&:hover": { bgcolor: "#B71C1C" },
                }}
              >
                Đóng
              </Button>
            </Box>
          </Fade>
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{ color: "#4A4A68", mb: 3, lineHeight: 1.6 }}
            >
              Hãy chọn lý do phù hợp nhất để giúp chúng tôi xem xét báo cáo của
              bạn một cách nhanh chóng và chính xác.
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ mb: 2, borderRadius: "10px" }}
              >
                {error}
              </Alert>
            )}

            {/* ========== REASON SELECTION ========== */}
            <RadioGroup
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError("");
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason.value;
                  return (
                    <Box
                      key={reason.value}
                      onClick={() => setSelectedReason(reason.value)}
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        border: "2px solid",
                        borderColor: isSelected ? reason.color : "#F0F0F5",
                        bgcolor: isSelected
                          ? alpha(reason.color, 0.05)
                          : "#FAFAFC",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: reason.color,
                          bgcolor: alpha(reason.color, 0.03),
                        },
                      }}
                    >
                      <FormControlLabel
                        value={reason.value}
                        control={
                          <Radio
                            sx={{
                              p: 0.5,
                              color: "#C4C4D4",
                              "&.Mui-checked": { color: reason.color },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ ml: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? reason.color : "#1A1A2E",
                              }}
                            >
                              {reason.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#8E8EA9", display: "block" }}
                            >
                              {reason.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: "100%" }}
                      />

                      {/* Warning cho copyright infringement */}
                      {isSelected && reason.warning && (
                        <Fade in>
                          <Alert
                            severity="warning"
                            sx={{
                              mt: 1.5,
                              borderRadius: "8px",
                              py: 0.5,
                              "& .MuiAlert-icon": { fontSize: 18 },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              {reason.warning}
                            </Typography>
                          </Alert>
                        </Fade>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </RadioGroup>

            {/* ========== DESCRIPTION ========== */}
            <Box sx={{ mt: 2.5 }}>
              <TextField
                label={
                  selectedReason === "OTHER"
                    ? "Mô tả chi tiết *"
                    : "Thêm mô tả (không bắt buộc)"
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Hãy mô tả cụ thể về vi phạm bạn phát hiện để giúp chúng tôi xử lý nhanh hơn..."
                inputProps={{ maxLength: 500 }}
                helperText={`${description.length}/500 ký tự`}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D32F2F",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#D32F2F" },
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>

      {/* ========== ACTIONS ========== */}
      {!success && (
        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
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
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !selectedReason}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            sx={{
              bgcolor: "#D32F2F",
              borderRadius: "12px",
              px: 4,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(211,47,47,0.25)",
              "&:hover": { bgcolor: "#B71C1C" },
              "&:disabled": { bgcolor: "#C4C4D4", boxShadow: "none" },
            }}
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportDialog;
