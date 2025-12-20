import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
} from "@mui/material";
import {
  WarningAmber as WarningIcon,
  Close as CloseIcon,
  ListAlt as ListIcon,
  DriveFileMove as MoveIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";

/**
 * CannotDeleteDialog Component
 * Dialog hiển thị khi không thể xóa danh mục do có tài liệu
 *
 * @param {boolean} open - Dialog visibility
 * @param {Function} onClose - Close handler
 * @param {Object} category - Category data with name and documentCount
 * @param {Function} onViewDocs - Handler to view documents in this category
 * @param {Function} onMoveDocs - Handler to move documents (future feature)
 */
const CannotDeleteDialog = ({
  open,
  onClose,
  category,
  onViewDocs,
  onMoveDocs,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: "warning.dark",
          pb: 2,
        }}
      >
        {/* Warning Icon */}
        <WarningIcon
          sx={{
            fontSize: 28,
            color: "warning.main",
          }}
        />

        {/* Title Text */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ flex: 1, color: "warning.dark" }}
        >
          Không thể xóa Danh mục
        </Typography>

        {/* Close Button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 0 }}>
        {/* Main Message */}
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            lineHeight: 1.6,
          }}
        >
          Danh mục{" "}
          <Typography
            component="span"
            variant="body1"
            fontWeight="bold"
            color="text.primary"
          >
            "{category?.name}"
          </Typography>{" "}
          hiện đang chứa{" "}
          <Typography
            component="span"
            variant="body1"
            fontWeight="bold"
            color="error.main"
          >
            {category?.documentCount || 0} tài liệu
          </Typography>
          .
        </Typography>

        {/* Instruction */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bạn cần di chuyển hoặc xóa các tài liệu này trước khi xóa danh mục.
        </Typography>

        {/* Action Suggestions Section */}
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          sx={{
            display: "block",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Gợi ý xử lý
        </Typography>

        {/* Action List */}
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            p: 0,
          }}
        >
          {/* View Documents Action */}
          <ListItemButton
            onClick={onViewDocs}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1.5,
              py: 1.5,
              px: 2,
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.lighter",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ListIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Xem danh sách tài liệu"
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
            <ArrowIcon sx={{ color: "text.secondary" }} />
          </ListItemButton>

          {/* Move Documents Action */}
          <ListItemButton
            onClick={onMoveDocs}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1.5,
              py: 1.5,
              px: 2,
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.lighter",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <MoveIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Di chuyển toàn bộ sang danh mục khác"
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
            <ArrowIcon sx={{ color: "text.secondary" }} />
          </ListItemButton>
        </List>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          fullWidth
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
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CannotDeleteDialog;
