import { Box, Container, Typography, Grid, alpha } from "@mui/material";
import {
  CloudDownload as CloudIcon,
  MenuBook as BookIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

/**
 * FeaturesSection Component - VLU Design System v2.0
 * Hiển thị các tính năng nổi bật của thư viện số
 */
const FeaturesSection = () => {
  const features = [
    {
      icon: CloudIcon,
      title: "Truy cập mọi lúc, mọi nơi",
      description:
        "Đọc và tải tài liệu trực tuyến 24/7 trên mọi thiết bị có kết nối Internet.",
      color: "#2196F3",
    },
    {
      icon: BookIcon,
      title: "Đa dạng định dạng",
      description:
        "Hỗ trợ nhiều định dạng file phổ biến: PDF, EPUB phù hợp với mọi nhu cầu đọc.",
      color: "#7C4DFF",
    },
    {
      icon: SearchIcon,
      title: "Tra cứu thông minh",
      description:
        "Công cụ tìm kiếm mạnh mẽ với bộ lọc đa dạng giúp tìm tài liệu nhanh chóng.",
      color: "#FF7043",
    },
    {
      icon: GroupsIcon,
      title: "Cộng đồng học thuật",
      description:
        "Kết nối với hàng nghìn sinh viên, giảng viên và chia sẻ kiến thức cùng nhau.",
      color: "#00BCD4",
    },
    {
      icon: SpeedIcon,
      title: "Hiệu suất cao",
      description:
        "Hệ thống tối ưu, tốc độ tải nhanh, trải nghiệm đọc mượt mà không gián đoạn.",
      color: "#4CAF50",
    },
    {
      icon: SecurityIcon,
      title: "Bảo mật an toàn",
      description:
        "Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn cao nhất, đảm bảo quyền riêng tư.",
      color: "#E91E63",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "#FAFAFA",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
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
            TÍNH NĂNG NỔI BẬT
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.75rem" },
              color: "#1A1A2E",
              mb: 2,
            }}
          >
            Tại sao chọn Thư viện VLU?
          </Typography>
          <Typography
            sx={{
              color: "#4A4A68",
              fontSize: "1.125rem",
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Nền tảng học thuật số hiện đại, được thiết kế để mang đến trải
            nghiệm tốt nhất cho sinh viên và giảng viên.
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: "white",
                    borderRadius: "24px",
                    boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                    border: "1px solid #F0F0F5",
                    transition: "all 0.3s ease",
                    cursor: "default",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(26,26,46,0.12)",
                      borderColor: alpha(feature.color, 0.3),
                      "& .feature-icon": {
                        transform: "scale(1.1) rotate(5deg)",
                        bgcolor: feature.color,
                        color: "white",
                      },
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    className="feature-icon"
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "20px",
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <IconComponent sx={{ fontSize: 36 }} />
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: "#1A1A2E",
                      mb: 1.5,
                    }}
                  >
                    {feature.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    sx={{
                      color: "#4A4A68",
                      fontSize: "1rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
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

export default FeaturesSection;
