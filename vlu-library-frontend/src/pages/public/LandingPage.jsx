import { Box } from "@mui/material";
import Header from "../../components/common/Header";
import HeroSection from "../../components/landing/HeroSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import FeaturedDocs from "../../components/landing/FeaturedDocs";
import StatsSection from "../../components/landing/StatsSection";
import Footer from "../../components/landing/Footer";

/**
 * LandingPage Component - VLU Design System v2.0
 * Trang chủ của Thư viện số VLU
 *
 * Cấu trúc:
 * 1. Header (Navigation)
 * 2. HeroSection (Banner + Search)
 * 3. FeaturesSection (Tính năng nổi bật)
 * 4. FeaturedDocs (Tài liệu nổi bật)
 * 5. StatsSection (Thống kê)
 * 6. Footer (Chân trang)
 */
const LandingPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header - Fixed at top */}
      <Header />

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        {/* Hero Section - Banner với Search */}
        <HeroSection />

        {/* Features Section - Tính năng nổi bật */}
        <FeaturesSection />

        {/* Featured Documents - Tài liệu nổi bật */}
        <FeaturedDocs />

        {/* Stats Section - Thống kê ấn tượng */}
        <StatsSection />
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default LandingPage;
