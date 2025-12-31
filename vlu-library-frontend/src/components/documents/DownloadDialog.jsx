import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import documentsAPI from "../../api/documents.api";

/**
 * DownloadDialog Component - VLU Design System v2.0
 * Modern & Bold dialog xử lý quy trình tải xuống tài liệu
 * States: confirm -> downloading -> success/error
 */
const DownloadDialog = ({ open, onClose, document }) => {
  const [step, setStep] = useState("confirm");
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  /**
   * Get file extension
   */
  const getFileExtension = () => {
    if (!document?.fileName) return "PDF";
    return document.fileName.split(".").pop().toUpperCase();
  };

  /**
   * Check if file is EPUB
   */
  const isEpub = () => {
    return getFileExtension() === "EPUB";
  };

  /**
   * Handle download process
   */
  const handleDownload = async () => {
    setStep("downloading");

    try {
      const docId = document.id || document._id;

      const response = await documentsAPI.download(docId);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute("download", document.fileName);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      try {
        await documentsAPI.trackDownload(docId);
      } catch (trackError) {
        console.error("Track download error:", trackError);
      }

      setStep("success");

      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (error) {
      console.error("Download error:", error);
      setErrorMessage(
        error.response?.data?.message || "Không thể tải xuống tài liệu",
      );
      setStep("error");
    }
  };

  /**
   * Handle close dialog
   */
  const handleClose = () => {
    setStep("confirm");
    setErrorMessage("");
    onClose();
  };

  if (!document) return null;

  return (
    <Dialog
      open={open}
      onClose={step === "downloading" ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown={step === "downloading"}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 24px 48px rgba(26,26,46,0.2)",
          overflow: "hidden",
        },
      }}
    >
      {/* ========== CONFIRM STEP ========== */}
      {step === "confirm" && (
        <>
          {/* Header */}
          <Box
            sx={{
              background: isEpub()
                ? "linear-gradient(135deg, #FF7043 0%, #FFB74D 100%)"
                : "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
              p: 3,
              textAlign: "center",
            }}
          >
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
              {isEpub() ? (
                <EpubIcon sx={{ fontSize: 36, color: "white" }} />
              ) : (
                <PdfIcon sx={{ fontSize: 36, color: "white" }} />
              )}
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
            >
              Tải xuống tài liệu
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Xác nhận để bắt đầu tải
            </Typography>
          </Box>

          <DialogContent sx={{ p: 3 }}>
            {/* Document Title */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1A1A2E",
                textAlign: "center",
                mb: 3,
                lineHeight: 1.4,
              }}
            >
              {document?.title}
            </Typography>

            {/* File Metadata */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
                mb: 3,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: "auto",
                    mb: 1,
                    borderRadius: "12px",
                    bgcolor: alpha("#2196F3", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderIcon sx={{ fontSize: 24, color: "#2196F3" }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#1A1A2E" }}
                >
                  {formatFileSize(document?.fileSize)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
                  Kích thước
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: "auto",
                    mb: 1,
                    borderRadius: "12px",
                    bgcolor: isEpub()
                      ? alpha("#FF7043", 0.1)
                      : alpha("#D32F2F", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isEpub() ? (
                    <EpubIcon sx={{ fontSize: 24, color: "#FF7043" }} />
                  ) : (
                    <PdfIcon sx={{ fontSize: 24, color: "#D32F2F" }} />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#1A1A2E" }}
                >
                  {getFileExtension()}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
                  Định dạng
                </Typography>
              </Box>
            </Box>

            {/* Disclaimer */}
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: alpha("#2196F3", 0.08),
                border: "1px solid",
                borderColor: alpha("#2196F3", 0.2),
                display: "flex",
                gap: 1.5,
              }}
            >
              <InfoIcon sx={{ fontSize: 20, color: "#2196F3", mt: 0.25 }} />
              <Typography
                variant="caption"
                sx={{ color: "#4A4A68", lineHeight: 1.6 }}
              >
                Tài liệu này phục vụ mục đích học tập và nghiên cứu. Vui lòng
                tuân thủ quy định về bản quyền.
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{ p: 3, pt: 0, flexDirection: "column", gap: 1.5 }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                bgcolor: "#D32F2F",
                color: "white",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                "&:hover": {
                  bgcolor: "#B71C1C",
                  boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
                },
              }}
            >
              Tải xuống ngay
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={handleClose}
              sx={{
                color: "#8E8EA9",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Hủy bỏ
            </Button>
          </DialogActions>
        </>
      )}

      {/* ========== DOWNLOADING STEP ========== */}
      {step === "downloading" && (
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 3,
              borderRadius: "50%",
              bgcolor: alpha("#D32F2F", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <CircularProgress
              size={80}
              thickness={2}
              sx={{
                color: "#D32F2F",
                position: "absolute",
              }}
            />
            <DownloadIcon sx={{ fontSize: 32, color: "#D32F2F" }} />
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
          >
            Đang chuẩn bị tải xuống...
          </Typography>

          <Typography variant="body2" sx={{ color: "#8E8EA9", mb: 3 }}>
            Hệ thống đang tạo liên kết tải xuống an toàn
          </Typography>

          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#F0F0F5",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#D32F2F",
                borderRadius: 3,
              },
            }}
          />

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 2,
              color: "#FF9800",
              fontWeight: 500,
            }}
          >
            Vui lòng không đóng cửa sổ này
          </Typography>
        </DialogContent>
      )}

      {/* ========== SUCCESS STEP ========== */}
      {step === "success" && (
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 3,
              borderRadius: "50%",
              bgcolor: alpha("#4CAF50", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "scaleIn 0.3s ease",
              "@keyframes scaleIn": {
                from: {
                  transform: "scale(0)",
                  opacity: 0,
                },
                to: {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
            }}
          >
            <CheckIcon sx={{ fontSize: 40, color: "#4CAF50" }} />
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
          >
            Tải xuống thành công!
          </Typography>

          <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
            File đã được tải về thiết bị của bạn.
            <br />
            Kiểm tra thư mục Downloads để xem tài liệu.
          </Typography>
        </DialogContent>
      )}

      {/* ========== ERROR STEP ========== */}
      {step === "error" && (
        <>
          <DialogContent sx={{ p: 4, textAlign: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 3,
                borderRadius: "50%",
                bgcolor: alpha("#D32F2F", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ErrorIcon sx={{ fontSize: 40, color: "#D32F2F" }} />
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
            >
              Tải xuống thất bại
            </Typography>

            <Typography variant="body2" sx={{ color: "#8E8EA9", mb: 3 }}>
              {errorMessage}
            </Typography>

            <Alert
              severity="warning"
              sx={{
                borderRadius: "12px",
                textAlign: "left",
              }}
            >
              Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ nếu lỗi tiếp tục
              xảy ra.
            </Alert>
          </DialogContent>

          <DialogActions
            sx={{ p: 3, pt: 0, flexDirection: "column", gap: 1.5 }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={() => setStep("confirm")}
              sx={{
                bgcolor: "#D32F2F",
                color: "white",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                "&:hover": {
                  bgcolor: "#B71C1C",
                },
              }}
            >
              Thử lại
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={handleClose}
              sx={{
                color: "#8E8EA9",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default DownloadDialog;
