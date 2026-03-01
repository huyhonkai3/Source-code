import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Skeleton
} from "@mui/material";
import Header from "../../components/common/Header";
import DocumentCard from "../../components/documents/DocumentCard";
import { getMyBookmarks } from "../../api/bookmark.api";

const BookmarksPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await getMyBookmarks();
      setDocuments(res.data.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header active="bookmark" />

      {/* ========== HERO SECTION (GIỐNG TRANG TÀI LIỆU) ========== */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #B71C1C 0%, #D32F2F 50%, #FF7043 100%)",
          color: "white",
          py: 10,
          textAlign: "center"
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, mb: 2 }}
          >
            Kho tài liệu yêu thích của bạn
          </Typography>

          <Typography sx={{ opacity: 0.9, mb: 4 }}>
            Tất cả những tài liệu bạn đã lưu để xem lại sau
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip label="Thiết kế" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
            <Chip label="Công nghệ" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
            <Chip label="Giáo trình" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
          </Box>
        </Container>
      </Box>

      {/* ========== CONTENT SECTION ========== */}
      <Container maxWidth="lg" sx={{ mt: -6, pb: 6 }}>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 3 }}>
            {documents.length} tài liệu đã lưu
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 3
              }}
            >
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={300} />
              ))}
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              Bạn chưa bookmark tài liệu nào.
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)"
                },
                gap: 3
              }}
            >
              {documents.map((doc) => (
                <DocumentCard key={doc._id} document={doc} />
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default BookmarksPage;