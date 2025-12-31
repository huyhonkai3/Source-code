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
  alpha,
  Chip,
} from "@mui/material";
import {
  WarningAmber as WarningIcon,
  Close as CloseIcon,
  ListAlt as ListIcon,
  DriveFileMove as MoveIcon,
  ArrowForward as ArrowIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

/**
 * CannotDeleteDialog Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const CannotDeleteDialog = ({
  open,
  onClose,
  category,
  onViewDocs,
  onMoveDocs,
}) => {
  const documentCount = category?.documentCount || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
          color: "white",
          p: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: "1.25rem",
                }}
              >
                Không thể xóa Danh mục
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.25, fontSize: "0.9375rem" }}
              >
                Danh mục đang chứa tài liệu
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2.5,
            borderRadius: "16px",
            bgcolor: "#FAFAFC",
            border: "1px solid",
            borderColor: "#E0E0E0",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(124, 77, 255, 0.3)",
            }}
          >
            <FolderIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 0.5,
                fontSize: "1.125rem",
              }}
            >
              {category?.name || "Danh mục"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                icon={<DocumentIcon sx={{ fontSize: "16px !important" }} />}
                label={`${documentCount} tài liệu`}
                size="small"
                sx={{
                  bgcolor: alpha("#EF4444", 0.1),
                  color: "#EF4444",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  "& .MuiChip-icon": { color: "#EF4444" },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            borderRadius: "12px",
            bgcolor: "#EFF6FF",
            border: "1px solid",
            borderColor: "#BFDBFE",
            mb: 3,
          }}
        >
          <InfoIcon
            sx={{ color: "#3B82F6", fontSize: 22, flexShrink: 0, mt: 0.25 }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#1E40AF", lineHeight: 1.6, fontSize: "0.9375rem" }}
          >
            Bạn cần di chuyển hoặc xóa các tài liệu trong danh mục này trước khi
            có thể xóa danh mục.
          </Typography>
        </Box>

        <Typography
          sx={{
            color: "#8E8EA9",
            fontWeight: 700,
            letterSpacing: "0.1em",
            display: "block",
            mb: 2,
            fontSize: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Gợi ý xử lý
        </Typography>

        <List sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 0 }}>
          <ListItemButton
            onClick={onViewDocs}
            sx={{
              border: "1px solid",
              borderColor: "#E0E0E0",
              borderRadius: "14px",
              py: 2,
              px: 2.5,
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#2196F3",
                bgcolor: alpha("#2196F3", 0.04),
                transform: "translateX(4px)",
                "& .arrow-icon": {
                  transform: "translateX(4px)",
                  color: "#2196F3",
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 48 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: alpha("#2196F3", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ListIcon sx={{ color: "#2196F3" }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="Xem danh sách tài liệu"
              secondary="Xem và quản lý các tài liệu trong danh mục này"
              primaryTypographyProps={{
                fontWeight: 600,
                color: "#1A1A2E",
                fontSize: "0.9375rem",
              }}
              secondaryTypographyProps={{
                color: "#8E8EA9",
                mt: 0.25,
                fontSize: "0.875rem",
              }}
            />
            <ArrowIcon
              className="arrow-icon"
              sx={{ color: "#C4C4D4", transition: "all 0.2s ease" }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={onMoveDocs}
            sx={{
              border: "1px solid",
              borderColor: "#E0E0E0",
              borderRadius: "14px",
              py: 2,
              px: 2.5,
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#10B981",
                bgcolor: alpha("#10B981", 0.04),
                transform: "translateX(4px)",
                "& .arrow-icon": {
                  transform: "translateX(4px)",
                  color: "#10B981",
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 48 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: alpha("#10B981", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MoveIcon sx={{ color: "#10B981" }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="Di chuyển toàn bộ sang danh mục khác"
              secondary="Chuyển tất cả tài liệu sang một danh mục khác"
              primaryTypographyProps={{
                fontWeight: 600,
                color: "#1A1A2E",
                fontSize: "0.9375rem",
              }}
              secondaryTypographyProps={{
                color: "#8E8EA9",
                mt: 0.25,
                fontSize: "0.875rem",
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label="Sắp ra mắt"
                size="small"
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#B45309",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 22,
                }}
              />
              <ArrowIcon
                className="arrow-icon"
                sx={{ color: "#C4C4D4", transition: "all 0.2s ease" }}
              />
            </Box>
          </ListItemButton>
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
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
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CannotDeleteDialog;
