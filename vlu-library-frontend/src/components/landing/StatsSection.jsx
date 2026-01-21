import { useState, useEffect, useRef } from "react";
import { Box, Container, Typography, Grid, alpha } from "@mui/material";
import {
  MenuBook as BookIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  CloudDownload as DownloadIcon,
} from "@mui/icons-material";
import documentsAPI from "../../api/documents.api";

/**
 * Animated Counter Hook
 * Tạo hiệu ứng đếm số từ 0 đến target
 */
const useCountUp = (target, duration = 2000, startCounting = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting || target === 0) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration, startCounting]);

  return count;
};

/**
 * Format number with K/M suffix
 */
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString("vi-VN");
};

/**
 * StatsSection Component - VLU Design System v2.0
 * Hiển thị thống kê ấn tượng với animated counters
 */
const StatsSection = () => {
  const [stats, setStats] = useState({
    documents: 0,
    users: 0,
    views: 0,
    downloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Animated counts
  const documentsCount = useCountUp(stats.documents, 2000, isVisible);
  const usersCount = useCountUp(stats.users, 2000, isVisible);
  const viewsCount = useCountUp(stats.views, 2500, isVisible);
  const downloadsCount = useCountUp(stats.downloads, 2500, isVisible);

  /**
   * Fetch public stats
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await documentsAPI.getPublicStats();
        if (response.status === "success") {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Fallback data
        setStats({
          documents: 1250,
          users: 3500,
          views: 45000,
          downloads: 12000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /**
   * Intersection Observer for animation trigger
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const statsData = [
    {
      icon: BookIcon,
      value: documentsCount,
      label: "Tài liệu",
      suffix: "+",
      color: "#2196F3",
    },
    {
      icon: PeopleIcon,
      value: usersCount,
      label: "Thành viên",
      suffix: "+",
      color: "#7C4DFF",
    },
    {
      icon: ViewIcon,
      value: viewsCount,
      label: "Lượt xem",
      suffix: "+",
      color: "#00BCD4",
    },
    {
      icon: DownloadIcon,
      value: downloadsCount,
      label: "Lượt tải",
      suffix: "+",
      color: "#4CAF50",
    },
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        py: { xs: 8, md: 10 },
        position: "relative",
        overflow: "hidden",
        // Background gradient
        background: `linear-gradient(135deg, #1A1A2E 0%, #D32F2F 100%)`,
        // Pattern overlay
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        },
      }}
    >
      {/* Floating Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          filter: "blur(40px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,193,7,0.1)",
          filter: "blur(50px)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.15em",
              mb: 1,
              display: "block",
            }}
          >
            NHỮNG CON SỐ BIẾT NÓI
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "white",
            }}
          >
            Thư viện số đang phát triển mạnh mẽ
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={4} justifyContent="center">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid item xs={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: { xs: 3, md: 4 },
                    borderRadius: "24px",
                    bgcolor: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.12)",
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "16px",
                      bgcolor: alpha(stat.color, 0.2),
                      color: stat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 32 }} />
                  </Box>

                  {/* Value */}
                  <Typography
                    sx={{
                      fontSize: { xs: "2rem", md: "2.75rem" },
                      fontWeight: 800,
                      color: "white",
                      lineHeight: 1,
                      mb: 1,
                    }}
                  >
                    {loading ? (
                      "..."
                    ) : (
                      <>
                        {formatNumber(stat.value)}
                        <Box
                          component="span"
                          sx={{ color: "#FFC107", fontSize: "0.75em" }}
                        >
                          {stat.suffix}
                        </Box>
                      </>
                    )}
                  </Typography>

                  {/* Label */}
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection;
