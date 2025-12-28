import { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ZoomOut as ZoomOutIcon,
  ZoomIn as ZoomInIcon,
  GetApp as DownloadIcon,
} from "@mui/icons-material";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * PDFViewer Component
 * Hiển thị file PDF sử dụng PDF.js với authentication
 *
 * @param {string} fileUrl - URL của file PDF (có thể là API endpoint cần auth)
 * @param {string} fileName - Tên file để download
 */
const PDFViewer = ({ fileUrl, fileName = "document.pdf" }) => {
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

  // Blob URL để cleanup
  const [blobUrl, setBlobUrl] = useState(null);

  /**
   * Load PDF document with authentication
   */
  useEffect(() => {
    if (!fileUrl) {
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
      // Revoke blob URL để giải phóng memory
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

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
   * Load PDF from URL with Authorization header
   */
  const loadPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("accessToken");

      // Fetch PDF với Authorization header
      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      // Kiểm tra response status
      if (!response.ok) {
        // Parse error message từ JSON response nếu có
        let errorMessage = "Không thể tải file PDF";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Response không phải JSON
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

      // Chuyển response thành blob
      const blob = await response.blob();

      // Tạo blob URL
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      // Load PDF từ blob URL
      const loadingTask = pdfjsLib.getDocument(url);
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

      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page
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

  /**
   * Navigate to previous page
   */
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navigate to next page
   */
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Handle page input change
   */
  const handlePageChange = (event) => {
    const pageNum = parseInt(event.target.value, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  /**
   * Zoom in
   */
  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  };

  /**
   * Zoom out
   */
  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  };

  /**
   * Handle zoom dropdown
   */
  const handleZoomChange = (event) => {
    setScale(parseFloat(event.target.value));
  };

  /**
   * Handle download with authentication
   */
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // Nếu đã có blobUrl, dùng luôn
      if (blobUrl) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Nếu chưa có, fetch lại với auth
      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải file");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#525252",
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          height: 48,
          backgroundColor: "#323232",
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1,
          borderBottom: "1px solid #424242",
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

        {/* Download Button */}
        {!loading && !error && (
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* PDF Content */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          position: "relative",
          overflow: "auto",
          backgroundColor: "#525252",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: 2,
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
