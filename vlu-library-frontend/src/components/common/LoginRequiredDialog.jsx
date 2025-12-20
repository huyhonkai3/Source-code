import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/**
 * LoginRequiredDialog Component
 * Dialog yêu cầu đăng nhập để thực hiện hành động
 *
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Callback khi đóng dialog
 * @param {string} action - Hành động yêu cầu login (default: "tải tài liệu")
 */
const LoginRequiredDialog = ({ open, onClose, action = "tải tài liệu" }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Save current path to redirect after login
    localStorage.setItem("redirectPath", window.location.pathname);
    navigate("/login");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 32, color: "text.secondary" }} />
        </Box>
        <Typography variant="h6" fontWeight="bold">
          Yêu cầu đăng nhập
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", lineHeight: 1.7 }}
        >
          Bạn cần là sinh viên hoặc giảng viên của Đại học Văn Lang để {action}.
          Vui lòng đăng nhập để tiếp tục.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            bgcolor: "error.main",
            py: 1.2,
            "&:hover": {
              bgcolor: "error.dark",
            },
          }}
        >
          Đăng nhập để tải xuống
        </Button>
        <Button fullWidth variant="text" onClick={onClose} sx={{ py: 1 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginRequiredDialog;
