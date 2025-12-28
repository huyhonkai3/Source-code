/**
 * EpubViewer Component
 * Component hiển thị file EPUB sử dụng epubjs
 *
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
} from "@mui/icons-material";

const EpubViewer = ({
  url,
  fileName = "document.epub",
  title = "",
  showToolbar = true,
  showDownload = true,
}) => {
  // States
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

  // Refs
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const blobUrlRef = useRef(null);
  const isInitializedRef = useRef(false);
  const spineRef = useRef([]);

  /**
   * Apply font size bằng CSS injection (tránh lỗi themes.fontSize)
   */
  const applyFontSize = useCallback((size) => {
    if (!renditionRef.current) return;

    try {
      // Inject CSS trực tiếp vào iframe content
      renditionRef.current.getContents().forEach((content) => {
        if (content && content.document) {
          const style = content.document.createElement("style");
          style.id = "epub-font-size";
          style.textContent = `
            body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, a {
              font-size: ${size}% !important;
            }
          `;

          // Remove old style if exists
          const oldStyle = content.document.getElementById("epub-font-size");
          if (oldStyle) {
            oldStyle.remove();
          }

          content.document.head.appendChild(style);
        }
      });
    } catch (e) {
      console.warn("[EpubViewer] Font size warning:", e.message);
    }
  }, []);

  /**
   * Effect 1: Fetch EPUB file
   */
  useEffect(() => {
    if (!url) {
      setError("Không có URL file");
      setLoading(false);
      return;
    }

    console.log("[EpubViewer] Fetching:", url);

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
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        console.log("[EpubViewer] Response:", response.status);

        if (!response.ok) {
          if (response.status === 401)
            throw new Error("Phiên đăng nhập hết hạn");
          if (response.status === 403) throw new Error("Không có quyền xem");
          if (response.status === 404) throw new Error("Không tìm thấy file");
          throw new Error(`Lỗi HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        console.log("[EpubViewer] Buffer size:", buffer.byteLength);

        if (buffer.byteLength === 0) throw new Error("File rỗng");

        // Blob URL cho download
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

  /**
   * Effect 2: Initialize epub.js
   */
  useEffect(() => {
    if (!arrayBuffer || !viewerRef.current || isInitializedRef.current) {
      return;
    }

    console.log("[EpubViewer] Initializing epub.js...");
    isInitializedRef.current = true;

    // Cleanup
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
        // 1. Tạo book
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        // 2. Đợi book loaded để lấy spine
        await book.ready;

        // 3. Lấy spine items
        const spine = [];
        book.spine.each((item) => {
          spine.push({
            href: item.href,
            index: item.index,
          });
        });
        spineRef.current = spine;
        setTotalSpineItems(spine.length);
        console.log("[EpubViewer] Spine items:", spine.length);

        // 4. Tạo rendition - KHÔNG dùng bất kỳ themes nào
        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          spread: "none",
        });
        renditionRef.current = rendition;

        // 5. Load TOC
        book.loaded.navigation
          .then((nav) => {
            console.log("[EpubViewer] TOC:", nav.toc?.length || 0, "items");
            setToc(nav.toc || []);
          })
          .catch(() => {});

        // 6. Track location changes
        rendition.on("relocated", (location) => {
          if (location?.start?.href) {
            console.log("[EpubViewer] Relocated:", location.start.href);

            // Tìm index trong spine
            const href = location.start.href;
            const spineIndex = spineRef.current.findIndex((item) =>
              href.includes(item.href),
            );
            if (spineIndex !== -1) {
              setCurrentSpineIndex(spineIndex);
            }
          }
        });

        // 7. Apply font size sau khi render xong
        rendition.on("rendered", () => {
          applyFontSize(fontSize);
        });

        // 8. Display
        await rendition.display();
        console.log("[EpubViewer] Display complete");

        setBookReady(true);
        console.log("[EpubViewer] Book ready!");
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

  /**
   * Effect 3: Fullscreen
   */
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /**
   * Cleanup blob URL
   */
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  /**
   * Navigation - chuyển chapter trực tiếp
   */
  const goToPrev = useCallback(() => {
    if (currentSpineIndex > 0) {
      const prevIndex = currentSpineIndex - 1;
      const prevSpine = spineRef.current[prevIndex];
      if (prevSpine && renditionRef.current) {
        console.log("[EpubViewer] Go to prev:", prevSpine.href);
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
        console.log("[EpubViewer] Go to next:", nextSpine.href);
        renditionRef.current.display(nextSpine.href);
        setCurrentSpineIndex(nextIndex);
      }
    }
  }, [currentSpineIndex, totalSpineItems]);

  // Font size - dùng CSS injection
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

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Download
  const handleDownload = useCallback(() => {
    if (blobUrlRef.current) {
      const link = document.createElement("a");
      link.href = blobUrlRef.current;
      link.download = fileName;
      link.click();
    }
  }, [fileName]);

  // Go to chapter
  const goToChapter = useCallback((href) => {
    if (!renditionRef.current) return;

    console.log("[EpubViewer] Go to chapter:", href);
    renditionRef.current.display(href);

    // Update spine index
    const hrefBase = href.split("#")[0];
    const spineIndex = spineRef.current.findIndex(
      (item) => item.href.includes(hrefBase) || hrefBase.includes(item.href),
    );
    if (spineIndex !== -1) {
      setCurrentSpineIndex(spineIndex);
    }

    setTocOpen(false);
  }, []);

  // ============ RENDER ============

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#525252",
          color: "white",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "white" }} />
        <Typography>Đang tải EPUB...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#525252",
          color: "white",
          gap: 2,
          p: 3,
        }}
      >
        <Typography variant="h6" color="error.light">
          Lỗi
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            sx={{ color: "white", borderColor: "white" }}
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
          {blobUrlRef.current && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
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
        backgroundColor: "#f5f5f5",
        position: "relative",
      }}
    >
      {/* Toolbar */}
      {showToolbar && (
        <Box
          sx={{
            height: 48,
            backgroundColor: "#323232",
            display: "flex",
            alignItems: "center",
            px: 2,
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Tooltip title="Mục lục">
            <IconButton
              size="small"
              sx={{ color: "white" }}
              onClick={() => setTocOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{ width: 1, height: 24, backgroundColor: "#525252", mx: 1 }}
          />

          <Tooltip title="Chương trước">
            <span>
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={goToPrev}
                disabled={currentSpineIndex === 0}
              >
                <NavigateBeforeIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Typography
            variant="body2"
            sx={{
              color: "white",
              mx: 1,
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {currentSpineIndex + 1} / {totalSpineItems}
          </Typography>

          <Tooltip title="Chương sau">
            <span>
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={goToNext}
                disabled={currentSpineIndex >= totalSpineItems - 1}
              >
                <NavigateNextIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{ width: 1, height: 24, backgroundColor: "#525252", mx: 1 }}
          />

          <Tooltip title="Giảm cỡ chữ">
            <span>
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={() => changeFontSize(-10)}
                disabled={fontSize <= 50}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Typography variant="caption" sx={{ color: "white", minWidth: 40 }}>
            {fontSize}%
          </Typography>

          <Tooltip title="Tăng cỡ chữ">
            <span>
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={() => changeFontSize(10)}
                disabled={fontSize >= 200}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={isFullscreen ? "Thoát" : "Toàn màn hình"}>
            <IconButton
              size="small"
              sx={{ color: "white" }}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>

          {showDownload && (
            <Tooltip title="Tải xuống">
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={handleDownload}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* TOC Drawer */}
      <Drawer anchor="left" open={tocOpen} onClose={() => setTocOpen(false)}>
        <Box sx={{ width: 300 }}>
          <Box sx={{ p: 2, backgroundColor: "#323232" }}>
            <Typography variant="h6" sx={{ color: "white" }}>
              Mục lục
            </Typography>
          </Box>
          <Divider />
          <List sx={{ maxHeight: "calc(100vh - 64px)", overflow: "auto" }}>
            {toc.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => goToChapter(item.href)}
                  selected={currentChapter === item.label}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontSize: "0.875rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {toc.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="Không có mục lục"
                  sx={{ color: "grey.500" }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* EPUB Viewer */}
      <Box
        ref={viewerRef}
        sx={{
          flex: 1,
          overflow: "hidden",
          backgroundColor: "#fff",
          "& iframe": { border: "none !important" },
        }}
      />

      {/* Loading overlay */}
      {!bookReady && arrayBuffer && (
        <Box
          sx={{
            position: "absolute",
            top: showToolbar ? 48 : 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
            zIndex: 5,
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Đang xử lý...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EpubViewer;
