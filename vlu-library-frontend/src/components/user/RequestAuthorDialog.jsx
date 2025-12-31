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
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Gavel as GavelIcon,
  HighQuality as QualityIcon,
  Copyright as CopyrightIcon,
  Send as SendIcon,
} from "@mui/icons-material";

/**
 * RequestAuthorDialog Component - VLU Design System v2.0
 * Modern & Bold dialog để user gửi yêu cầu nâng cấp lên Author
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSubmit - Submit handler
 * @param {boolean} loading - Loading state
 */
const RequestAuthorDialog = ({ open, onClose, onSubmit, loading = false }) => {
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Validation
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
    if (loading) return;
    setReason("");
    setAgreed(false);
    onClose();
  };

  // Terms items với icons
  const termsItems = [
    {
      icon: CopyrightIcon,
      title: "Bản quyền nội dung",
      description:
        "Bạn cam kết rằng tất cả tài liệu bạn tải lên đều thuộc quyền sở hữu trí tuệ của bạn hoặc bạn có quyền hợp pháp để phân phối chúng.",
      color: "#2196F3",
    },
    {
      icon: QualityIcon,
      title: "Chất lượng tài liệu",
      description:
        "Tài liệu phải đảm bảo tính chính xác, khoa học và phù hợp với môi trường giáo dục đại học.",
      color: "#4CAF50",
    },
    {
      icon: GavelIcon,
      title: "Trách nhiệm pháp lý",
      description:
        "Bạn hoàn toàn chịu trách nhiệm trước pháp luật về nội dung tài liệu mà mình đăng tải.",
      color: "#FF7043",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 24px 48px rgba(26, 26, 46, 0.2)",
          overflow: "hidden",
        },
      }}
    >
      {/* ========== HEADER ========== */}
      <DialogTitle
        sx={{
          p: 0,
          position: "relative",
        }}
      >
        {/* Gradient Background */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 50%, #FFC107 100%)",
            p: 3,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VerifiedIcon sx={{ fontSize: 32, color: "white" }} />
            </Box>

            {/* Title */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                Đăng ký trở thành Tác giả
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                Quyền lợi và Trách nhiệm
              </Typography>
            </Box>

            {/* Close Button */}
            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      {/* ========== CONTENT ========== */}
      <DialogContent sx={{ p: 3 }}>
        {/* Intro Text */}
        <Typography
          variant="body2"
          sx={{ color: "#4A4A68", mb: 3, lineHeight: 1.7 }}
        >
          Để đảm bảo chất lượng và tính hợp pháp của tài liệu trên Thư viện số
          Đại học Văn Lang, vui lòng đọc kỹ và đồng ý với các điều khoản dưới
          đây.
        </Typography>

        {/* ========== TERMS & CONDITIONS ========== */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "#1A1A2E",
              mb: 2,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.75rem",
            }}
          >
            Điều khoản & Cam kết
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {termsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: 2,
                    bgcolor: "#FAFAFC",
                    borderRadius: "12px",
                    border: "1px solid #F0F0F5",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: alpha(item.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 20, color: item.color }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#1A1A2E", mb: 0.5 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#8E8EA9",
                        fontSize: "0.8125rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ========== REASON INPUT ========== */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Lý do / Giới thiệu bản thân"
          placeholder="Ví dụ: Tôi muốn chia sẻ các giảng và tài liệu tham khảo cho môn Lập trình Web..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          error={reason.length > 0 && reason.length < 10}
          helperText={`${reason.length}/1000 ký tự (tối thiểu 10 ký tự)`}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: "#FAFAFC",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#C4C4D4",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D32F2F",
                borderWidth: "2px",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#D32F2F",
            },
          }}
        />

        {/* ========== CHECKBOX AGREEMENT ========== */}
        <FormControlLabel
          control={
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loading}
              sx={{
                color: "#C4C4D4",
                "&.Mui-checked": {
                  color: "#D32F2F",
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "#4A4A68" }}>
              Tôi đã đọc và đồng ý với các{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#D32F2F" }}>
                Điều khoản & Cam kết
              </Box>{" "}
              nêu trên
            </Typography>
          }
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: agreed ? alpha("#D32F2F", 0.04) : "#FAFAFC",
            border: "1px solid",
            borderColor: agreed ? alpha("#D32F2F", 0.2) : "#F0F0F5",
            m: 0,
            width: "100%",
            transition: "all 0.2s ease",
          }}
        />

        {/* Error Message */}
        {reason.length > 0 && reason.length < 10 && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              borderRadius: "12px",
            }}
          >
            Lý do phải có ít nhất 10 ký tự
          </Alert>
        )}
      </DialogContent>

      {/* ========== ACTIONS ========== */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: "1px solid #F0F0F5",
          bgcolor: "#FAFAFC",
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderColor: "#E0E0E0",
            color: "#4A4A68",
            borderRadius: "12px",
            px: 3,
            py: 1.25,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              borderColor: "#C4C4D4",
              bgcolor: "white",
            },
          }}
          variant="outlined"
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          sx={{
            bgcolor: "#D32F2F",
            color: "white",
            borderRadius: "12px",
            px: 3,
            py: 1.25,
            fontWeight: 600,
            textTransform: "none",
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
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestAuthorDialog;
