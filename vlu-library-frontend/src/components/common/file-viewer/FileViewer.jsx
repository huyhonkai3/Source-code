import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
  Chip,
  Fab,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Lock as LockIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import PDFViewer from "./PDFViewer.jsx";
import EpubViewer from "./EpubViewer.jsx";
import { saveBookmark, getBookmark } from "../../../api/bookmarks.api";
import { useAuth } from "../../../context/AuthContext";

const FileViewer = ({
  documentId,
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
  const { isAuthenticated } = useAuth();

  // ── Bookmark state ─────────────────────────────────────────────────────────
  const [initialLocation, setInitialLocation] = useState(null);
  const [bookmarkReady, setBookmarkReady] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const currentLocationRef = useRef(null);

  // ── Load bookmark ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!documentId || !isAuthenticated || isPreview) {
      setBookmarkReady(true);
      return;
    }

    let cancelled = false;

    const loadBookmark = async () => {
      const position = await getBookmark(documentId);
      if (cancelled) return;
      if (position) {
        setInitialLocation(position);
        currentLocationRef.current = position;
      }
      setBookmarkReady(true);
    };

    loadBookmark();
    return () => {
      cancelled = true;
    };
  }, [documentId, isAuthenticated, isPreview]);

  // ── Location change callback ───────────────────────────────────────────────
  const handleLocationChange = useCallback((location) => {
    if (location) currentLocationRef.current = location;
  }, []);

  // ── Save bookmark ──────────────────────────────────────────────────────────
  const handleSaveBookmark = async () => {
    const loc = currentLocationRef.current;
    if (!documentId || !loc) {
      setSnackbar({
        open: true,
        message: "Chưa có vị trí để lưu",
        severity: "warning",
      });
      return;
    }

    setBookmarkLoading(true);
    const result = await saveBookmark(documentId, loc);
    setBookmarkLoading(false);

    if (result) {
      setBookmarkSaved(true);
      setSnackbar({
        open: true,
        message: "Đã lưu vị trí đọc 🔖",
        severity: "success",
      });
      setTimeout(() => setBookmarkSaved(false), 2000);
    } else {
      setSnackbar({
        open: true,
        message: "Không thể lưu, vui lòng thử lại",
        severity: "error",
      });
    }
  };

  // ── Format detection ───────────────────────────────────────────────────────
  const getFileFormat = () => {
    if (fileFormat) return fileFormat.toLowerCase();
    const name = fileName || fileUrl || "";
    if (name.toLowerCase().endsWith(".epub")) return "epub";
    return "pdf";
  };

  const format = getFileFormat();
  const isEpub = format === "epub";

  // ── Render helpers ─────────────────────────────────────────────────────────
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
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
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
          sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }}
        />
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Yêu cầu đăng nhập
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Vui lòng đăng nhập để đọc tài liệu {isEpub ? "EPUB" : "PDF"} này.
        </Typography>
        <Button
          variant="contained"
          onClick={onLoginClick}
          sx={{
            bgcolor: theme.palette.primary.main,
            "&:hover": { bgcolor: theme.palette.primary.dark },
            px: 4,
            py: 1,
          }}
        >
          Đăng nhập ngay
        </Button>
      </Box>
    </Box>
  );

  const renderFormatBadge = () => (
    <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 5 }}>
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
          "& .MuiChip-icon": { color: "white" },
        }}
      />
    </Box>
  );

  // ── Preview mode ───────────────────────────────────────────────────────────
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

  // ── Full viewer ────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        height: "100%",
        // FIX: minHeight: 0 cho phép flex child shrink → scroll hoạt động đúng
        // Không set minHeight cứng ở đây; parent DocumentDetailPage đã set height: 75vh
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {showFormatBadge && renderFormatBadge()}

      {/* Viewer wrapper
          FIX: flex: 1 + minHeight: 0 là cặp đôi bắt buộc trong flex column.
          flex: 1 → chiếm toàn bộ chiều cao còn lại.
          minHeight: 0 → cho phép shrink xuống dưới content size → scroll bar xuất hiện.
          Không dùng position: relative ở đây vì nó tạo stacking context mới
          có thể ảnh hưởng Bookmark FAB (position: absolute). */}
      <Box
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        {!bookmarkReady ? (
          <Box
            sx={{
              height: "100%",
              minHeight: 0,
              background: "linear-gradient(180deg, #1A1A2E 0%, #2D2D44 100%)",
            }}
          />
        ) : isEpub ? (
          <EpubViewer
            url={fileUrl}
            fileName={fileName || "document.epub"}
            title={title}
            showToolbar={showToolbar}
            showDownload={showDownload}
            initialLocation={initialLocation}
            onLocationChange={handleLocationChange}
          />
        ) : (
          <PDFViewer
            url={fileUrl}
            fileName={fileName || "document.pdf"}
            showToolbar={showToolbar}
            showDownload={showDownload}
            initialLocation={initialLocation}
            onLocationChange={handleLocationChange}
          />
        )}
      </Box>

      {/* Bookmark FAB — position absolute relative to FileViewer root */}
      {isAuthenticated && documentId && (
        <Tooltip
          title={bookmarkSaved ? "Đã lưu!" : "Lưu vị trí đọc"}
          placement="left"
          arrow
        >
          <Fab
            size="medium"
            onClick={handleSaveBookmark}
            disabled={bookmarkLoading}
            sx={{
              position: "absolute",
              bottom: 24,
              right: 16,
              zIndex: 20,
              bgcolor: bookmarkSaved ? "#388E3C" : "#D32F2F",
              color: "white",
              boxShadow: bookmarkSaved
                ? "0 4px 20px rgba(56,142,60,0.5)"
                : "0 4px 20px rgba(211,47,47,0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: bookmarkSaved ? "scale(1.1)" : "scale(1)",
              "&:hover": {
                bgcolor: bookmarkSaved ? "#2E7D32" : "#B71C1C",
                transform: "scale(1.12)",
              },
              "&:disabled": {
                bgcolor: "#9E9E9E",
                color: "rgba(255,255,255,0.7)",
              },
            }}
          >
            {bookmarkSaved ? (
              <BookmarkIcon sx={{ fontSize: 22 }} />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 22 }} />
            )}
          </Fab>
        </Tooltip>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "12px", fontWeight: 600, fontSize: "0.9375rem" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileViewer;
