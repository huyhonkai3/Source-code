import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";

/**
 * Microsoft Logo SVG Component
 * Logo chính thức của Microsoft với 4 ô màu
 */
const MicrosoftLogo = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 21 21"
  >
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

/**
 * MicrosoftLoginButton Component
 * Button đăng nhập bằng Microsoft với giao diện chuyên nghiệp
 *
 * @param {Function} onLoginSuccess - Callback khi đăng nhập thành công
 * @param {Function} onError - Callback khi có lỗi
 */
const MicrosoftLoginButton = ({ onLoginSuccess, onError }) => {
  const { instance } = useMsal();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Login Popup
      const loginResponse = await instance.loginPopup(loginRequest);

      const accessToken = loginResponse.accessToken;
      const userEmail = loginResponse.account.username;

      // Logic kiểm tra domain
      if (
        !userEmail.endsWith("@vanlanguni.vn") &&
        !userEmail.endsWith("@vlu.edu.vn")
      ) {
        alert(
          "Vui lòng sử dụng email Văn Lang (@vanlanguni.vn hoặc @vlu.edu.vn)",
        );
        await instance.logoutPopup();
        setLoading(false);
        return;
      }

      onLoginSuccess(accessToken);
    } catch (e) {
      console.error("Login Failed:", e);

      // Xử lý lỗi cụ thể của Azure AD
      if (e.message && e.message.includes("AADSTS90094")) {
        alert(
          "LỖI QUYỀN TRUY CẬP: Ứng dụng này chưa được Admin trường Văn Lang cấp phép.\n\nGiải pháp: Vui lòng liên hệ Admin IT trường hoặc sử dụng Email cá nhân để đăng nhập (nếu hệ thống cho phép).",
        );
      } else if (e.message && e.message.includes("AADSTS65001")) {
        alert(
          "Tài khoản của bạn không có quyền cấp phép cho ứng dụng bên thứ 3. Vui lòng liên hệ Admin trường.",
        );
      } else if (e.errorCode !== "user_cancelled") {
        // Không hiển thị lỗi nếu user tự cancel
        alert("Đăng nhập thất bại. Chi tiết: " + e.message);
      }

      if (onError) onError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleLogin}
      disabled={loading}
      sx={{
        mt: 2,
        py: 1.5,
        px: 3,
        borderColor: theme.palette.grey[300],
        backgroundColor: "white",
        color: theme.palette.text.primary,
        textTransform: "none",
        fontSize: "0.95rem",
        fontWeight: 500,
        borderRadius: 1,
        position: "relative",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: alpha(theme.palette.grey[100], 0.8),
          borderColor: theme.palette.grey[400],
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
        },
        "&:active": {
          backgroundColor: theme.palette.grey[200],
        },
        "&:disabled": {
          backgroundColor: theme.palette.grey[100],
          borderColor: theme.palette.grey[300],
        },
      }}
    >
      {loading ? (
        <CircularProgress size={22} sx={{ color: theme.palette.grey[600] }} />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          <MicrosoftLogo size={20} />
          <Typography
            component="span"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            Đăng nhập bằng Microsoft
          </Typography>
        </Box>
      )}
    </Button>
  );
};

export default MicrosoftLoginButton;
