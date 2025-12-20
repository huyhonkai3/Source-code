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
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import documentsAPI from "../../api/documents.api";

/**
 * DownloadDialog Component
 * Dialog xử lý quy trình tải xuống tài liệu
 * States: confirm -> downloading -> success/error
 */
const DownloadDialog = ({ open, onClose, document }) => {
  const [step, setStep] = useState("confirm"); // confirm | downloading | success | error
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
   * Handle download process
   */
  const handleDownload = async () => {
    setStep("downloading");

    try {
      const docId = document.id || document._id;

      // 1. Download file
      const response = await documentsAPI.download(docId);
      console.log(response);

      // 2. Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute("download", document.fileName);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // 3. Track download
      try {
        await documentsAPI.trackDownload(docId);
      } catch (trackError) {
        console.error("Track download error:", trackError);
      }

      // 4. Show success
      setStep("success");

      // 5. Auto close after 2s
      setTimeout(() => {
        handleClose();
      }, 2000);
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

  /**
   * Render dialog content based on step
   */
  const renderContent = () => {
    switch (step) {
      case "confirm":
        return (
          <>
            <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
              Tải xuống tài liệu
            </DialogTitle>

            <DialogContent>
              {/* PDF Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  bgcolor: "error.lighter",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <PdfIcon sx={{ fontSize: 48, color: "error.main" }} />
              </Box>

              {/* Document Info */}
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ textAlign: "center", mb: 1 }}
              >
                {document?.title}
              </Typography>

              {/* File Metadata */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  mb: 3,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Kích thước
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {formatFileSize(document?.fileSize)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Loại file
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {getFileExtension()}
                  </Typography>
                </Box>
              </Box>

              {/* Disclaimer */}
              <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                Tài liệu này phục vụ mục đích học tập và nghiên cứu. Vui lòng
                tuân thủ quy định về bản quyền.
              </Alert>
            </DialogContent>

            <DialogActions
              sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={handleDownload}
                sx={{
                  bgcolor: "error.main",
                  py: 1.2,
                  "&:hover": {
                    bgcolor: "error.dark",
                  },
                }}
              >
                Tải xuống ngay
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={handleClose}
                sx={{ py: 1 }}
              >
                Hủy bỏ
              </Button>
            </DialogActions>
          </>
        );

      case "downloading":
        return (
          <>
            <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
              Đang chuẩn bị tải xuống...
            </DialogTitle>

            <DialogContent>
              <Box sx={{ py: 4 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "error.lighter",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <PdfIcon sx={{ fontSize: 32, color: "error.main" }} />
                </Box>

                <LinearProgress
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 2,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "error.main",
                    },
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  Hệ thống đang tạo liên kết tải xuống an toàn. Vui lòng đợi
                  trong giây lát...
                </Typography>

                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ display: "block", textAlign: "center", mt: 2 }}
                >
                  * Vui lòng không đóng của sổ này
                </Typography>
              </Box>
            </DialogContent>
          </>
        );

      case "success":
        return (
          <>
            <DialogContent sx={{ pt: 4, pb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "success.lighter",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <CheckIcon sx={{ fontSize: 48, color: "success.main" }} />
              </Box>

              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ textAlign: "center", mb: 1 }}
              >
                Tải xuống thành công!
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                File đã được tải về thiết bị của bạn. Kiểm tra thư mục Download
                để xem tài liệu.
              </Typography>
            </DialogContent>
          </>
        );

      case "error":
        return (
          <>
            <DialogContent sx={{ pt: 4, pb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "error.lighter",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />
              </Box>

              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ textAlign: "center", mb: 1 }}
              >
                Tải xuống thất bại
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", mb: 2 }}
              >
                {errorMessage}
              </Typography>

              <Alert severity="warning" sx={{ fontSize: "0.875rem" }}>
                Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ nếu lỗi tiếp
                tục xảy ra.
              </Alert>
            </DialogContent>

            <DialogActions
              sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={() => setStep("confirm")}
                sx={{
                  bgcolor: "error.main",
                  "&:hover": {
                    bgcolor: "error.dark",
                  },
                }}
              >
                Thử lại
              </Button>
              <Button fullWidth variant="text" onClick={handleClose}>
                Đóng
              </Button>
            </DialogActions>
          </>
        );

      default:
        return null;
    }
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
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      {renderContent()}
    </Dialog>
  );
};

export default DownloadDialog;
