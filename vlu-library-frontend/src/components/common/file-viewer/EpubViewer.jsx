/**
 * EpubViewer Component - VLU Design System v2.0.1
 * Modern & Bold với Enhanced toolbar, Better visual hierarchy + Tăng font sizes
 *
 * Component hiển thị file EPUB sử dụng epubjs
 * Đường dẫn: src/components/common/file-viewer/EpubViewer.jsx
 *
 * @requires epubjs - yarn add epubjs
 */

import { useState, useEffect, useRef, useCallback } from "react";
import ePub from "epubjs";
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  alpha,
} from "@mui/material";
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  GetApp as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Add as ZoomInIcon,
  Remove as ZoomOutIcon,
  Menu as MenuIcon,
  MenuBook as EpubIcon,
  Close as CloseIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";

const EpubViewer = ({
  url,
  fileName = "document.epub",
  title = "",
  showToolbar = true,
  showDownload = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arrayBuffer, setArrayBuffer] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [toc, setToc] = useState([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState("");
  const [bookReady, setBookReady] = useState(false);
  const [currentSpineIndex, setCurrentSpineIndex] = useState(0);
  const [totalSpineItems, setTotalSpineItems] = useState(0);

  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const blobUrlRef = useRef(null);
  const isInitializedRef = useRef(false);
  const spineRef = useRef([]);

  const applyFontSize = useCallback((size) => {
    if (!renditionRef.current) return;
    try {
      renditionRef.current.getContents().forEach((content) => {
        if (content && content.document) {
          const style = content.document.createElement("style");
          style.id = "epub-font-size";
          style.textContent = `body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, a { font-size: ${size}% !important; }`;
          const oldStyle = content.document.getElementById("epub-font-size");
          if (oldStyle) oldStyle.remove();
          content.document.head.appendChild(style);
        }
      });
    } catch (e) {
      console.warn("[EpubViewer] Font size warning:", e.message);
    }
  }, []);

  useEffect(() => {
    if (!url) {
      setError("Không có URL file");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchEpub = async () => {
      setLoading(true);
      setError(null);
      setArrayBuffer(null);
      setBookReady(false);
      isInitializedRef.current = false;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(url, {
          method: "GET",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        if (!response.ok) {
          if (response.status === 401)
            throw new Error("Phiên đăng nhập hết hạn");
          if (response.status === 403) throw new Error("Không có quyền xem");
          if (response.status === 404) throw new Error("Không tìm thấy file");
          throw new Error(`Lỗi HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength === 0) throw new Error("File rỗng");

        const blob = new Blob([buffer], { type: "application/epub+zip" });
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = URL.createObjectURL(blob);

        if (isMounted) {
          setArrayBuffer(buffer);
          setLoading(false);
        }
      } catch (err) {
        console.error("[EpubViewer] Fetch error:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchEpub();
    return () => {
      isMounted = false;
    };
  }, [url]);

  useEffect(() => {
    if (!arrayBuffer || !viewerRef.current || isInitializedRef.current) return;

    isInitializedRef.current = true;

    if (bookRef.current) {
      try {
        bookRef.current.destroy();
      } catch (e) {}
      bookRef.current = null;
      renditionRef.current = null;
    }

    viewerRef.current.innerHTML = "";

    const initBook = async () => {
      try {
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        await book.ready;

        const spine = [];
        book.spine.each((item) =>
          spine.push({ href: item.href, index: item.index }),
        );
        spineRef.current = spine;
        setTotalSpineItems(spine.length);

        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          spread: "none",
        });
        renditionRef.current = rendition;

        book.loaded.navigation
          .then((nav) => setToc(nav.toc || []))
          .catch(() => {});

        rendition.on("relocated", (location) => {
          if (location?.start?.href) {
            const href = location.start.href;
            const spineIndex = spineRef.current.findIndex((item) =>
              href.includes(item.href),
            );
            if (spineIndex !== -1) setCurrentSpineIndex(spineIndex);
          }
        });

        rendition.on("rendered", () => applyFontSize(fontSize));

        await rendition.display();
        setBookReady(true);
      } catch (err) {
        console.error("[EpubViewer] Init error:", err);
        setError("Lỗi đọc EPUB: " + err.message);
      }
    };

    initBook();

    return () => {
      if (bookRef.current) {
        try {
          bookRef.current.destroy();
        } catch (e) {}
        bookRef.current = null;
        renditionRef.current = null;
      }
    };
  }, [arrayBuffer, applyFontSize, fontSize]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const goToPrev = useCallback(() => {
    if (currentSpineIndex > 0) {
      const prevIndex = currentSpineIndex - 1;
      const prevSpine = spineRef.current[prevIndex];
      if (prevSpine && renditionRef.current) {
        renditionRef.current.display(prevSpine.href);
        setCurrentSpineIndex(prevIndex);
      }
    }
  }, [currentSpineIndex]);

  const goToNext = useCallback(() => {
    if (currentSpineIndex < totalSpineItems - 1) {
      const nextIndex = currentSpineIndex + 1;
      const nextSpine = spineRef.current[nextIndex];
      if (nextSpine && renditionRef.current) {
        renditionRef.current.display(nextSpine.href);
        setCurrentSpineIndex(nextIndex);
      }
    }
  }, [currentSpineIndex, totalSpineItems]);

  const changeFontSize = useCallback(
    (delta) => {
      setFontSize((prev) => {
        const newSize = Math.max(50, Math.min(200, prev + delta));
        applyFontSize(newSize);
        return newSize;
      });
    },
    [applyFontSize],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  const handleDownload = useCallback(() => {
    if (blobUrlRef.current) {
      const link = document.createElement("a");
      link.href = blobUrlRef.current;
      link.download = fileName;
      link.click();
    }
  }, [fileName]);

  const goToChapter = useCallback((href) => {
    if (!renditionRef.current) return;
    renditionRef.current.display(href);
    const hrefBase = href.split("#")[0];
    const spineIndex = spineRef.current.findIndex(
      (item) => item.href.includes(hrefBase) || hrefBase.includes(item.href),
    );
    if (spineIndex !== -1) setCurrentSpineIndex(spineIndex);
    setTocOpen(false);
  }, []);

  // Toolbar button style
  const toolbarButtonSx = {
    color: "white",
    bgcolor: "rgba(255,255,255,0.08)",
    borderRadius: "8px",
    "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
    "&:disabled": { color: "rgba(255,255,255,0.3)" },
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(180deg, #1A1A2E 0%, #2D2D44 100%)",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "18px",
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(245, 158, 11, 0.4)",
          }}
        >
          <CircularProgress size={32} sx={{ color: "white" }} />
        </Box>
        <Typography
          sx={{ color: "white", fontWeight: 500, fontSize: "0.9375rem" }}
        >
          Đang tải EPUB...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(180deg, #1A1A2E 0%, #2D2D44 100%)",
          gap: 2,
          p: 3,
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
          <EpubIcon sx={{ fontSize: 40, color: "#EF4444" }} />
        </Box>
        <Typography
          sx={{ color: "#EF4444", fontWeight: 600, fontSize: "1.125rem" }}
        >
          Lỗi
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
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.9375rem",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
          {blobUrlRef.current && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.9375rem",
                bgcolor: "#F59E0B",
                "&:hover": { bgcolor: "#D97706" },
              }}
            >
              Tải về
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FAFAFC",
        position: "relative",
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
            flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Tooltip title="Mục lục" arrow>
            <IconButton
              size="small"
              sx={toolbarButtonSx}
              onClick={() => setTocOpen(true)}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              width: "1px",
              height: 28,
              bgcolor: "rgba(255,255,255,0.15)",
              mx: 1.5,
              borderRadius: 1,
            }}
          />

          <Tooltip title="Chương trước" arrow>
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx}
                onClick={goToPrev}
                disabled={currentSpineIndex === 0}
              >
                <NavigateBeforeIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: "8px",
              minWidth: 100,
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{ color: "white", fontWeight: 600, fontSize: "0.9375rem" }}
            >
              {currentSpineIndex + 1}
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem" }}
            >
              /
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}
            >
              {totalSpineItems}
            </Typography>
          </Box>

          <Tooltip title="Chương sau" arrow>
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx}
                onClick={goToNext}
                disabled={currentSpineIndex >= totalSpineItems - 1}
              >
                <NavigateNextIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              width: "1px",
              height: 28,
              bgcolor: "rgba(255,255,255,0.15)",
              mx: 1.5,
              borderRadius: 1,
            }}
          />

          <Tooltip title="Giảm cỡ chữ" arrow>
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx}
                onClick={() => changeFontSize(-10)}
                disabled={fontSize <= 50}
              >
                <ZoomOutIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: "8px",
              minWidth: 60,
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}
            >
              {fontSize}%
            </Typography>
          </Box>

          <Tooltip title="Tăng cỡ chữ" arrow>
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx}
                onClick={() => changeFontSize(10)}
                disabled={fontSize >= 200}
              >
                <ZoomInIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={isFullscreen ? "Thoát" : "Toàn màn hình"} arrow>
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
                sx={{
                  ...toolbarButtonSx,
                  bgcolor: alpha("#F59E0B", 0.8),
                  "&:hover": { bgcolor: "#F59E0B" },
                }}
                onClick={handleDownload}
              >
                <DownloadIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* TOC Drawer - Enhanced */}
      <Drawer
        anchor="left"
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        PaperProps={{ sx: { width: 320, bgcolor: "#1A1A2E" } }}
      >
        <Box
          sx={{
            p: 2.5,
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BookmarkIcon sx={{ color: "white", fontSize: 24 }} />
            <Typography
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: "1.125rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Mục lục
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setTocOpen(false)}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <List sx={{ maxHeight: "calc(100vh - 72px)", overflow: "auto", py: 1 }}>
          {toc.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => goToChapter(item.href)}
                selected={currentChapter === item.label}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                  "&.Mui-selected": {
                    bgcolor: alpha("#F59E0B", 0.2),
                    borderLeft: "3px solid #F59E0B",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: {
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.9375rem",
                      fontWeight: currentChapter === item.label ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {toc.length === 0 && (
            <ListItem sx={{ py: 4 }}>
              <ListItemText
                primary="Không có mục lục"
                primaryTypographyProps={{
                  sx: {
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.9375rem",
                    textAlign: "center",
                  },
                }}
              />
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* EPUB Viewer */}
      <Box
        ref={viewerRef}
        sx={{
          flex: 1,
          overflow: "hidden",
          bgcolor: "#fff",
          "& iframe": { border: "none !important" },
        }}
      />

      {/* Loading overlay */}
      {!bookReady && arrayBuffer && (
        <Box
          sx={{
            position: "absolute",
            top: showToolbar ? 56 : 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(255,255,255,0.95)",
            zIndex: 5,
            gap: 2,
          }}
        >
          <CircularProgress size={40} sx={{ color: "#F59E0B" }} />
          <Typography
            sx={{ color: "#4A4A68", fontWeight: 500, fontSize: "0.9375rem" }}
          >
            Đang xử lý...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EpubViewer;
