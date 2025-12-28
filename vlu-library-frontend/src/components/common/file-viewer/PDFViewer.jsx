/**
 * PDFViewer Component
 * Component dùng chung để hiển thị file PDF sử dụng PDF.js
 *
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
} from "@mui/icons-material";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * PDFViewer Component
 * Hiển thị file PDF sử dụng PDF.js với authentication
 *
 * @param {string} url - URL của file PDF (API endpoint cần auth)
 * @param {string} fileName - Tên file để download
 * @param {boolean} showToolbar - Hiển thị toolbar (default: true)
 * @param {boolean} showDownload - Hiển thị nút download (default: true)
 */
const PDFViewer = ({
  url,
  fileName = "document.pdf",
  showToolbar = true,
  showDownload = true,
}) => {
  // Canvas ref
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Blob URL để cleanup
  const [blobUrl, setBlobUrl] = useState(null);

  /**
   * Load PDF document with authentication
   */
  useEffect(() => {
    if (!url) {
      setError("Không có file để hiển thị");
      setLoading(false);
      return;
    }

    loadPDF();

    // Cleanup
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  /**
   * Render page when page or scale changes
   */
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, scale, pdfDoc]);

  /**
   * Handle fullscreen change
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  /**
   * Load PDF from URL with Authorization header
   */
  const loadPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        let errorMessage = "Không thể tải file PDF";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          if (response.status === 401) {
            errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
          } else if (response.status === 403) {
            errorMessage = "Bạn không có quyền xem tài liệu này.";
          } else if (response.status === 404) {
            errorMessage = "Không tìm thấy file PDF.";
          }
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
      setCurrentPage(1);
      setLoading(false);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(err.message || "Không thể tải file PDF. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  /**
   * Render specific page
   */
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

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      setRendering(false);
    } catch (err) {
      console.error("Error rendering page:", err);
      setRendering(false);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (event) => {
    const pageNum = parseInt(event.target.value, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  };

  const handleZoomChange = (event) => {
    setScale(parseFloat(event.target.value));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
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
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
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

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%",
        width: "100%", // FIX: Đảm bảo width 100%
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#525252",
        position: "relative", // FIX: Để giới hạn các phần tử con
        overflow: "hidden", // FIX: Ngăn content tràn ra ngoài container
      }}
    >
      {/* Toolbar */}
      {showToolbar && (
        <Box
          sx={{
            height: 48,
            minHeight: 48, // FIX: Đảm bảo toolbar không bị co lại
            backgroundColor: "#323232",
            display: "flex",
            alignItems: "center",
            px: 2,
            gap: 1,
            borderBottom: "1px solid #424242",
            flexShrink: 0,
          }}
        >
          {/* Left Group */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" sx={{ color: "white" }}>
              <MenuIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: "white" }}>
              <SearchIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: "1px",
              height: 24,
              backgroundColor: "#525252",
              mx: 1,
            }}
          />

          {/* Page Navigation */}
          {!loading && !error && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
              >
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>

              <Select
                value={currentPage}
                onChange={handlePageChange}
                size="small"
                sx={{
                  color: "white",
                  minWidth: 100,
                  height: 32,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#525252",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#757575",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
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

              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
              >
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Divider */}
          {!loading && !error && (
            <Box
              sx={{
                width: "1px",
                height: 24,
                backgroundColor: "#525252",
                mx: 1,
              }}
            />
          )}

          {/* Zoom Controls */}
          {!loading && !error && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>

              <Select
                value={scale}
                onChange={handleZoomChange}
                size="small"
                sx={{
                  color: "white",
                  minWidth: 80,
                  height: 32,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#525252",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#757575",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                }}
              >
                <MenuItem value={0.5}>50%</MenuItem>
                <MenuItem value={0.75}>75%</MenuItem>
                <MenuItem value={1.0}>100%</MenuItem>
                <MenuItem value={1.25}>125%</MenuItem>
                <MenuItem value={1.5}>150%</MenuItem>
                <MenuItem value={2.0}>200%</MenuItem>
                <MenuItem value={2.5}>250%</MenuItem>
                <MenuItem value={3.0}>300%</MenuItem>
              </Select>

              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Right Controls */}
          {!loading && !error && (
            <>
              <Tooltip
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                <IconButton
                  size="small"
                  sx={{ color: "white" }}
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <FullscreenExitIcon fontSize="small" />
                  ) : (
                    <FullscreenIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {showDownload && (
                <Tooltip title="Tải xuống">
                  <IconButton
                    size="small"
                    onClick={handleDownload}
                    sx={{ color: "white" }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      )}

      {/* PDF Content - FIX: Thêm overflow controls */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "auto", // Cho phép scroll trong container này
          backgroundColor: "#525252",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: 2,
          // FIX: Giới hạn chiều cao để không tràn ra ngoài
          minHeight: 0, // Quan trọng cho flexbox
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
              color: "white",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "white" }} />
            <Typography variant="body1">Đang tải PDF...</Typography>
          </Box>
        )}

        {error && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "white",
            }}
          >
            <Typography variant="body1">{error}</Typography>
          </Box>
        )}

        {!loading && !error && (
          <Box
            sx={{
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              // FIX: Canvas wrapper không cần thêm overflow vì container cha đã có
            }}
          >
            <canvas ref={canvasRef} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PDFViewer;
