import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Skeleton,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Description as DocumentIcon,
  Visibility as ViewIcon,
  CloudDownload as DownloadIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "../../components/common/Header";
import UserSidebar from "../../components/user/UserSidebar";
import documentsAPI from "../../api/documents.api";

/**
 * AuthorStatsPage Component - VLU Design System v2.0
 * Trang thống kê sáng tạo cho Author với GenZ/Modern style
 *
 * Features:
 * - Line Chart hiển thị tần suất upload theo thời gian
 * - Toggle filter: Ngày | Tháng | Năm
 * - Date picker tương ứng với filter
 * - Summary cards với animated numbers
 */
const AuthorStatsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State
  const [period, setPeriod] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data from API
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    totalDocuments: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalViews: 0,
    totalDownloads: 0,
  });

  /**
   * Fetch stats when period or date changes
   */
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await documentsAPI.getAuthorStats({
          period,
          date: selectedDate.toISOString(),
        });

        if (response.status === "success") {
          setChartData(response.data.chartData || []);
          setSummary(response.data.summary || {});
        }
      } catch (err) {
        console.error("Error fetching author stats:", err);
        setError("Không thể tải thống kê. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, selectedDate]);

  /**
   * Handle period change
   */
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  /**
   * Handle date change
   */
  const handleDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSelectedDate(new Date(value));
    }
  };

  /**
   * Get date input type based on period
   */
  const getDateInputType = () => {
    if (period === "day") return "date";
    if (period === "month") return "month";
    return "number"; // year
  };

  /**
   * Get date input value
   */
  const getDateInputValue = () => {
    if (period === "day") {
      return format(selectedDate, "yyyy-MM-dd");
    }
    if (period === "month") {
      return format(selectedDate, "yyyy-MM");
    }
    return selectedDate.getFullYear().toString();
  };

  /**
   * Format number with K/M suffix
   */
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString("vi-VN");
  };

  /**
   * Get period label for display
   */
  const getPeriodLabel = () => {
    if (period === "day") {
      return format(selectedDate, "dd/MM/yyyy", { locale: vi });
    }
    if (period === "month") {
      return format(selectedDate, "MMMM yyyy", { locale: vi });
    }
    return selectedDate.getFullYear().toString();
  };

  /**
   * Custom Tooltip for Chart
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "#1A1A2E",
            color: "white",
            p: 1.5,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
            {period === "day" && `${label}`}
            {period === "month" && `Ngày ${label}`}
            {period === "year" && `Tháng ${label.replace("T", "")}`}
          </Typography>
          <Typography
            sx={{
              color: "#D32F2F",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            {payload[0].value} tài liệu
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Summary cards config
  const summaryCards = [
    {
      icon: DocumentIcon,
      label: "Tổng tài liệu",
      value: summary.totalDocuments,
      color: "#D32F2F",
      bgColor: alpha("#D32F2F", 0.1),
    },
    {
      icon: ApprovedIcon,
      label: "Đã duyệt",
      value: summary.approved,
      color: "#4CAF50",
      bgColor: alpha("#4CAF50", 0.1),
    },
    {
      icon: PendingIcon,
      label: "Chờ duyệt",
      value: summary.pending,
      color: "#FF9800",
      bgColor: alpha("#FF9800", 0.1),
    },
    {
      icon: ViewIcon,
      label: "Lượt xem",
      value: summary.totalViews,
      color: "#2196F3",
      bgColor: alpha("#2196F3", 0.1),
    },
    {
      icon: DownloadIcon,
      label: "Lượt tải",
      value: summary.totalDownloads,
      color: "#7C4DFF",
      bgColor: alpha("#7C4DFF", 0.1),
    },
    {
      icon: RejectedIcon,
      label: "Bị từ chối",
      value: summary.rejected,
      color: "#F44336",
      bgColor: alpha("#F44336", 0.1),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFC" }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
        <Grid container spacing={4}>
          {/* ========== SIDEBAR ========== */}
          <Grid item xs={12} md={3} lg={2.5}>
            <UserSidebar active="stats" />
          </Grid>

          {/* ========== MAIN CONTENT ========== */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* ========== PAGE HEADER ========== */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    bgcolor: alpha("#D32F2F", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 28, color: "#D32F2F" }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "#1A1A2E",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: { xs: "1.75rem", md: "2.125rem" },
                    }}
                  >
                    Thống kê sáng tạo 📊
                  </Typography>
                  <Typography
                    sx={{
                      color: "#8E8EA9",
                      fontSize: "1rem",
                    }}
                  >
                    Theo dõi hành trình đóng góp tri thức của bạn
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ========== FILTER BAR ========== */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: "20px",
                bgcolor: "white",
                border: "1px solid #F0F0F5",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 3,
              }}
            >
              {/* Period Toggle */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#8E8EA9",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Xem theo
                </Typography>
                <ToggleButtonGroup
                  value={period}
                  exclusive
                  onChange={handlePeriodChange}
                  sx={{
                    bgcolor: "#F5F5F5",
                    borderRadius: "14px",
                    p: 0.5,
                    "& .MuiToggleButton-root": {
                      border: "none",
                      borderRadius: "12px !important",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      textTransform: "none",
                      color: "#4A4A68",
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
                  <ToggleButton value="day">Ngày</ToggleButton>
                  <ToggleButton value="month">Tháng</ToggleButton>
                  <ToggleButton value="year">Năm</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Date Picker */}
              <Box sx={{ flex: 1, maxWidth: 250 }}>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#8E8EA9",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Chọn thời gian
                </Typography>
                {period === "year" ? (
                  <TextField
                    type="number"
                    value={selectedDate.getFullYear()}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      if (year >= 2000 && year <= 2100) {
                        setSelectedDate(new Date(year, 0, 1));
                      }
                    }}
                    inputProps={{ min: 2000, max: 2100 }}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#FAFAFC",
                      },
                    }}
                  />
                ) : (
                  <TextField
                    type={getDateInputType()}
                    value={getDateInputValue()}
                    onChange={handleDateChange}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#FAFAFC",
                      },
                    }}
                  />
                )}
              </Box>

              {/* Current Period Display */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  bgcolor: alpha("#D32F2F", 0.08),
                  borderRadius: "12px",
                  ml: "auto",
                }}
              >
                <CalendarIcon sx={{ color: "#D32F2F", fontSize: 20 }} />
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#D32F2F",
                    fontSize: "0.9375rem",
                    textTransform: "capitalize",
                  }}
                >
                  {getPeriodLabel()}
                </Typography>
              </Box>
            </Paper>

            {/* ========== SUMMARY CARDS ========== */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {summaryCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Grid item xs={6} sm={4} md={2} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: "16px",
                        bgcolor: "white",
                        border: "1px solid #F0F0F5",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 24px rgba(26,26,46,0.08)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "12px",
                          bgcolor: card.bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 1.5,
                        }}
                      >
                        <IconComponent
                          sx={{ fontSize: 24, color: card.color }}
                        />
                      </Box>
                      {loading ? (
                        <Skeleton width={60} height={36} sx={{ mx: "auto" }} />
                      ) : (
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: "1.5rem",
                            color: "#1A1A2E",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {formatNumber(card.value)}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          color: "#8E8EA9",
                          fontWeight: 500,
                        }}
                      >
                        {card.label}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* ========== CHART SECTION ========== */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                bgcolor: "white",
                border: "1px solid #F0F0F5",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: "#1A1A2E",
                    }}
                  >
                    Biểu đồ tải lên
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.9375rem",
                      color: "#8E8EA9",
                    }}
                  >
                    Số tài liệu đã tải lên theo{" "}
                    {period === "day"
                      ? "giờ"
                      : period === "month"
                        ? "ngày"
                        : "tháng"}
                  </Typography>
                </Box>
              </Box>

              {/* Chart */}
              {loading ? (
                <Box sx={{ height: 350 }}>
                  <Skeleton
                    variant="rectangular"
                    height="100%"
                    sx={{ borderRadius: "16px" }}
                  />
                </Box>
              ) : error ? (
                <Box
                  sx={{
                    height: 350,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#FFF5F5",
                    borderRadius: "16px",
                  }}
                >
                  <Typography sx={{ color: "#D32F2F" }}>{error}</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 350, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#D32F2F"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#D32F2F"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#F0F0F5"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#8E8EA9", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#8E8EA9", fontSize: 12 }}
                        dx={-10}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#D32F2F"
                        strokeWidth={3}
                        fill="url(#colorValue)"
                        dot={{
                          fill: "#D32F2F",
                          strokeWidth: 2,
                          stroke: "white",
                          r: 4,
                        }}
                        activeDot={{
                          fill: "#D32F2F",
                          strokeWidth: 3,
                          stroke: "white",
                          r: 8,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {/* Chart Footer */}
              {!loading && !error && (
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "1px solid #F0F0F5",
                    display: "flex",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#D32F2F",
                      }}
                    />
                    <Typography sx={{ fontSize: "0.875rem", color: "#4A4A68" }}>
                      Tổng: <strong>{summary.totalDocuments}</strong> tài liệu
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#4CAF50",
                      }}
                    />
                    <Typography sx={{ fontSize: "0.875rem", color: "#4A4A68" }}>
                      Đã duyệt: <strong>{summary.approved}</strong>
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthorStatsPage;
