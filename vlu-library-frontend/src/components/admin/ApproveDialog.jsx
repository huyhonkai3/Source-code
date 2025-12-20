import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  CheckCircleOutline as CheckCircleIcon,
  Close as CloseIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";

const ApproveDialog = ({
  open = false,
  onClose = () => {},
  onConfirm = () => {},
  documentTitle = "",
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="xs"
      fullWidth
    >
      <IconButton
        onClick={onClose}
        disabled={loading}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "text.secondary",
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ textAlign: "center", py: 5, px: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "success.main" }} />
        </Box>

        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Duyệt tài liệu này?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, lineHeight: 1.6 }}
        >
          Tài liệu{" "}
          <Typography
            component="span"
            variant="body2"
            fontWeight="bold"
            color="text.primary"
          >
            "{documentTitle}"
          </Typography>
          <br />
          sẽ được công khai trên thư viện ngay lập tức.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            fullWidth
            onClick={onConfirm}
            disabled={loading}
            startIcon={<PublishIcon />}
            sx={{
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {loading ? "Đang xử lý..." : "Có, Duyệt & Công khai"}
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="large"
            fullWidth
            onClick={onClose}
            disabled={loading}
            sx={{
              py: 1.5,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "1rem",
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": {
                borderColor: "text.secondary",
                backgroundColor: "action.hover",
              },
            }}
          >
            Hủy bỏ
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveDialog;
