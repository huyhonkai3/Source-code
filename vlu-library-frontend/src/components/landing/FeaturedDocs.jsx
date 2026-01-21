import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Skeleton,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ArrowForward as ArrowIcon,
  TrendingUp as TrendingIcon,
  NewReleases as NewIcon,
  Download as DownloadIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import DocumentCard from "../documents/DocumentCard";
import documentsAPI from "../../api/documents.api";

/**
 * FeaturedDocs Component - VLU Design System v2.0
 * Hiển thị tài liệu nổi bật với tabs filter
 */
const FeaturedDocs = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("newest");

  // Tab options
  const tabOptions = [
    { value: "newest", label: "Mới nhất", icon: <NewIcon /> },
    { value: "popular", label: "Xem nhiều", icon: <TrendingIcon /> },
    { value: "most-downloaded", label: "Tải nhiều", icon: <DownloadIcon /> },
  ];

  /**
   * Fetch featured documents
   */
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await documentsAPI.getFeatured({
          type: activeTab,
          limit: 8,
        });

        if (response.status === "success") {
          setDocuments(response.data.documents || []);
        }
      } catch (err) {
        console.error("Error fetching featured documents:", err);
        setError("Không thể tải tài liệu nổi bật");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [activeTab]);

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setActiveTab(newValue);
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "white",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "#D32F2F",
                fontWeight: 700,
                fontSize: "0.875rem",
                letterSpacing: "0.1em",
                mb: 1,
                display: "block",
              }}
            >
              TÀI LIỆU NỔI BẬT
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "2.5rem" },
                color: "#1A1A2E",
              }}
            >
              Khám phá kho tài liệu
            </Typography>
          </Box>

          {/* Tabs Filter */}
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={handleTabChange}
            sx={{
              bgcolor: "#F5F5F5",
              borderRadius: "12px",
              p: 0.5,
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "10px",
                px: 2.5,
                py: 1,
                fontWeight: 600,
                fontSize: "0.9375rem",
                textTransform: "none",
                color: "#4A4A68",
                gap: 1,
                "&.Mui-selected": {
                  bgcolor: "white",
                  color: "#D32F2F",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  "&:hover": {
                    bgcolor: "white",
                  },
                },
                "&:hover": {
                  bgcolor: alpha("#D32F2F", 0.05),
                },
              },
            }}
          >
            {tabOptions.map((tab) => (
              <ToggleButton key={tab.value} value={tab.value}>
                {tab.icon}
                <Box
                  component="span"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  {tab.label}
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Documents Grid */}
        {loading ? (
          // Loading Skeleton
          <Grid container spacing={3}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    bgcolor: "#F5F5F5",
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    animation="wave"
                  />
                  <Box sx={{ p: 2 }}>
                    <Skeleton width="30%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="100%" height={28} sx={{ mb: 0.5 }} />
                    <Skeleton width="80%" height={28} sx={{ mb: 1 }} />
                    <Skeleton width="60%" height={20} />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          // Error State
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "#FFF5F5",
              borderRadius: "16px",
            }}
          >
            <Typography sx={{ color: "#D32F2F", fontWeight: 600 }}>
              {error}
            </Typography>
          </Box>
        ) : documents.length > 0 ? (
          // Documents Grid
          <Grid container spacing={3}>
            {documents.map((doc, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={doc.id || doc._id}
                sx={{
                  animation: "fadeInUp 0.4s ease forwards",
                  animationDelay: `${index * 0.05}s`,
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
        ) : (
          // Empty State
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "#F5F5F5",
              borderRadius: "16px",
            }}
          >
            <Typography sx={{ color: "#8E8EA9" }}>
              Chưa có tài liệu nào
            </Typography>
          </Box>
        )}

        {/* View All Button */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            onClick={() => navigate("/documents")}
            sx={{
              bgcolor: "#D32F2F",
              color: "white",
              borderRadius: "14px",
              px: 5,
              py: 1.75,
              fontSize: "1.0625rem",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 4px 20px rgba(211,47,47,0.3)",
              "&:hover": {
                bgcolor: "#B71C1C",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 30px rgba(211,47,47,0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Xem tất cả tài liệu
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedDocs;
