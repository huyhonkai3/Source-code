/**
 * DocumentDetailPage
 * Trang chi tiết tài liệu cho Public/User/Author
 *
 * Đường dẫn: src/pages/public/DocumentDetailPage.jsx
 */

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useDownload from "../../hooks/useDownload";
import Header from "../../components/common/Header";
import DocumentInfo from "../../components/documents/DocumentInfo";
import RelatedDocuments from "../../components/documents/RelatedDocuments";
import ReviewSection from "../../components/reviews/ReviewSection";
import CommentSection from "../../components/comments/CommentSection";
import documentsAPI from "../../api/documents.api";

// Import FileViewer từ common (thay thế PDFViewer cũ)
import { FileViewer } from "../../components/common/file-viewer";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { handleDownload, DownloadUI } = useDownload();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    try {
      const response = await documentsAPI.getById(id);
      if (response.status === "success") {
        setDocument(response.data.document);
        if (isAuthenticated) {
          try {
            await documentsAPI.trackView(id);
          } catch (err) {
            console.error("Track view error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showSnackbar("Không thể tải thông tin tài liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, showSnackbar]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  /**
   * Tạo URL đầy đủ cho file viewer
   * REACT_APP_API_URL có thể là:
   * - http://localhost:5000 (không có /api)
   * - http://localhost:5000/api (đã có /api)
   */
  const getFileUrl = () => {
    if (!document) return "";
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    // Kiểm tra xem baseURL đã có /api chưa
    const apiPath = baseURL.endsWith("/api") ? "" : "/api";
    return `${baseURL}${apiPath}/documents/${document.id || document._id}/read`;
  };

  /**
   * Lấy định dạng file
   */
  const getFileFormat = () => {
    if (document?.fileFormat) {
      return document.fileFormat.toLowerCase();
    }
    const fileName = document?.fileName || "";
    if (fileName.toLowerCase().endsWith(".epub")) {
      return "epub";
    }
    return "pdf";
  };

  /**
   * Render badge định dạng file
   */
  const renderFormatBadge = () => {
    const format = getFileFormat();
    const isEpub = format === "epub";

    return (
      <Chip
        icon={isEpub ? <EpubIcon /> : <PdfIcon />}
        label={isEpub ? "EPUB" : "PDF"}
        size="small"
        color={isEpub ? "warning" : "error"}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const handleRead = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    setTabValue(1);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/documents?category=${categoryId}`);
  };

  const handleLoginRedirect = () => {
    localStorage.setItem("redirectPath", `/documents/${id}`);
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              minHeight: "60vh",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (!document) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h5">Không tìm thấy tài liệu</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs
          separator={<ChevronRightIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Trang chủ
          </Link>
          <Link
            component={RouterLink}
            to="/documents"
            underline="hover"
            color="inherit"
          >
            Tài liệu
          </Link>
          {document.category && (
            <Link
              component={RouterLink}
              to={`/documents?category=${document.category.id}`}
              underline="hover"
              color="inherit"
            >
              {document.category.name}
            </Link>
          )}
          <Typography color="text.primary">{document.title}</Typography>
        </Breadcrumbs>

        <DocumentInfo
          document={document}
          onRead={handleRead}
          onDownload={() => handleDownload(document)}
          onCategoryClick={handleCategoryClick}
          isAuthenticated={isAuthenticated}
        />

        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", mt: 4 }}
        >
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Thông tin chi tiết" />
            <Tab label="Đọc tài liệu" />
            <Tab label="Đánh giá" />
            <Tab label="Bình luận" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Tab 0: Thông tin chi tiết */}
            {tabValue === 0 && (
              <Table>
                <TableBody>
                  {document.author && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: "30%" }}>
                        Tác giả
                      </TableCell>
                      <TableCell>{document.author}</TableCell>
                    </TableRow>
                  )}
                  {document.publisher && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Nhà xuất bản
                      </TableCell>
                      <TableCell>{document.publisher}</TableCell>
                    </TableRow>
                  )}
                  {document.publishYear && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Năm xuất bản
                      </TableCell>
                      <TableCell>{document.publishYear}</TableCell>
                    </TableRow>
                  )}
                  {document.pageCount && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Số trang</TableCell>
                      <TableCell>{document.pageCount}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Kích thước</TableCell>
                    <TableCell>
                      {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Định dạng</TableCell>
                    <TableCell>{renderFormatBadge()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            {/* Tab 1: Đọc tài liệu - Sử dụng FileViewer */}
            {/* FIX: Thêm overflow: hidden và position: relative để ngăn content tràn ra ngoài */}
            {tabValue === 1 && (
              <Box
                sx={{
                  height: "70vh",
                  position: "relative",
                  overflow: "hidden", // FIX: Ngăn content tràn ra ngoài
                  borderRadius: 1,
                  // Đảm bảo FileViewer không vượt quá container
                  "& > *": {
                    maxWidth: "100%",
                    maxHeight: "100%",
                  },
                }}
              >
                <FileViewer
                  fileUrl={getFileUrl()}
                  fileName={document.fileName}
                  fileFormat={getFileFormat()}
                  title={document.title}
                  isPreview={!isAuthenticated}
                  onLoginClick={handleLoginRedirect}
                  showDownload={true}
                />
              </Box>
            )}

            {/* Tab 2: Đánh giá */}
            {tabValue === 2 && (
              <Box>
                <ReviewSection docId={id} />
              </Box>
            )}

            {/* Tab 3: Bình luận */}
            {tabValue === 3 && (
              <Box>
                <CommentSection docId={id} />
              </Box>
            )}
          </Box>
        </Paper>

        <RelatedDocuments
          categoryId={document.category?.id}
          currentDocId={id}
        />
      </Container>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
        <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn cần đăng nhập để đọc và tải xuống tài liệu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleLoginRedirect}
            sx={{ bgcolor: "error.main" }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Dialogs */}
      {DownloadUI}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DocumentDetailPage;
