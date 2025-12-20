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
} from "@mui/material";
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useDownload from "../../hooks/useDownload";
import Header from "../../components/common/Header";
import DocumentInfo from "../../components/documents/DocumentInfo";
import RelatedDocuments from "../../components/documents/RelatedDocuments";
import PDFViewer from "../../components/admin/PDFViewer";
import ReviewSection from "../../components/reviews/ReviewSection";
import CommentSection from "../../components/comments/CommentSection";
import documentsAPI from "../../api/documents.api";

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
                    <TableCell>PDF</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            {tabValue === 1 && (
              <Box sx={{ height: "70vh" }}>
                {isAuthenticated ? (
                  <PDFViewer
                    fileUrl={document.fileUrl}
                    fileName={document.fileName}
                  />
                ) : (
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
                    <Typography variant="h6" color="text.secondary">
                      Vui lòng đăng nhập để đọc tài liệu
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleLoginRedirect}
                      sx={{ bgcolor: "error.main" }}
                    >
                      Đăng nhập ngay
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <ReviewSection docId={id} />
              </Box>
            )}

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
