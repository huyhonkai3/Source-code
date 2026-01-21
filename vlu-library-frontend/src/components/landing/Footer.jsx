import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  alpha,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

/**
 * Footer Component - VLU Design System v2.0
 * Chân trang với thông tin liên hệ và links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Tìm kiếm tài liệu", href: "/documents" },
    { label: "Đăng nhập", href: "/login" },
    { label: "Đăng ký", href: "/register" },
  ];

  const supportLinks = [
    { label: "Hướng dẫn sử dụng", href: "#" },
    { label: "Câu hỏi thường gặp", href: "#" },
    { label: "Chính sách bảo mật", href: "#" },
    { label: "Điều khoản sử dụng", href: "#" },
  ];

  const socialLinks = [
    {
      icon: FacebookIcon,
      href: "https://facebook.com/vanlanguni",
      color: "#1877F2",
    },
    {
      icon: YouTubeIcon,
      href: "https://youtube.com/vanlanguni",
      color: "#FF0000",
    },
    {
      icon: LinkedInIcon,
      href: "https://linkedin.com/school/vanlanguni",
      color: "#0A66C2",
    },
    {
      icon: InstagramIcon,
      href: "https://instagram.com/vanlanguni",
      color: "#E4405F",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1A1A2E",
        color: "white",
        pt: { xs: 6, md: 8 },
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo & Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              {/* Logo */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    bgcolor: "#D32F2F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                  }}
                >
                  VLU
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      lineHeight: 1.2,
                    }}
                  >
                    Thư viện số
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Đại học Văn Lang
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.7,
                  mb: 3,
                }}
              >
                Thư viện số VLU - Nền tảng học thuật trực tuyến hàng đầu, cung
                cấp hàng nghìn tài liệu chất lượng cho sinh viên và giảng viên
                Đại học Văn Lang.
              </Typography>

              {/* Social Links */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <IconButton
                      key={index}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        bgcolor: "rgba(255,255,255,0.05)",
                        "&:hover": {
                          color: social.color,
                          bgcolor: alpha(social.color, 0.15),
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconComponent />
                    </IconButton>
                  );
                })}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                mb: 2.5,
                color: "white",
              }}
            >
              Truy cập nhanh
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {quickLinks.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: "0.9375rem",
                      transition: "color 0.2s",
                      "&:hover": {
                        color: "#D32F2F",
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Support Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                mb: 2.5,
                color: "white",
              }}
            >
              Hỗ trợ
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {supportLinks.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
                    href={link.href}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: "0.9375rem",
                      transition: "color 0.2s",
                      "&:hover": {
                        color: "#D32F2F",
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={4} md={4}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                mb: 2.5,
                color: "white",
              }}
            >
              Liên hệ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <LocationIcon
                  sx={{ color: "#D32F2F", fontSize: 20, mt: 0.3 }}
                />
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                  }}
                >
                  69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, TP.HCM
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon sx={{ color: "#D32F2F", fontSize: 20 }} />
                <Link
                  href="tel:02871099221"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    "&:hover": { color: "#D32F2F" },
                  }}
                >
                  (028) 7109 9221
                </Link>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon sx={{ color: "#D32F2F", fontSize: 20 }} />
                <Link
                  href="mailto:library@vlu.edu.vn"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    "&:hover": { color: "#D32F2F" },
                  }}
                >
                  library@vlu.edu.vn
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider
          sx={{
            my: 4,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        />

        {/* Copyright */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.875rem",
            }}
          >
            © {currentYear} Thư viện số Đại học Văn Lang. Bản quyền thuộc về
            VLU.
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.875rem",
            }}
          >
            Phát triển bởi{" "}
            <Link
              href="#"
              sx={{
                color: "#D32F2F",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              VLU IT Team
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
