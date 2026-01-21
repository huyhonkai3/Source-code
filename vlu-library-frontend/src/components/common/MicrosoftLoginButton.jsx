import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  alpha,
} from "@mui/material";

/**
 * Microsoft Logo SVG Component
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
 * MicrosoftLoginButton - VLU Design System v2.0.1
 * Modern & Bold với enhanced styling + font sizes tăng
 */
const MicrosoftLoginButton = ({ onLoginSuccess, onError }) => {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      const accessToken = loginResponse.accessToken;
      const userEmail = loginResponse.account.username;

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

      if (e.message && e.message.includes("AADSTS90094")) {
        alert(
          "LỖI QUYỀN TRUY CẬP: Ứng dụng này chưa được Admin trường Văn Lang cấp phép.\n\nGiải pháp: Vui lòng liên hệ Admin IT trường hoặc sử dụng Email cá nhân để đăng nhập (nếu hệ thống cho phép).",
        );
      } else if (e.message && e.message.includes("AADSTS65001")) {
        alert(
          "Tài khoản của bạn không có quyền cấp phép cho ứng dụng bên thứ 3. Vui lòng liên hệ Admin trường.",
        );
      } else if (e.errorCode !== "user_cancelled") {
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
        borderColor: "#E0E0E0",
        backgroundColor: "white",
        color: "#1A1A2E",
        textTransform: "none",
        fontSize: "0.9375rem",
        fontWeight: 600,
        borderRadius: "12px",
        position: "relative",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "#FAFAFC",
          borderColor: "#C4C4D4",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-1px)",
        },
        "&:active": {
          backgroundColor: "#F0F0F5",
          transform: "translateY(0)",
        },
        "&:disabled": {
          backgroundColor: "#F5F5F5",
          borderColor: "#E0E0E0",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={22} sx={{ color: "#8E8EA9" }} />
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
            sx={{ fontWeight: 600, color: "#1A1A2E", fontSize: "0.9375rem" }}
          >
            Đăng nhập bằng Microsoft
          </Typography>
        </Box>
      )}
    </Button>
  );
};

export default MicrosoftLoginButton;
