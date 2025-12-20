import React from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  Alert,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

/**
 * DeleteCategoryDialog Component
 * Confirmation dialog for deleting a category
 *
 * @param {boolean} open - Dialog visibility
 * @param {Function} onClose - Close handler
 * @param {Function} onConfirm - Confirm delete handler
 * @param {string} categoryName - Category name to delete
 * @param {boolean} loading - Loading state
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
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Close Button */}
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

      {/* Dialog Content */}
      <Box
        sx={{
          textAlign: "center",
          p: 4,
          pt: 5,
        }}
      >
        {/* Delete Icon */}
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 3,
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            color: "error.main",
          }}
        >
          <DeleteIcon sx={{ fontSize: 40 }} />
        </Avatar>

        {/* Title */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Xóa Danh mục
        </Typography>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bạn có chắc chắn muốn xóa danh mục{" "}
          <Typography
            component="span"
            variant="body2"
            fontWeight="bold"
            color="text.primary"
          >
            "{categoryName}"
          </Typography>
          ?
        </Typography>

        {/* Warning Alert */}
        <Alert
          severity="error"
          sx={{
            mb: 3,
            textAlign: "left",
          }}
        >
          Hành động này không thể hoàn tác.
        </Alert>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Delete Button */}
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={onConfirm}
            disabled={loading}
            startIcon={<DeleteIcon />}
            sx={{
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {loading ? "Đang xóa..." : "Có, Xóa ngay"}
          </Button>

          {/* Cancel Button */}
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={loading}
            sx={{
              py: 1.5,
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": {
                borderColor: "text.secondary",
                backgroundColor: "action.hover",
              },
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
