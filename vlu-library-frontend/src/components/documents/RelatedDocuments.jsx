import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Grid, Skeleton, alpha } from "@mui/material";
import {
  AutoAwesome as SparkleIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import DocumentCard from "./DocumentCard";
import documentsAPI from "../../api/documents.api";

/**
 * RelatedDocuments Component - VLU Design System v2.0
 * Modern & Bold section hiển thị tài liệu cùng danh mục
 */
const RelatedDocuments = ({ categoryId, currentDocId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRelated = useCallback(async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await documentsAPI.getRelated(
        categoryId,
        currentDocId,
        4,
      );

      if (response.status === "success") {
        setDocuments(response.data?.documents || []);
      }
    } catch (error) {
      console.error("Fetch related error:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentDocId]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  // Don't render if no category or no documents
  if (!categoryId || (!loading && documents.length === 0)) {
    return null;
  }

  return (
    <Box sx={{ mt: 6 }}>
      {/* ========== SECTION HEADER ========== */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(211,47,47,0.25)",
            }}
          >
            <SparkleIcon sx={{ fontSize: 20, color: "white" }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1A1A2E",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              Tài liệu cùng danh mục
            </Typography>
            <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
              Khám phá thêm các tài liệu liên quan
            </Typography>
          </Box>
        </Box>

        {/* View All Button */}
        {documents.length >= 4 && (
          <Box
            onClick={() => navigate(`/documents?category=${categoryId}`)}
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 0.5,
              px: 2,
              py: 1,
              borderRadius: "10px",
              bgcolor: alpha("#D32F2F", 0.08),
              color: "#D32F2F",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: alpha("#D32F2F", 0.15),
                transform: "translateX(4px)",
              },
            }}
          >
            Xem tất cả
            <ArrowIcon sx={{ fontSize: 18 }} />
          </Box>
        )}
      </Box>

      {/* ========== DOCUMENTS GRID ========== */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} sm={6} md={3} key={n}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
                  border: "1px solid #F0F0F5",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  sx={{
                    height: 200,
                    bgcolor: "#F0F0F5",
                  }}
                />
                <Box sx={{ p: 2 }}>
                  <Skeleton
                    variant="rounded"
                    width={80}
                    height={24}
                    sx={{ mb: 1.5, borderRadius: "6px" }}
                  />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={24}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={20}
                    sx={{ mt: 1.5 }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {documents.map((doc, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={doc._id || doc.id}
              sx={{
                animation: "fadeInUp 0.5s ease forwards",
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                "@keyframes fadeInUp": {
                  from: {
                    opacity: 0,
                    transform: "translateY(20px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              <DocumentCard document={doc} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Mobile View All Button */}
      {!loading && documents.length >= 4 && (
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            justifyContent: "center",
            mt: 3,
          }}
        >
          <Box
            onClick={() => navigate(`/documents?category=${categoryId}`)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 3,
              py: 1.5,
              borderRadius: "12px",
              bgcolor: alpha("#D32F2F", 0.08),
              color: "#D32F2F",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: alpha("#D32F2F", 0.15),
              },
            }}
          >
            Xem tất cả tài liệu
            <ArrowIcon sx={{ fontSize: 18 }} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RelatedDocuments;
