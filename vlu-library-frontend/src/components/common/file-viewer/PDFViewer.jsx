/**
 * PDFViewer Component - VLU Design System v2.0.1
 * Modern & Bold với Enhanced toolbar, Better visual hierarchy + Tăng font sizes
 *
 * Component dùng chung để hiển thị file PDF sử dụng PDF.js
 * Đường dẫn: src/components/common/file-viewer/PDFViewer.jsx
 *
 * @requires pdfjs-dist - yarn add pdfjs-dist
 */

import { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ZoomOut as ZoomOutIcon,
  ZoomIn as ZoomInIcon,
  GetApp as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * PDFViewer Component
 * Hiển thị file PDF sử dụng PDF.js với authentication
 */
const PDFViewer = ({
  url,
  fileName = "document.pdf",
  showToolbar = true,
  showDownload = true,
  initialLocation = null,
  onLocationChange = null,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const initialPage = initialLocation ? parseInt(initialLocation, 10) || 1 : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!url) {
      setError("Không có file để hiển thị");
      setLoading(false);
      return;
    }
    loadPDF();
    return () => {
      if (pdfDoc) pdfDoc.destroy();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [currentPage, scale, pdfDoc]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!response.ok) {
        let errorMessage = "Không thể tải file PDF";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          if (response.status === 401)
            errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
          else if (response.status === 403)
            errorMessage = "Bạn không có quyền xem tài liệu này.";
          else if (response.status === 404)
            errorMessage = "Không tìm thấy file PDF.";
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      setBlobUrl(blobURL);

      const loadingTask = pdfjsLib.getDocument(blobURL);
      const pdf = await loadingTask.promise;

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      // Dùng initialPage từ bookmark nếu có, clamp trong phạm vi hợp lệ
      const restoredPage = initialLocation
        ? Math.min(
            Math.max(parseInt(initialLocation, 10) || 1, 1),
            pdf.numPages,
          )
        : 1;
      setCurrentPage(restoredPage);
      // Thông báo ngay cho FileViewer biết vị trí khởi đầu
      if (onLocationChange) onLocationChange(String(restoredPage));
      setLoading(false);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(err.message || "Không thể tải file PDF. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdfDoc || rendering) return;
    setRendering(true);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      setRendering(false);
    } catch (err) {
      console.error("Error rendering page:", err);
      setRendering(false);
    }
  };

  const setPageAndNotify = (page) => {
    setCurrentPage(page);
    if (onLocationChange) onLocationChange(String(page));
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setPageAndNotify(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setPageAndNotify(currentPage + 1);
  };
  const handlePageChange = (e) => {
    const pageNum = parseInt(e.target.value, 10);
    if (pageNum >= 1 && pageNum <= totalPages) setPageAndNotify(pageNum);
  };
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomChange = (e) => setScale(parseFloat(e.target.value));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleDownload = async () => {
    try {
      if (blobUrl) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const token = localStorage.getItem("accessToken");
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!response.ok) throw new Error("Không thể tải file");
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // Toolbar button style
  const toolbarButtonSx = {
    color: "white",
    bgcolor: "rgba(255,255,255,0.08)",
    borderRadius: "8px",
    "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
    "&:disabled": { color: "rgba(255,255,255,0.3)" },
  };

  // Select style
  const selectSx = {
    color: "white",
    fontSize: "0.875rem",
    fontWeight: 500,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.2)",
      borderRadius: "8px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.4)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#D32F2F",
    },
    "& .MuiSvgIcon-root": { color: "white" },
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #1A1A2E 0%, #2D2D44 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Toolbar */}
      {showToolbar && (
        <Box
          sx={{
            height: 56,
            minHeight: 56,
            background: "linear-gradient(135deg, #1A1A2E 0%, #252538 100%)",
            display: "flex",
            alignItems: "center",
            px: 2,
            gap: 1,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
          }}
        >
          {/* Left Group */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Menu" arrow>
              <IconButton size="small" sx={toolbarButtonSx}>
                <MenuIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tìm kiếm" arrow>
              <IconButton size="small" sx={toolbarButtonSx}>
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: "1px",
              height: 28,
              bgcolor: "rgba(255,255,255,0.15)",
              mx: 1.5,
              borderRadius: 1,
            }}
          />

          {/* Page Navigation */}
          {!loading && !error && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Trang trước" arrow>
                <span>
                  <IconButton
                    size="small"
                    sx={toolbarButtonSx}
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                  >
                    <NavigateBeforeIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Select
                value={currentPage}
                onChange={handlePageChange}
                size="small"
                sx={{ ...selectSx, minWidth: 110, height: 36 }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      bgcolor: "#2D2D44",
                      "& .MuiMenuItem-root": {
                        color: "white",
                        fontSize: "0.875rem",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                        "&.Mui-selected": { bgcolor: alpha("#D32F2F", 0.3) },
                      },
                    },
                  },
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <MenuItem key={page} value={page}>
                      {page} / {totalPages}
                    </MenuItem>
                  ),
                )}
              </Select>

              <Tooltip title="Trang sau" arrow>
                <span>
                  <IconButton
                    size="small"
                    sx={toolbarButtonSx}
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages}
                  >
                    <NavigateNextIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}

          {/* Divider */}
          {!loading && !error && (
            <Box
              sx={{
                width: "1px",
                height: 28,
                bgcolor: "rgba(255,255,255,0.15)",
                mx: 1.5,
                borderRadius: 1,
              }}
            />
          )}

          {/* Zoom Controls */}
          {!loading && !error && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Thu nhỏ" arrow>
                <span>
                  <IconButton
                    size="small"
                    sx={toolbarButtonSx}
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                  >
                    <ZoomOutIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Select
                value={scale}
                onChange={handleZoomChange}
                size="small"
                sx={{ ...selectSx, minWidth: 85, height: 36 }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#2D2D44",
                      "& .MuiMenuItem-root": {
                        color: "white",
                        fontSize: "0.875rem",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                        "&.Mui-selected": { bgcolor: alpha("#D32F2F", 0.3) },
                      },
                    },
                  },
                }}
              >
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0].map((z) => (
                  <MenuItem key={z} value={z}>
                    {z * 100}%
                  </MenuItem>
                ))}
              </Select>

              <Tooltip title="Phóng to" arrow>
                <span>
                  <IconButton
                    size="small"
                    sx={toolbarButtonSx}
                    onClick={handleZoomIn}
                    disabled={scale >= 3.0}
                  >
                    <ZoomInIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Right Controls */}
          {!loading && !error && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                arrow
              >
                <IconButton
                  size="small"
                  sx={toolbarButtonSx}
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <FullscreenExitIcon sx={{ fontSize: 22 }} />
                  ) : (
                    <FullscreenIcon sx={{ fontSize: 22 }} />
                  )}
                </IconButton>
              </Tooltip>

              {showDownload && (
                <Tooltip title="Tải xuống" arrow>
                  <IconButton
                    size="small"
                    onClick={handleDownload}
                    sx={{
                      ...toolbarButtonSx,
                      bgcolor: alpha("#D32F2F", 0.8),
                      "&:hover": { bgcolor: "#D32F2F" },
                    }}
                  >
                    <DownloadIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* PDF Content */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "auto",
          background: "linear-gradient(180deg, #3D3D5C 0%, #2D2D44 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: 3,
          minHeight: 0,
        }}
      >
        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "18px",
                background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(211, 47, 47, 0.4)",
              }}
            >
              <CircularProgress size={32} sx={{ color: "white" }} />
            </Box>
            <Typography
              sx={{ color: "white", fontWeight: 500, fontSize: "0.9375rem" }}
            >
              Đang tải PDF...
            </Typography>
          </Box>
        )}

        {error && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "20px",
                bgcolor: "rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PdfIcon sx={{ fontSize: 40, color: "#EF4444" }} />
            </Box>
            <Typography
              sx={{ color: "#EF4444", fontWeight: 600, fontSize: "1rem" }}
            >
              Không thể tải PDF
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.9375rem",
                textAlign: "center",
                maxWidth: 300,
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && (
          <Box
            sx={{
              bgcolor: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <canvas ref={canvasRef} />
          </Box>
        )}

        {/* Rendering overlay */}
        {rendering && (
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
              bgcolor: "rgba(0,0,0,0.3)",
              zIndex: 5,
            }}
          >
            <CircularProgress size={40} sx={{ color: "white" }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PDFViewer;
