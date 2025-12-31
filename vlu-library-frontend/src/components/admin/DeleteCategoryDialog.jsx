import React from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  Alert,
  Avatar,
  IconButton,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

/**
 * DeleteCategoryDialog Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const DeleteCategoryDialog = ({
  open,
  onClose,
  onConfirm,
  categoryName = "",
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
    >
      <Box
        sx={{
          height: 6,
          background: "linear-gradient(90deg, #EF4444 0%, #F87171 100%)",
        }}
      />
      <IconButton
        onClick={onClose}
        disabled={loading}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "#8E8EA9",
          bgcolor: "#F0F0F5",
          "&:hover": { bgcolor: "#E0E0E8" },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Box sx={{ textAlign: "center", p: 4, pt: 5 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            mx: "auto",
            mb: 3,
            borderRadius: "24px",
            background: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%, 100%": {
                transform: "scale(1)",
                boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)",
              },
              "50%": {
                transform: "scale(1.02)",
                boxShadow: "0 0 0 10px rgba(239, 68, 68, 0)",
              },
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: 48, color: "#EF4444" }} />
          <Box
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 32,
              height: 32,
              borderRadius: "10px",
              bgcolor: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
            }}
          >
            <WarningIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#1A1A2E",
            mb: 1.5,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: "1.5rem",
          }}
        >
          Xóa Danh mục?
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#4A4A68", mb: 3, lineHeight: 1.6, fontSize: "1rem" }}
        >
          Bạn có chắc chắn muốn xóa danh mục{" "}
          <Typography
            component="span"
            sx={{
              fontWeight: 700,
              color: "#1A1A2E",
              bgcolor: "#F0F0F5",
              px: 1,
              py: 0.25,
              borderRadius: "6px",
            }}
          >
            {categoryName}
          </Typography>
          ?
        </Typography>

        <Alert
          severity="error"
          icon={false}
          sx={{
            mb: 4,
            textAlign: "left",
            borderRadius: "12px",
            bgcolor: "#FEF2F2",
            border: "1px solid",
            borderColor: "#FECACA",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WarningIcon sx={{ color: "#EF4444", fontSize: 20 }} />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#B91C1C", fontWeight: 500, fontSize: "0.9375rem" }}
            >
              Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.
            </Typography>
          </Box>
        </Alert>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onConfirm}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.9375rem",
              bgcolor: "#EF4444",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
              "&:hover": {
                bgcolor: "#DC2626",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.5)",
              },
            }}
          >
            {loading ? "Đang xóa..." : "Có, Xóa ngay"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.9375rem",
              borderColor: "#E0E0E0",
              color: "#4A4A68",
              "&:hover": { borderColor: "#C4C4D4", bgcolor: "#F0F0F5" },
            }}
          >
            Không, Giữ lại
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
