/**
 * FileViewer Component
 * Smart wrapper component để hiển thị tài liệu PDF hoặc EPUB
 *
 * Đường dẫn: src/components/common/file-viewer/FileViewer.jsx
 *
 * Tính năng:
 * - Tự động detect format từ fileFormat prop hoặc file extension
 * - Hỗ trợ overlay cho preview mode (user chưa đăng nhập)
 * - Tích hợp với authentication
 */

import { Box, Typography, Button, alpha, useTheme, Chip } from "@mui/material";
import {
  Lock as LockIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
} from "@mui/icons-material";
import PDFViewer from "./PDFViewer.jsx";
import EpubViewer from "./EpubViewer.jsx";

/**
 * FileViewer Component
 * Component điều hướng để chọn PDF hoặc EPUB viewer
 *
 * @param {string} fileUrl - URL đầy đủ của file (đã bao gồm base URL)
 * @param {string} fileName - Tên file để download
 * @param {string} fileFormat - Định dạng file ('pdf' | 'epub')
 * @param {string} title - Tiêu đề tài liệu (cho EPUB)
 * @param {boolean} isPreview - Hiển thị overlay yêu cầu đăng nhập
 * @param {Function} onLoginClick - Callback khi click nút đăng nhập
 * @param {boolean} showToolbar - Hiển thị toolbar (default: true)
 * @param {boolean} showDownload - Hiển thị nút download (default: true)
 * @param {boolean} showFormatBadge - Hiển thị badge format (default: false)
 */
const FileViewer = ({
  fileUrl,
  fileName = "document",
  fileFormat,
  title = "",
  isPreview = false,
  onLoginClick,
  showToolbar = true,
  showDownload = true,
  showFormatBadge = false,
}) => {
  const theme = useTheme();

  /**
   * Xác định định dạng file
   * Ưu tiên: fileFormat prop > file extension
   */
  const getFileFormat = () => {
    // Ưu tiên dùng fileFormat từ prop
    if (fileFormat) {
      return fileFormat.toLowerCase();
    }

    // Fallback: check đuôi file từ fileName hoặc fileUrl
    const name = fileName || fileUrl || "";
    if (name.toLowerCase().endsWith(".epub")) {
      return "epub";
    }

    // Mặc định là PDF
    return "pdf";
  };

  const format = getFileFormat();
  const isEpub = format === "epub";

  /**
   * Render overlay yêu cầu đăng nhập
   */
  const renderLoginOverlay = () => (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: alpha("#000", 0.7),
        backdropFilter: "blur(8px)",
        zIndex: 10,
      }}
    >
      {/* Icon placeholder */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.1,
          zIndex: 1,
        }}
      >
        {isEpub ? (
          <EpubIcon sx={{ fontSize: 200, color: "white" }} />
        ) : (
          <PdfIcon sx={{ fontSize: 200, color: "white" }} />
        )}
      </Box>

      {/* Login prompt */}
      <Box
        sx={{
          backgroundColor: alpha("#fff", 0.95),
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          maxWidth: 400,
          boxShadow: theme.shadows[10],
          zIndex: 2,
        }}
      >
        <LockIcon
          sx={{
            fontSize: 48,
            color: theme.palette.primary.main,
            mb: 2,
          }}
        />

        <Typography variant="h6" gutterBottom fontWeight={600}>
          Yêu cầu đăng nhập
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Vui lòng đăng nhập để đọc tài liệu {isEpub ? "EPUB" : "PDF"} này. Bạn
          cần có tài khoản để truy cập nội dung đầy đủ.
        </Typography>

        <Button
          variant="contained"
          onClick={onLoginClick}
          sx={{
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
            px: 4,
            py: 1,
          }}
        >
          Đăng nhập ngay
        </Button>
      </Box>
    </Box>
  );

  /**
   * Render format badge
   */
  const renderFormatBadge = () => (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 5,
      }}
    >
      <Chip
        icon={isEpub ? <EpubIcon /> : <PdfIcon />}
        label={isEpub ? "EPUB" : "PDF"}
        size="small"
        sx={{
          backgroundColor: isEpub
            ? alpha(theme.palette.warning.main, 0.9)
            : alpha(theme.palette.error.main, 0.9),
          color: "white",
          fontWeight: 600,
          "& .MuiChip-icon": {
            color: "white",
          },
        }}
      />
    </Box>
  );

  // Preview mode - chưa đăng nhập
  if (isPreview) {
    return (
      <Box
        sx={{
          height: "100%",
          minHeight: 400,
          position: "relative",
          backgroundColor: "#525252",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {showFormatBadge && renderFormatBadge()}
        {renderLoginOverlay()}
      </Box>
    );
  }

  // Đã đăng nhập - hiển thị viewer
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 500,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {showFormatBadge && renderFormatBadge()}

      {/* Viewer */}
      <Box sx={{ flex: 1, position: "relative" }}>
        {isEpub ? (
          <EpubViewer
            url={fileUrl}
            fileName={fileName || "document.epub"}
            title={title}
            showToolbar={showToolbar}
            showDownload={showDownload}
          />
        ) : (
          <PDFViewer
            url={fileUrl}
            fileName={fileName || "document.pdf"}
            showToolbar={showToolbar}
            showDownload={showDownload}
          />
        )}
      </Box>
    </Box>
  );
};

export default FileViewer;
