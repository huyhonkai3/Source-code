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
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  alpha,
  Skeleton,
  IconButton,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  PictureAsPdf as PdfIcon,
  MenuBook as EpubIcon,
  Info as InfoIcon,
  AutoStories as ReadIcon,
  Star as StarIcon,
  ChatBubble as CommentIcon,
  Login as LoginIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as PublisherIcon,
  CalendarToday as CalendarIcon,
  Layers as PagesIcon,
  Storage as SizeIcon,
  Category as FormatIcon,
  Public as WikidataIcon,
  SearchOff as SearchOffIcon,
  SentimentDissatisfied as SadIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import LanguageIcon from "@mui/icons-material/Language";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useDownload from "../../hooks/useDownload";
import Header from "../../components/common/Header";
import DocumentInfo from "../../components/documents/DocumentInfo";
import RelatedDocuments from "../../components/documents/RelatedDocuments";
import ReviewSection from "../../components/reviews/ReviewSection";
import CommentSection from "../../components/comments/CommentSection";
import documentsAPI from "../../api/documents.api";
import { FileViewer } from "../../components/common/file-viewer";
import ReportDialog from "../../components/documents/ReportDialog";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { handleDownload, DownloadUI } = useDownload();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [lodData, setLodData] = useState(null);
  const [lodLoading, setLodLoading] = useState(false);
  const [lodLoaded, setLodLoaded] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
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

  useEffect(() => {
    setLodData(null);
    setLodLoaded(false);
    setLodLoading(false);
  }, [id]);

  /**
   * Tạo URL đầy đủ cho file viewer
   */
  const getFileUrl = () => {
    if (!document) return "";
    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
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
        sx={{
          fontWeight: 700,
          bgcolor: isEpub ? alpha("#FF7043", 0.1) : alpha("#D32F2F", 0.1),
          color: isEpub ? "#FF7043" : "#D32F2F",
          "& .MuiChip-icon": {
            color: isEpub ? "#FF7043" : "#D32F2F",
          },
        }}
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

  // Tab configuration với icons
  const tabs = [
    { label: "Thông tin chi tiết", icon: <InfoIcon /> },
    { label: "Đọc tài liệu", icon: <ReadIcon /> },
    { label: "Đánh giá", icon: <StarIcon /> },
    { label: "Bình luận", icon: <CommentIcon /> },
    { label: "Liên kết dữ liệu (LOD)", icon: <WikidataIcon /> },
  ];

  const fetchLodData = useCallback(async () => {
    if (lodLoading || lodLoaded || !document) return;
    setLodLoading(true);
    try {
      const response = await documentsAPI.getLOD(document.id || document._id);
      setLodData(response?.data?.lod || null);
      console.log("LOD data fetched:", response?.data?.lod);
    } catch (error) {
      console.error("Fetch LOD error:", error);
      showSnackbar("Không thể tải dữ liệu liên kết từ Wikidata", "error");
    } finally {
      setLodLoaded(true);
      setLodLoading(false);
    }
  }, [document, lodLoaded, lodLoading, showSnackbar]);

  const handleTabChange = (nextTab) => {
    setTabValue(nextTab);
    if (nextTab === 4 && !lodLoaded && !lodLoading) {
      fetchLodData();
    }
  };

  // Detail info items cho Tab 0
  const getDetailItems = () => {
    if (!document) return [];

    const items = [];

    if (document.author) {
      items.push({
        icon: PersonIcon,
        label: "Tác giả",
        value: document.author,
        color: "#2196F3",
      });
    }

    if (document.publisher) {
      items.push({
        icon: PublisherIcon,
        label: "Nhà xuất bản",
        value: document.publisher,
        color: "#7C4DFF",
      });
    }

    if (document.documentLanguage) {
      items.push({
        icon: LanguageIcon,
        label: "Language",
        value: document.documentLanguage,
        color: "#7C4DFF",
      });
    }

    if (document.publishYear) {
      items.push({
        icon: CalendarIcon,
        label: "Năm xuất bản",
        value: document.publishYear,
        color: "#4CAF50",
      });
    }

    if (document.pageCount) {
      items.push({
        icon: PagesIcon,
        label: "Số trang",
        value: `${document.pageCount} trang`,
        color: "#FF7043",
      });
    }

    items.push({
      icon: SizeIcon,
      label: "Kích thước",
      value: `${(document.fileSize / (1024 * 1024)).toFixed(2)} MB`,
      color: "#00BCD4",
    });

    items.push({
      icon: FormatIcon,
      label: "Định dạng",
      value: renderFormatBadge(),
      color: "#EC407A",
      isChip: true,
    });

    return items;
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
        <Header />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          {/* Breadcrumb Skeleton */}
          <Skeleton
            variant="text"
            width={300}
            height={24}
            sx={{ mb: 3, borderRadius: "8px" }}
          />

          {/* DocumentInfo Skeleton */}
          <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
            <Skeleton
              variant="rounded"
              width={280}
              height={373}
              sx={{ borderRadius: "16px", flexShrink: 0 }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="rounded"
                width={120}
                height={32}
                sx={{ mb: 2, borderRadius: "8px" }}
              />
              <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
              <Skeleton
                variant="rounded"
                height={80}
                sx={{ mb: 3, borderRadius: "12px" }}
              />
              <Skeleton
                variant="text"
                width="100%"
                height={60}
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Skeleton
                  variant="rounded"
                  width={180}
                  height={48}
                  sx={{ borderRadius: "12px" }}
                />
                <Skeleton
                  variant="rounded"
                  width={150}
                  height={48}
                  sx={{ borderRadius: "12px" }}
                />
              </Box>
            </Box>
          </Box>

          {/* Tabs Skeleton */}
          <Skeleton
            variant="rounded"
            height={400}
            sx={{ borderRadius: "20px" }}
          />
        </Container>
      </Box>
    );
  }

  // Not found state
  if (!document) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
        <Header />
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              px: 3,
              bgcolor: "white",
              borderRadius: "24px",
              boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                mb: 3,
                borderRadius: "50%",
                bgcolor: "#FFF5F5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InfoIcon sx={{ fontSize: 48, color: "#D32F2F" }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
            >
              Không tìm thấy tài liệu
            </Typography>
            <Typography variant="body1" sx={{ color: "#8E8EA9", mb: 3 }}>
              Tài liệu bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/documents")}
              sx={{
                bgcolor: "#D32F2F",
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                "&:hover": {
                  bgcolor: "#B71C1C",
                },
              }}
            >
              Quay lại thư viện
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header />

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        {/* ========== BREADCRUMBS ========== */}
        <Breadcrumbs
          separator={
            <ChevronRightIcon sx={{ fontSize: 18, color: "#C4C4D4" }} />
          }
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-ol": {
              flexWrap: "nowrap",
            },
          }}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#8E8EA9",
              fontWeight: 500,
              fontSize: "0.875rem",
              "&:hover": {
                color: "#D32F2F",
              },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Trang chủ
          </Link>
          <Link
            component={RouterLink}
            to="/documents"
            underline="hover"
            sx={{
              color: "#8E8EA9",
              fontWeight: 500,
              fontSize: "0.875rem",
              "&:hover": {
                color: "#D32F2F",
              },
            }}
          >
            Tài liệu
          </Link>
          {document.category && (
            <Link
              component={RouterLink}
              to={`/documents?category=${document.category.id}`}
              underline="hover"
              sx={{
                color: "#8E8EA9",
                fontWeight: 500,
                fontSize: "0.875rem",
                "&:hover": {
                  color: "#D32F2F",
                },
              }}
            >
              {document.category.name}
            </Link>
          )}
          <Typography
            sx={{
              color: "#1A1A2E",
              fontWeight: 600,
              fontSize: "0.875rem",
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {document.title}
          </Typography>
        </Breadcrumbs>

        {/* ========== DOCUMENT INFO HERO ========== */}
        <DocumentInfo
          document={document}
          onRead={handleRead}
          onDownload={() => handleDownload(document)}
          onCategoryClick={handleCategoryClick}
          isAuthenticated={isAuthenticated}
        />

        {/* ========== BÁO CÁO VI PHẠM BẢN QUYỀN ========== */}
        {isAuthenticated && document?.status === "approved" && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FlagIcon />}
              onClick={() => setReportDialogOpen(true)}
              sx={{
                borderColor: "#E0E0E0",
                color: "#8E8EA9",
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "0.8125rem",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#D32F2F",
                  color: "#D32F2F",
                  bgcolor: alpha("#D32F2F", 0.04),
                },
              }}
            >
              Báo cáo vi phạm
            </Button>
          </Box>
        )}

        {/* ========== TABS SECTION ========== */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: "20px",
            overflow: "hidden",
            bgcolor: "white",
            boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
            border: "1px solid #F0F0F5",
          }}
        >
          {/* Tab Headers */}
          <Box
            sx={{
              borderBottom: "1px solid #F0F0F5",
              px: { xs: 2, md: 3 },
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, v) => handleTabChange(v)} // onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  bgcolor: "#D32F2F",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: "#8E8EA9",
                  minHeight: 56,
                  px: 3,
                  "&.Mui-selected": {
                    color: "#D32F2F",
                  },
                  "&:hover": {
                    color: "#4A4A68",
                    bgcolor: alpha("#D32F2F", 0.04),
                  },
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 20,
                      mr: 1,
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* ========== TAB 0: THÔNG TIN CHI TIẾT ========== */}
            {tabValue === 0 && (
              <Box>
                {/* Detail Grid */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {getDetailItems().map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Box
                        key={index}
                        sx={{
                          p: 2.5,
                          borderRadius: "14px",
                          bgcolor: "#FAFAFC",
                          border: "1px solid #F0F0F5",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: alpha(item.color, 0.04),
                            borderColor: alpha(item.color, 0.2),
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            bgcolor: alpha(item.color, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon sx={{ fontSize: 22, color: item.color }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#8E8EA9",
                              fontWeight: 500,
                              display: "block",
                              mb: 0.25,
                            }}
                          >
                            {item.label}
                          </Typography>
                          {item.isChip ? (
                            item.value
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "#1A1A2E",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.value}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Description Section */}
                {document.description && (
                  <Box sx={{ mt: 4 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A2E",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <InfoIcon sx={{ fontSize: 20, color: "#D32F2F" }} />
                      Mô tả tài liệu
                    </Typography>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: "14px",
                        bgcolor: "#FAFAFC",
                        border: "1px solid #F0F0F5",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#4A4A68",
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {document.description}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* ========== TAB 1: ĐỌC TÀI LIỆU ========== */}
            {tabValue === 1 && (
              <Box
                sx={{
                  height: "75vh",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "14px",
                  bgcolor: "#1A1A2E",
                  "& > *": {
                    maxWidth: "100%",
                    maxHeight: "100%",
                  },
                }}
              >
                <FileViewer
                  documentId={document.id}
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

            {/* ========== TAB 2: ĐÁNH GIÁ ========== */}
            {tabValue === 2 && (
              <Box>
                <ReviewSection docId={id} />
              </Box>
            )}

            {/* ========== TAB 3: BÌNH LUẬN ========== */}
            {tabValue === 3 && (
              <Box>
                <CommentSection docId={id} />
              </Box>
            )}

            {/* ========== TAB 4: LINKED OPEN DATA ========== */}
            {tabValue === 4 && (
              <Box>
                {lodLoading ? (
                  <Grid container spacing={2}>
                    {[...Array(4)].map((_, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Skeleton variant="rounded" height={120} />
                      </Grid>
                    ))}
                  </Grid>
                ) : lodData ? (
                  <Box>
                    <Box
                      sx={{
                        mb: 2.5,
                        p: 2,
                        borderRadius: "14px",
                        bgcolor: alpha("#00A1D6", 0.08),
                        border: "1px solid",
                        borderColor: alpha("#00A1D6", 0.2),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <WikidataIcon sx={{ color: "#00A1D6" }} />
                        <Typography sx={{ fontWeight: 700, color: "#1A1A2E" }}>
                          Dữ liệu từ Wikidata{" "}
                          {lodData.qid ? `(${lodData.qid})` : ""}
                        </Typography>
                      </Box>
                      {lodData.wikidataUrl && (
                        <Button
                          component={Link}
                          href={lodData.wikidataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          size="small"
                          startIcon={<WikidataIcon />}
                          sx={{ textTransform: "none", borderRadius: "10px" }}
                        >
                          Xem chi tiết trên Wikidata
                        </Button>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      {[
                        {
                          label: "Nhà xuất bản",
                          value: lodData.publisher || "-",
                        },
                        { label: "Thể loại", value: lodData.genre || "-" },
                        { label: "Số trang", value: lodData.pages || "-" },
                        {
                          label: "Mô tả ngắn",
                          value: lodData.description || "-",
                        },
                      ].map((item) => (
                        <Grid item xs={12} md={6} key={item.label}>
                          <Card
                            elevation={0}
                            sx={{
                              borderRadius: "14px",
                              border: "1px solid #F0F0F5",
                              bgcolor: "#FAFAFC",
                              height: "100%",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="caption"
                                sx={{ color: "#8E8EA9" }}
                              >
                                {item.label}
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: "#1A1A2E",
                                  mt: 0.5,
                                }}
                              >
                                {item.value}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 6,
                      px: 3,
                      borderRadius: "16px",
                      border: "1px dashed #D5D9E2",
                      bgcolor: "#FCFCFE",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <SadIcon sx={{ color: "#8E8EA9" }} />
                      <SearchOffIcon sx={{ color: "#8E8EA9" }} />
                    </Box>
                    <Typography
                      sx={{ fontWeight: 700, color: "#1A1A2E", mb: 0.5 }}
                    >
                      Chưa có dữ liệu liên kết trên Wikidata
                    </Typography>
                    <Typography sx={{ color: "#8E8EA9" }}>
                      Hệ thống chưa tìm thấy bản ghi phù hợp cho tài liệu này.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* ========== RELATED DOCUMENTS ========== */}
        <RelatedDocuments
          categoryId={document.category?.id}
          currentDocId={id}
        />
      </Container>

      {/* ========== LOGIN DIALOG ========== */}
      <Dialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            maxWidth: 400,
            boxShadow: "0 24px 48px rgba(26,26,46,0.2)",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 50%, #FFC107 100%)",
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LockIcon sx={{ fontSize: 24, color: "white" }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
                Yêu cầu đăng nhập
              </Typography>
            </Box>
            <IconButton
              onClick={() => setLoginDialogOpen(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography sx={{ color: "#4A4A68", lineHeight: 1.7 }}>
            Bạn cần đăng nhập để đọc và tải xuống tài liệu. Hãy đăng nhập bằng
            tài khoản sinh viên/giảng viên VLU để tiếp tục.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
          <Button
            onClick={() => setLoginDialogOpen(false)}
            sx={{
              color: "#4A4A68",
              borderRadius: "12px",
              px: 3,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleLoginRedirect}
            startIcon={<LoginIcon />}
            sx={{
              bgcolor: "#D32F2F",
              borderRadius: "12px",
              px: 3,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
              "&:hover": {
                bgcolor: "#B71C1C",
              },
            }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Dialogs */}
      {DownloadUI}

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        documentId={id}
        documentTitle={document?.title}
      />

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
          sx={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentDetailPage;
